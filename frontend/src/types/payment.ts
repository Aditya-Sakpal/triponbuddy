/**
 * Payment and pricing types for Razorpay integration
 */

export type PricingPlan = "standard" | "gold";

export interface PlanDetails {
  id: PricingPlan;
  name: string;
  amount_paise: number;
  amount_display: string;
  currency: string;
  features: string[];
}

export interface PlanListResponse {
  success: boolean;
  plans: PlanDetails[];
}

export interface CreateOrderRequest {
  user_id: string;
  plan: PricingPlan;
  email?: string;
  contact?: string;
  notes?: Record<string, string>;
}

export interface CreateOrderResponse {
  success: boolean;
  order_id: string;
  amount: number;
  currency: string;
  receipt: string;
  razorpay_key_id: string;
  plan: PlanDetails;
  subscription_id: string;
}

export interface PaymentVerificationRequest {
  user_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface PaymentVerificationResponse {
  success: boolean;
  status: string;
  plan: PlanDetails;
}

export interface SubscriptionStatusResponse {
  success: boolean;
  status: string;
  plan?: PlanDetails;
  order_id?: string;
  payment_id?: string;
  updated_at?: string;
}

// Razorpay Checkout Options
export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayErrorResponse {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: {
      order_id: string;
      payment_id: string;
    };
  };
}

// Razorpay SDK Interface
export interface RazorpayInstance {
  open(): void;
  on(event: "payment.failed", handler: (response: RazorpayErrorResponse) => void): void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}
