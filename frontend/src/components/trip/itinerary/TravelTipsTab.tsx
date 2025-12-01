import { useState, useEffect } from "react";
import { Lightbulb, Calendar, CheckCircle, Plus, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface TravelTipsTabProps {
  tips: string[];
  bestTimeToVisit?: string;
  tripId?: string;
  customTips?: string[];
  onCustomTipsUpdate?: (tips: string[]) => void;
}

export const TravelTipsTab = ({ 
  tips, 
  bestTimeToVisit, 
  tripId,
  customTips: initialCustomTips = [],
  onCustomTipsUpdate 
}: TravelTipsTabProps) => {
  const [customTips, setCustomTips] = useState<string[]>(initialCustomTips);
  const [showAddTip, setShowAddTip] = useState(false);
  const [newTip, setNewTip] = useState("");
  const { toast } = useToast();

  const allTips = [...tips, ...customTips];

  // Sync custom tips when they change from parent
  useEffect(() => {
    setCustomTips(initialCustomTips);
  }, [initialCustomTips]);

  const handleAddTip = () => {
    const trimmedTip = newTip.trim();
    if (!trimmedTip) {
      toast({
        title: "Validation Error",
        description: "Please enter a tip before adding.",
        variant: "destructive",
      });
      return;
    }

    if (trimmedTip.length > 500) {
      toast({
        title: "Validation Error",
        description: "Tip must be 500 characters or less.",
        variant: "destructive",
      });
      return;
    }

    const updatedTips = [...customTips, trimmedTip];
    setCustomTips(updatedTips);
    setNewTip("");
    setShowAddTip(false);
    
    // Call parent callback to persist
    if (onCustomTipsUpdate) {
      onCustomTipsUpdate(updatedTips);
    }

    toast({
      title: "Tip Added",
      description: "Your custom tip has been added successfully.",
    });
  };

  const handleRemoveTip = (index: number) => {
    const tipIndex = index - tips.length;
    if (tipIndex >= 0) {
      const updatedTips = customTips.filter((_, i) => i !== tipIndex);
      setCustomTips(updatedTips);
      
      // Call parent callback to persist
      if (onCustomTipsUpdate) {
        onCustomTipsUpdate(updatedTips);
      }

      toast({
        title: "Tip Removed",
        description: "Custom tip has been removed.",
      });
    }
  };

  return (
    <div className="space-y-6 relative pb-20">
      <Card>
        <CardHeader>
          <CardTitle>Travel Tips & Recommendations</CardTitle>
          <CardDescription>
            Essential information to make your trip smooth and enjoyable
          </CardDescription>
        </CardHeader>
      </Card>

      {bestTimeToVisit && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-bula" />
              Best Time to Visit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{bestTimeToVisit}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            Essential Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Add Tip Form */}
          {showAddTip && (
            <div className="mb-6 p-4 border border-primary/20 rounded-lg bg-primary/5">
              <div className="space-y-3">
                <Textarea
                  placeholder="Enter your custom travel tip..."
                  value={newTip}
                  onChange={(e) => setNewTip(e.target.value)}
                  rows={3}
                  maxLength={500}
                  className="resize-none"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {newTip.length}/500
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowAddTip(false);
                        setNewTip("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddTip}
                    >
                      Add Tip
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {allTips.length > 0 ? (
            <div className="space-y-4">
              {allTips.map((tip, index) => {
                const isCustomTip = index >= tips.length;
                return (
                  <div key={index} className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg group">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground leading-relaxed flex-1">{tip}</p>
                    {isCustomTip && (
                      <button
                        onClick={() => handleRemoveTip(index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
                        aria-label="Remove tip"
                      >
                        <X className="w-4 h-4 text-destructive" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No travel tips available</p>
              <p className="text-sm text-muted-foreground mt-1">
                General travel tips will be added to your itinerary
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional helpful sections */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Before You Go</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Check weather forecast</li>
                <li>• Confirm all bookings</li>
                <li>• Pack appropriate clothing</li>
                <li>• Download offline maps</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">During Your Trip</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Keep important documents safe</li>
                <li>• Stay hydrated</li>
                <li>• Take photos and make memories</li>
                <li>• Try local cuisine</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-4 z-50">
        <button
          onClick={() => setShowAddTip(!showAddTip)}
          className={`bg-black hover:bg-gray-800 text-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 ${
            showAddTip ? "rotate-45" : "rotate-0"
          }`}
          aria-label="Add custom tip"
          title="Add custom tip"
        >
          <Plus size={24} />
        </button>
      </div>
    </div>
  );
};
