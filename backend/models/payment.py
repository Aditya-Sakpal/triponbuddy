"""
Payment and subscription models for Razorpay integration.
"""

from enum import Enum
from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class PricingPlan(str, Enum):
    """Supported pricing plans for TripOnBuddy paywall."""

    STANDARD = "standard"
    GOLD = "gold"


class PlanDetails(BaseModel):
    """Details for an individual pricing plan."""

    id: PricingPlan = Field(..., description="Plan identifier")
    name: str = Field(..., description="Display name of the plan")
    amount_paise: int = Field(..., description="Plan price in paise for Razorpay")
    amount_display: str = Field(..., description="Human-friendly price label")
    currency: str = Field(default="INR", description="Transaction currency")
    features: List[str] = Field(default_factory=list, description="Plan benefits")


class PlanListResponse(BaseModel):
    """Response payload with available subscription plans."""

    success: bool = Field(default=True)
    plans: List[PlanDetails] = Field(...)


class CreateOrderRequest(BaseModel):
    """Payload for creating a Razorpay order."""

    user_id: str = Field(..., description="Clerk user identifier")
    plan: PricingPlan = Field(..., description="Selected pricing plan")
    email: Optional[str] = Field(default=None, description="Customer email")
    contact: Optional[str] = Field(default=None, description="Customer contact number")
    notes: Optional[Dict[str, str]] = Field(default=None, description="Additional metadata")


class CreateOrderResponse(BaseModel):
    """Response with Razorpay order details."""

    success: bool = Field(default=True)
    order_id: str = Field(..., description="Razorpay order identifier")
    amount: int = Field(..., description="Order amount in paise")
    currency: str = Field(..., description="Transaction currency")
    receipt: str = Field(..., description="Internal receipt reference")
    razorpay_key_id: str = Field(..., description="Public Razorpay key to expose to checkout")
    plan: PlanDetails = Field(..., description="Plan metadata attached to the order")
    subscription_id: str = Field(..., description="Internal subscription document identifier")


class PaymentVerificationRequest(BaseModel):
    """Payload sent after Razorpay checkout completes on the client."""

    user_id: str = Field(..., description="Clerk user identifier")
    razorpay_order_id: str = Field(..., description="Order id returned from Razorpay")
    razorpay_payment_id: str = Field(..., description="Payment id returned from Razorpay")
    razorpay_signature: str = Field(..., description="HMAC signature from Razorpay checkout")


class PaymentVerificationResponse(BaseModel):
    """Response returned after verifying a payment signature."""

    success: bool = Field(...)
    status: str = Field(..., description="Subscription status after verification")
    plan: PlanDetails = Field(..., description="Plan tied to the subscription")


class WebhookAcknowledgeResponse(BaseModel):
    """Response returned to acknowledge Razorpay webhooks."""

    success: bool = Field(default=True)
    message: str = Field(default="Webhook processed")


class SubscriptionStatusResponse(BaseModel):
    """Response containing the latest subscription details for a user."""

    success: bool = Field(default=True)
    status: str = Field(..., description="Current subscription status")
    plan: Optional[PlanDetails] = Field(default=None, description="Plan tied to the subscription")
    order_id: Optional[str] = Field(default=None, description="Razorpay order id for the subscription")
    payment_id: Optional[str] = Field(default=None, description="Latest Razorpay payment id")
    updated_at: Optional[datetime] = Field(default=None, description="Last update timestamp")