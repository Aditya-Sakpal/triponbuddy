"""
Helpers for Razorpay payment integration.
"""

import asyncio
import logging
from functools import lru_cache
from typing import Any, Callable, Dict

from config import settings
from models.payment import PlanDetails, PricingPlan

try:  # Razorpay is optional until installed
    import razorpay  # type: ignore
    from razorpay.errors import BadRequestError, SignatureVerificationError  # type: ignore
except ImportError:  # pragma: no cover - optional dependency fallback
    razorpay = None  # type: ignore

    class BadRequestError(Exception):
        """Fallback exception when Razorpay client library is unavailable."""

    class SignatureVerificationError(Exception):
        """Fallback exception when Razorpay client library is unavailable."""

logger = logging.getLogger(__name__)


PRICING_PLANS: Dict[PricingPlan, PlanDetails] = {
    PricingPlan.STANDARD: PlanDetails(
        id=PricingPlan.STANDARD,
        name="Standard",
        amount_paise=9900,
        amount_display="₹99",
        currency="INR",
        features=[
            "Unlimited Itinerary Creation",
            "Destination Info & Suggestions",
            "Real-time Budget Estimation",
        ],
    ),
    PricingPlan.GOLD: PlanDetails(
        id=PricingPlan.GOLD,
        name="Gold",
        amount_paise=19900,
        amount_display="₹199",
        currency="INR",
        features=[
            "All Standard Features",
            "Stay Booking (Hotels/Hostels)",
            "Transportation Booking (Flights/Trains/Buses/Cabs)",
        ],
    ),
    PricingPlan.PLATINUM: PlanDetails(
        id=PricingPlan.PLATINUM,
        name="Platinum",
        amount_paise=29900,
        amount_display="₹299",
        currency="INR",
        features=[
            "All Gold Features",
            "Custom Trip Builder",
            "Save & Share Trips",
            "Host Trips on Social Feed",
            "Exclusive Deals & Hidden Spots",
            "Priority Support",
        ],
    ),
}


def ensure_razorpay_prerequisites() -> None:
    """Ensure Razorpay dependencies and credentials exist before use."""

    if razorpay is None:
        raise RuntimeError("razorpay package is not installed. Install it before using the paywall APIs.")

    if not settings.razorpay_key_id or not settings.razorpay_key_secret:
        raise RuntimeError("Razorpay credentials are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.")


@lru_cache(maxsize=1)
def get_razorpay_client() -> Any:
    """Provide a cached Razorpay client instance."""

    ensure_razorpay_prerequisites()

    client = razorpay.Client(auth=(settings.razorpay_key_id, settings.razorpay_key_secret))  # type: ignore[arg-type]
    client.enable_retry(True)

    app_details = {
        "title": settings.razorpay_app_name,
        "version": settings.razorpay_app_version,
    }

    try:
        client.set_app_details(app_details)
    except Exception as exc:  # pragma: no cover - defensive guard for client API changes
        logger.debug("Failed setting Razorpay app details: %s", exc)

    return client


async def call_in_thread(func: Callable[..., Any], *args: Any, **kwargs: Any) -> Any:
    """Execute blocking Razorpay SDK calls in a worker thread."""

    return await asyncio.to_thread(func, *args, **kwargs)


def plan_copy(plan: PlanDetails) -> PlanDetails:
    """Return a defensive copy of a plan to avoid shared state mutations."""

    return PlanDetails.model_validate(plan.model_dump())


__all__ = [
    "PRICING_PLANS",
    "BadRequestError",
    "SignatureVerificationError",
    "razorpay",
    "ensure_razorpay_prerequisites",
    "get_razorpay_client",
    "call_in_thread",
    "plan_copy",
]
