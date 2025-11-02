import { useUser } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { PricingCard, ThankYouCard, UpgradePromptCard, LoadingState } from "@/components/shared";
import { useRazorpayCheckout } from "@/hooks/useRazorpayCheckout";
import { fetchPricingPlans, getSubscriptionStatus } from "@/utils/paymentUtils";
import type { PlanDetails } from "@/types/payment";

const Pricing = () => {
  const { user } = useUser();

  // Fetch pricing plans
  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ["pricing-plans"],
    queryFn: fetchPricingPlans,
  });

  // Fetch user's subscription status
  const { data: subscriptionData, refetch: refetchSubscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ["subscription-status", user?.id],
    queryFn: () => getSubscriptionStatus(user!.id),
    enabled: !!user?.id,
  });

  // Initialize Razorpay checkout hook
  const { initiateCheckout, isProcessing } = useRazorpayCheckout({
    onSuccess: () => {
      refetchSubscription();
    },
  });

  const handleSubscribe = (plan: PlanDetails) => {
    initiateCheckout(plan);
  };

  const isPlanActive = (planId: string) => {
    return (
      subscriptionData?.plan?.id === planId && subscriptionData?.status === "paid"
    );
  };

  // Check if user has any paid subscription
  const hasActivePaidSubscription = !!(subscriptionData?.status === "paid" && subscriptionData?.plan);
  const hasStandardPlan = hasActivePaidSubscription && subscriptionData?.plan?.id === "standard";
  const hasGoldPlan = hasActivePaidSubscription && subscriptionData?.plan?.id === "gold";

  // Get gold plan for upgrade prompt
  const goldPlan = plansData?.plans.find((p) => p.id === "gold");

  // Show loading state until both queries are complete (for signed in users)
  // or until plans are loaded (for signed out users)
  const isLoading = plansLoading || (!!user?.id && subscriptionLoading);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {hasActivePaidSubscription ? "Your Subscription" : "Choose Your Perfect Plan"}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {hasActivePaidSubscription 
              ? "Thank you for being a valued member of the TriponBuddy community!"
              : "Unlock the full potential of AI-powered trip planning with our flexible pricing options."
            }
          </p>
        </div>

        {/* Show Thank You Card and Upgrade Prompt for Active Subscribers */}
        {hasActivePaidSubscription && subscriptionData.plan && (
          <div className="space-y-8 max-w-4xl mx-auto">
            {/* Thank You Card */}
            <ThankYouCard plan={subscriptionData.plan} />

            {/* Upgrade Prompt for Standard Users */}
            {hasStandardPlan && goldPlan && (
              <UpgradePromptCard 
                goldPlan={goldPlan}
                onUpgrade={handleSubscribe}
                isProcessing={isProcessing}
              />
            )}

            {/* Additional Message for Gold Users */}
            {hasGoldPlan && (
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 border-2 border-amber-400 rounded-lg p-6 text-center">
                <p className="text-lg font-semibold">
                  🌟 You have access to all premium features! 🌟
                </p>
                <p className="text-muted-foreground mt-2">
                  Enjoy unlimited trip planning and all the benefits of our Gold membership!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Show Pricing Cards for Non-Subscribers */}
        {!hasActivePaidSubscription && (
          <>
            {/* Pricing Cards */}
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {plansData?.plans.map((plan) => (
                <PricingCard
                  key={plan.id}
                  plan={plan}
                  isActive={isPlanActive(plan.id)}
                  isProcessing={isProcessing}
                  isPopular={plan.id === "gold"}
                  onSubscribe={handleSubscribe}
                  disabled={!user}
                  userHasAnySubscription={hasActivePaidSubscription}
                />
              ))}
            </div>

            {/* Features Comparison */}
            <div className="mt-16 text-center">
              <h2 className="text-2xl font-bold mb-8">All Plans Include</h2>
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="p-6 bg-muted rounded-lg">
                  <div className="text-3xl mb-3">🤖</div>
                  <h3 className="font-semibold mb-2">AI-Powered Planning</h3>
                  <p className="text-sm text-muted-foreground">
                    Advanced AI creates personalized itineraries
                  </p>
                </div>
                <div className="p-6 bg-muted rounded-lg">
                  <div className="text-3xl mb-3">🗺️</div>
                  <h3 className="font-semibold mb-2">Interactive Maps</h3>
                  <p className="text-sm text-muted-foreground">
                    Visual route planning with Google Maps
                  </p>
                </div>
                <div className="p-6 bg-muted rounded-lg">
                  <div className="text-3xl mb-3">📸</div>
                  <h3 className="font-semibold mb-2">Beautiful Imagery</h3>
                  <p className="text-sm text-muted-foreground">
                    High-quality destination photos
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Footer Note */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Secure payments powered by Razorpay • All transactions are encrypted</p>
          <p className="mt-2">Need help? Contact us at support@triponbuddy.com</p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
