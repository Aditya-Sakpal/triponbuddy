/**
 * Thank you card displayed when user has an active subscription
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Star, Check, Sparkles } from "lucide-react";
import type { PlanDetails } from "@/types/payment";

interface ThankYouCardProps {
  plan: PlanDetails;
}

export const ThankYouCard = ({ plan }: ThankYouCardProps) => {
  const isGold = plan.id === "gold";
  const icon = isGold ? <Crown className="h-8 w-8" /> : <Star className="h-8 w-8" />;

  return (
    <Card className="relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-2 border-primary shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-2xl flex items-center gap-3">
            {icon}
            <span>Thank You for Your Support! 🎉</span>
          </CardTitle>
        </div>
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 w-fit">
          Active {plan.name} Subscriber
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-lg">
          You're currently enjoying all the benefits of the <strong>{plan.name}</strong> plan.
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Your Active Features:
          </h3>
          <ul className="space-y-2">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-primary/10 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Your patronage helps us continue improving TriponBuddy for all travelers. 
            Thank you for being an essential part of our journey! 🌍✨
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
