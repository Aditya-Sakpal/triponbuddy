/**
 * Reusable Pricing Card Component for subscription plans
 */

import { Check, Loader2, Crown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PlanDetails } from "@/types/payment";

interface PricingCardProps {
  plan: PlanDetails;
  isActive?: boolean;
  isProcessing?: boolean;
  isPopular?: boolean;
  onSubscribe: (plan: PlanDetails) => void;
  disabled?: boolean;
  userHasAnySubscription?: boolean; // NEW: indicates if user has any paid subscription
}

export const PricingCard = ({
  plan,
  isActive = false,
  isProcessing = false,
  isPopular = false,
  onSubscribe,
  disabled = false,
  userHasAnySubscription = false,
}: PricingCardProps) => {
  const isGold = plan.id === "gold";
  const icon = isGold ? <Crown className="h-6 w-6" /> : <Star className="h-6 w-6" />;

  // Determine button state and text
  const getButtonState = () => {
    if (isActive) {
      return { text: "Current Plan", disabled: true };
    }
    if (isProcessing) {
      return { text: "Processing...", disabled: true };
    }
    if (disabled) {
      return { text: `Subscribe to ${plan.name}`, disabled: true };
    }
    // Don't allow subscribing to Standard if user has any paid subscription
    if (userHasAnySubscription && plan.id === "standard") {
      return { text: "Already Subscribed", disabled: true };
    }
    return { text: `Subscribe to ${plan.name}`, disabled: false };
  };

  const buttonState = getButtonState();

  return (
    <Card
      className={`relative transition-all duration-300 hover:shadow-lg ${
        isPopular || isGold
          ? "border-2 border-primary shadow-xl scale-105"
          : "border-border"
      }`}
    >
      {(isPopular || isGold) && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
          POPULAR
        </Badge>
      )}

      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-2xl flex items-center gap-2">
            {icon}
            {plan.name}
          </CardTitle>
          {isActive && (
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
            >
              Active
            </Badge>
          )}
        </div>
        <CardDescription>
          <span className="text-4xl font-bold text-foreground">
            {plan.amount_display}
          </span>
          <span className="text-muted-foreground"> / one-time</span>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          size="lg"
          variant={isGold ? "default" : "outline"}
          onClick={() => onSubscribe(plan)}
          disabled={buttonState.disabled}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            buttonState.text
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
