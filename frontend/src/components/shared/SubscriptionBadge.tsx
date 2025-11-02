/**
 * Subscription Status Badge Component
 * Displays user's current subscription status
 */

import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-react";
import { Badge } from "@/components/ui/badge";
import { Crown, Star, Loader2 } from "lucide-react";
import { getSubscriptionStatus } from "@/utils/paymentUtils";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface SubscriptionBadgeProps {
  showUpgradeButton?: boolean;
  size?: "sm" | "md" | "lg";
}

export const SubscriptionBadge = ({
  showUpgradeButton = false,
  size = "md",
}: SubscriptionBadgeProps) => {
  const { user } = useUser();

  const { data: subscriptionData, isLoading } = useQuery({
    queryKey: ["subscription-status", user?.id],
    queryFn: () => getSubscriptionStatus(user!.id),
    enabled: !!user?.id,
  });

  if (isLoading) {
    return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
  }

  if (!subscriptionData || subscriptionData.status !== "paid") {
    return showUpgradeButton ? (
      <Link to="/pricing">
        <Button variant="outline" size="sm">
          Upgrade Plan
        </Button>
      </Link>
    ) : null;
  }

  const plan = subscriptionData.plan;
  if (!plan) return null;

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };

  const icon =
    plan.id === "gold" ? (
      <Crown className="h-4 w-4 mr-1" />
    ) : (
      <Star className="h-4 w-4 mr-1" />
    );

  return (
    <Badge
      className={`${sizeClasses[size]} flex items-center gap-1 ${
        plan.id === "gold"
          ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
          : "bg-gradient-to-r from-blue-400 to-blue-600 text-white"
      }`}
    >
      {icon}
      {plan.name} Plan
    </Badge>
  );
};
