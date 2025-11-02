/**
 * Custom hook for managing Razorpay checkout flow
 */

import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useToast } from "@/hooks/use-toast";
import {
  createPaymentOrder,
  verifyPayment,
  loadRazorpayScript,
} from "@/utils/paymentUtils";
import type {
  PlanDetails,
  RazorpayOptions,
  RazorpaySuccessResponse,
} from "@/types/payment";

interface UseRazorpayCheckoutOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useRazorpayCheckout = (options?: UseRazorpayCheckoutOptions) => {
  const { user } = useUser();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    loadRazorpayScript().then((loaded) => {
      setScriptLoaded(loaded);
      if (!loaded) {
        toast({
          title: "Script Loading Failed",
          description: "Could not load Razorpay. Please refresh the page.",
          variant: "destructive",
        });
      }
    });
  }, [toast]);

  const handlePaymentSuccess = async (response: RazorpaySuccessResponse) => {
    try {
      const verificationResult = await verifyPayment({
        user_id: user!.id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      });

      if (verificationResult.success && verificationResult.status === "paid") {
        toast({
          title: "Payment Successful! 🎉",
          description: `You're now subscribed to the ${verificationResult.plan.name} plan.`,
        });

        options?.onSuccess?.();
      } else {
        throw new Error("Payment verification failed");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Payment verification failed";

      toast({
        title: "Verification Failed",
        description:
          "Payment received but verification failed. Contact support.",
        variant: "destructive",
      });

      options?.onError?.(
        error instanceof Error ? error : new Error(errorMessage)
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const initiateCheckout = async (plan: PlanDetails) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe to a plan.",
        variant: "destructive",
      });
      return;
    }

    if (!scriptLoaded) {
      toast({
        title: "Payment System Unavailable",
        description: "Razorpay is still loading. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create order on backend
      const orderData = await createPaymentOrder({
        user_id: user.id,
        plan: plan.id,
        email: user.primaryEmailAddress?.emailAddress,
        contact: user.primaryPhoneNumber?.phoneNumber,
        notes: {
          plan_name: plan.name,
        },
      });

      // Configure Razorpay checkout
      const checkoutOptions: RazorpayOptions = {
        key: orderData.razorpay_key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "TripOnBuddy",
        description: `${plan.name} Plan Subscription`,
        image: "/logo.png",
        order_id: orderData.order_id,
        handler: handlePaymentSuccess,
        prefill: {
          name: user.fullName || user.username || undefined,
          email: user.primaryEmailAddress?.emailAddress,
          contact: user.primaryPhoneNumber?.phoneNumber,
        },
        notes: {
          plan_id: plan.id,
          subscription_id: orderData.subscription_id,
        },
        theme: {
          color: "#6366f1",
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            // Mark this order as cancelled in backend if needed
            // For now, just notify user - the order will remain in "created" status
            toast({
              title: "Payment Cancelled",
              description: "You can try again whenever you're ready.",
            });
          },
        },
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(checkoutOptions);

      razorpay.on("payment.failed", (response) => {
        setIsProcessing(false);
        const errorMessage =
          response.error.description || "Payment could not be processed.";

        toast({
          title: "Payment Failed",
          description: errorMessage,
          variant: "destructive",
        });

        options?.onError?.(new Error(errorMessage));
      });

      razorpay.open();
    } catch (error) {
      setIsProcessing(false);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to initiate payment.";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      options?.onError?.(
        error instanceof Error ? error : new Error(errorMessage)
      );
    }
  };

  return {
    initiateCheckout,
    isProcessing,
    scriptLoaded,
  };
};
