/**
 * Payment API utilities for Razorpay integration
 */

import { API_BASE_URL } from "@/constants/api";
import {
  CreateOrderRequest,
  CreateOrderResponse,
  PaymentVerificationRequest,
  PaymentVerificationResponse,
  PlanListResponse,
  SubscriptionStatusResponse,
} from "@/types/payment";

/**
 * Fetch available pricing plans
 */
export const fetchPricingPlans = async (): Promise<PlanListResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/payments/plans`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch pricing plans");
  }

  return response.json();
};

/**
 * Create a Razorpay order for checkout
 */
export const createPaymentOrder = async (
  payload: CreateOrderRequest
): Promise<CreateOrderResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/payments/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to create payment order");
  }

  return response.json();
};

/**
 * Verify payment signature after successful checkout
 */
export const verifyPayment = async (
  payload: PaymentVerificationRequest
): Promise<PaymentVerificationResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/payments/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Payment verification failed");
  }

  return response.json();
};

/**
 * Get current subscription status for a user
 */
export const getSubscriptionStatus = async (
  userId: string
): Promise<SubscriptionStatusResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/api/payments/subscription?user_id=${encodeURIComponent(userId)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch subscription status");
  }

  return response.json();
};

/**
 * Load Razorpay checkout script dynamically
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if script is already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};
