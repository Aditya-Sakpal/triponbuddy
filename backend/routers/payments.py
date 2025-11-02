"""
Payments API router for Razorpay paywall integration.
"""

from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Query, Request, status

from models.payment import (
    CreateOrderRequest,
    CreateOrderResponse,
    PaymentVerificationRequest,
    PaymentVerificationResponse,
    PlanListResponse,
    SubscriptionStatusResponse,
    WebhookAcknowledgeResponse,
)
from services.payment_service import RazorpayPaymentService, get_payment_service

router = APIRouter(prefix="/api/payments", tags=["payments"])


@router.get("/plans", response_model=PlanListResponse)
async def list_pricing_plans(
    service: RazorpayPaymentService = Depends(get_payment_service),
):
    """Return the currently available pricing plans."""

    return service.list_plans()


@router.post("/orders", response_model=CreateOrderResponse, status_code=status.HTTP_201_CREATED)
async def create_checkout_order(
    payload: CreateOrderRequest,
    service: RazorpayPaymentService = Depends(get_payment_service),
):
    """Create a Razorpay order for the selected plan."""

    return await service.create_order(payload)


@router.post("/verify", response_model=PaymentVerificationResponse)
async def verify_payment_signature(
    payload: PaymentVerificationRequest,
    service: RazorpayPaymentService = Depends(get_payment_service),
):
    """Verify the payment signature returned by Razorpay Checkout."""

    return await service.verify_payment(payload)


@router.get("/subscription", response_model=SubscriptionStatusResponse)
async def get_subscription_status(
    user_id: str = Query(..., description="Clerk user identifier"),
    service: RazorpayPaymentService = Depends(get_payment_service),
):
    """Fetch the latest subscription state for a user."""

    return await service.get_latest_subscription(user_id)


@router.post("/webhook", response_model=WebhookAcknowledgeResponse, status_code=status.HTTP_202_ACCEPTED)
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: Optional[str] = Header(default=None, alias="X-Razorpay-Signature"),
    service: RazorpayPaymentService = Depends(get_payment_service),
):
    """Handle Razorpay webhook callbacks for payment events."""

    body = await request.body()

    try:
        await service.handle_webhook(body, x_razorpay_signature)
    except HTTPException:
        raise
    except Exception as exc:  # pragma: no cover - guard against unexpected errors
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed processing webhook.") from exc

    return WebhookAcknowledgeResponse()
