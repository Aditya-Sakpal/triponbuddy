"""
Service layer for Razorpay-powered subscriptions.
"""

import json
import logging
from datetime import datetime, timezone
from typing import Any, Dict, Optional, Union
from uuid import uuid4

from fastapi import HTTPException, status

from config import settings
from database import mongodb
from models.payment import (
    CreateOrderRequest,
    CreateOrderResponse,
    PaymentVerificationRequest,
    PaymentVerificationResponse,
    PlanDetails,
    PlanListResponse,
    PricingPlan,
    SubscriptionStatusResponse,
)

from services.helpers.payment_helper import (
    PRICING_PLANS,
    BadRequestError,
    SignatureVerificationError,
    call_in_thread,
    ensure_razorpay_prerequisites,
    get_razorpay_client,
    plan_copy,
    razorpay,
)

logger = logging.getLogger(__name__)


class RazorpayPaymentService:
    """Encapsulates Razorpay order lifecycle and subscription persistence."""

    def __init__(self, client: Any) -> None:
        self._client = client

    def list_plans(self) -> PlanListResponse:
        """Expose available plans to API consumers."""

        plans = [plan_copy(plan) for plan in PRICING_PLANS.values()]
        return PlanListResponse(plans=plans)

    async def create_order(self, payload: CreateOrderRequest) -> CreateOrderResponse:
        """Create a Razorpay order and persist the draft subscription."""

        plan = self._get_plan(payload.plan)

        order_payload = self._build_order_payload(payload, plan)

        try:
            order = await call_in_thread(self._client.order.create, order_payload)
        except BadRequestError as exc:
            logger.error("Failed creating Razorpay order: %s", exc)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unable to create order with Razorpay."
            ) from exc
        except Exception as exc:
            logger.exception("Unexpected error while creating Razorpay order")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Upstream Razorpay error occurred."
            ) from exc

        subscription_id = await self._persist_subscription(payload, plan, order, order_payload)

        return CreateOrderResponse(
            order_id=order.get("id"),
            amount=order.get("amount"),
            currency=order.get("currency", plan.currency),
            receipt=order.get("receipt", order_payload.get("receipt")),
            razorpay_key_id=settings.razorpay_key_id,
            plan=plan_copy(plan),
            subscription_id=subscription_id,
        )

    async def verify_payment(self, payload: PaymentVerificationRequest) -> PaymentVerificationResponse:
        """Verify payment signature provided by Razorpay checkout."""

        subscription = await mongodb.find_one(
            "subscriptions",
            {"order_id": payload.razorpay_order_id, "user_id": payload.user_id}
        )

        if not subscription:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found for order.")

        signature_payload = {
            "razorpay_order_id": payload.razorpay_order_id,
            "razorpay_payment_id": payload.razorpay_payment_id,
            "razorpay_signature": payload.razorpay_signature,
        }

        try:
            await call_in_thread(self._client.utility.verify_payment_signature, signature_payload)
        except SignatureVerificationError as exc:
            await self._mark_subscription_failure(payload, str(exc))
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Signature verification failed.") from exc
        except Exception as exc:
            logger.exception("Unexpected error while verifying Razorpay signature")
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Razorpay verification failed.") from exc

        update_fields = {
            "status": "paid",
            "payment_id": payload.razorpay_payment_id,
            "signature": payload.razorpay_signature,
            "paid_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }

        await mongodb.update_one(
            "subscriptions",
            {"order_id": payload.razorpay_order_id, "user_id": payload.user_id},
            {"$set": update_fields}
        )

        plan_id = subscription.get("plan_id")
        if not plan_id:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Subscription has no pricing plan attached.")

        plan = self._get_plan(plan_id)

        return PaymentVerificationResponse(
            success=True,
            status="paid",
            plan=plan_copy(plan),
        )

    async def get_latest_subscription(self, user_id: str) -> SubscriptionStatusResponse:
        """Retrieve the most recent PAID subscription record for a user."""

        # First, check if user has any paid subscription
        paid_subscriptions = await mongodb.find_many(
            "subscriptions",
            {"user_id": user_id, "status": "paid"},
            limit=1,
            sort=[("paid_at", -1)],
        )

        if paid_subscriptions:
            subscription = paid_subscriptions[0]
            plan = self._get_plan(subscription.get("plan_id")) if subscription.get("plan_id") else None

            return SubscriptionStatusResponse(
                success=True,
                status="paid",
                plan=plan_copy(plan) if plan else None,
                order_id=subscription.get("order_id"),
                payment_id=subscription.get("payment_id"),
                updated_at=subscription.get("updated_at"),
            )

        # If no paid subscription, check the latest subscription for other statuses
        subscriptions = await mongodb.find_many(
            "subscriptions",
            {"user_id": user_id},
            limit=1,
            sort=[("created_at", -1)],
        )

        subscription = subscriptions[0] if subscriptions else None

        if not subscription:
            return SubscriptionStatusResponse(success=True, status="none", plan=None)

        plan = self._get_plan(subscription.get("plan_id")) if subscription.get("plan_id") else None

        return SubscriptionStatusResponse(
            success=True,
            status=subscription.get("status", "unknown"),
            plan=plan_copy(plan) if plan else None,
            order_id=subscription.get("order_id"),
            payment_id=subscription.get("payment_id"),
            updated_at=subscription.get("updated_at"),
        )

    async def handle_webhook(self, body: bytes, signature: Optional[str]) -> None:
        """Validate and persist Razorpay webhook notifications."""

        if not settings.razorpay_webhook_secret:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Webhook secret not configured.")

        if signature is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing Razorpay signature header.")

        payload_text = body.decode("utf-8")

        try:
            ensure_razorpay_prerequisites()
            razorpay.Utility.verify_webhook_signature(payload_text, signature, settings.razorpay_webhook_secret)  # type: ignore[no-untyped-call]
        except SignatureVerificationError as exc:
            logger.warning("Invalid Razorpay webhook signature: %s", exc)
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid webhook signature.") from exc
        except Exception as exc:
            logger.exception("Failed verifying Razorpay webhook signature")
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Webhook verification failed.") from exc

        try:
            payload = json.loads(payload_text)
        except json.JSONDecodeError as exc:
            logger.error("Malformed Razorpay webhook payload: %s", exc)
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid webhook payload.") from exc

        await self._process_webhook_event(payload)

    def _get_plan(self, plan_id: Union[PricingPlan, str]) -> PlanDetails:
        try:
            plan_key = plan_id if isinstance(plan_id, PricingPlan) else PricingPlan(plan_id)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported pricing plan selected.") from exc

        try:
            return PRICING_PLANS[plan_key]
        except KeyError as exc:  # pragma: no cover - defensive guard for unexpected data
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported pricing plan selected.") from exc

    def _build_order_payload(self, payload: CreateOrderRequest, plan: PlanDetails) -> Dict[str, Any]:
        receipt_reference = f"sub_{payload.plan.value}_{uuid4().hex[:10]}"

        notes = {
            "plan_id": payload.plan.value,
            "user_id": payload.user_id,
        }

        if payload.email:
            notes["customer_email"] = payload.email
        if payload.contact:
            notes["customer_contact"] = payload.contact

        if payload.notes:
            notes.update(payload.notes)

        order_payload: Dict[str, Any] = {
            "amount": plan.amount_paise,
            "currency": plan.currency,
            "receipt": receipt_reference,
            "notes": notes,
        }

        return order_payload

    async def _persist_subscription(
        self,
        request: CreateOrderRequest,
        plan: PlanDetails,
        order: Dict[str, Any],
        order_payload: Dict[str, Any],
    ) -> str:
        # Check if user already has a paid subscription for this plan
        existing_paid = await mongodb.find_one(
            "subscriptions",
            {"user_id": request.user_id, "plan_id": plan.id.value, "status": "paid"}
        )

        if existing_paid:
            # User already has a paid subscription for this plan
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"You are already subscribed to the {plan.name} plan."
            )

        document = {
            "user_id": request.user_id,
            "plan_id": plan.id.value,
            "plan_name": plan.name,
            "features": plan.features,
            "amount_paise": plan.amount_paise,
            "currency": plan.currency,
            "status": order.get("status", "created"),
            "order_id": order.get("id"),
            "receipt": order.get("receipt", order_payload.get("receipt")),
            "notes": order_payload.get("notes", {}),
            "checkout_context": {
                "email": request.email,
                "contact": request.contact,
            },
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }

        return await mongodb.insert_one("subscriptions", document)

    async def _mark_subscription_failure(self, payload: PaymentVerificationRequest, reason: str) -> None:
        update_fields = {
            "status": "verification_failed",
            "verification_error": reason,
            "updated_at": datetime.now(timezone.utc),
        }

        await mongodb.update_one(
            "subscriptions",
            {"order_id": payload.razorpay_order_id, "user_id": payload.user_id},
            {"$set": update_fields}
        )

    async def _process_webhook_event(self, payload: Dict[str, Any]) -> None:
        event = payload.get("event")

        if not event or "payment" not in event:
            logger.info("Ignoring Razorpay webhook event: %s", event)
            return

        payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
        order_id = payment_entity.get("order_id")

        if not order_id:
            logger.warning("Razorpay webhook missing order id: %s", payload)
            return

        status_map = {
            "payment.authorized": "authorized",
            "payment.captured": "paid",
            "payment.failed": "failed",
        }

        subscription_status = status_map.get(event)

        if not subscription_status:
            logger.info("Unhandled Razorpay payment event: %s", event)
            return

        update_fields: Dict[str, Any] = {
            "status": subscription_status,
            "payment_id": payment_entity.get("id"),
            "payment_method": payment_entity.get("method"),
            "payment_email": payment_entity.get("email"),
            "payment_contact": payment_entity.get("contact"),
            "payment_amount": payment_entity.get("amount"),
            "payment_currency": payment_entity.get("currency"),
            "webhook_event": event,
            "updated_at": datetime.now(timezone.utc),
        }

        if subscription_status == "failed":
            update_fields["failure_reason"] = payment_entity.get("error_description") or payment_entity.get("error_reason")
        elif subscription_status == "paid":
            update_fields["paid_at"] = datetime.now(timezone.utc)

        webhook_entry = {
            "event": event,
            "recorded_at": datetime.now(timezone.utc),
            "payment_id": payment_entity.get("id"),
            "status": payment_entity.get("status"),
        }

        await mongodb.update_one(
            "subscriptions",
            {"order_id": order_id},
            {
                "$set": update_fields,
                "$push": {"webhook_events": webhook_entry},
            },
        )


def get_payment_service() -> RazorpayPaymentService:
    """FastAPI dependency provider for the payment service."""

    try:
        client = get_razorpay_client()
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc

    return RazorpayPaymentService(client)
