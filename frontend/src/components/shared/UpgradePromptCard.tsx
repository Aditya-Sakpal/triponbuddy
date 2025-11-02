/**
 * Upgrade prompt card for Standard users to consider Gold
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, ArrowRight, Sparkles, Check } from "lucide-react";
import type { PlanDetails } from "@/types/payment";

interface UpgradePromptCardProps {
  goldPlan: PlanDetails;
  onUpgrade: (plan: PlanDetails) => void;
  isProcessing: boolean;
}

export const UpgradePromptCard = ({
  goldPlan,
  onUpgrade,
  isProcessing,
}: UpgradePromptCardProps) => {
  const upgradeFeatures = [
    "Unlimited AI-powered trip generations",
    "Priority support",
    "Advanced customization options",
    "Early access to new features",
  ];

  return (
    <Card className="relative bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 border-2 border-amber-400 shadow-xl">
      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          UPGRADE AVAILABLE
        </div>
      </div>

      <CardHeader className="pt-8">
        <CardTitle className="text-2xl flex items-center gap-3">
          <Crown className="h-8 w-8 text-amber-500" />
          <span>Love TriponBuddy? Consider Upgrading!</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-lg">
          Unlock the full potential of TriponBuddy with our <strong>Gold Plan</strong>!
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            What You'll Get:
          </h3>
          <ul className="space-y-2">
            {upgradeFeatures.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-amber-100 dark:bg-amber-900/30 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-amber-700 dark:text-amber-400 mb-1">
            {goldPlan.amount_display}
          </div>
          <p className="text-sm text-muted-foreground">One-time payment • Lifetime access</p>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
          size="lg"
          onClick={() => onUpgrade(goldPlan)}
          disabled={isProcessing}
        >
          {isProcessing ? (
            "Processing..."
          ) : (
            <>
              Upgrade to Gold
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
