import { Card, CardContent } from "@/components/ui/card";
import { Rocket, DollarSign, CheckCircle } from "lucide-react";

const WhyTriponBuddySection = () => {
  const features = [
    {
      icon: Rocket,
      title: "Trip Planning",
      description: "TriponBuddy creates perfect itineraries. Our trip buddy algorithm analyzes thousands of travel patterns to suggest the best routes, timings, and experiences for your trip."
    },
    {
      icon: DollarSign,
      title: "Compare & Save on Travel Packages",
      description: "TriponBuddy aggregates deals from 100+ verified vendors. Compare honeymoon packages, group tours, and luxury trips. Save up to 30% when you book with TriponBuddy!"
    },
    {
      icon: CheckCircle,
      title: "Verified & Trusted",
      description: "Every travel package on TriponBuddy is verified. Read genuine TriponBuddy reviews from 50,000+ happy travelers. Your trip buddy ensures safe and memorable journeys."
    }
  ];

  const trendingSearches = [
    "Kerala honeymoon packages", "Goa beach resorts", "Rajasthan heritage tours", "Himachal adventure trips",
    "Kashmir family packages", "Andaman water sports", "Ladakh bike trips", "Northeast India tours",
    "Golden Triangle packages", "Mumbai weekend getaways", "Bangalore to Coorg trips", "Delhi to Shimla tours",
    "Kolkata to Darjeeling packages", "Chennai to Pondicherry trips", "Hyderabad to Araku Valley"
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        {/* Why TriponBuddy Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-12">
            Why TriponBuddy is India's Best Trip Buddy
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <Card key={index} className="text-left p-6 hover:shadow-lg transition-shadow border-none">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Popular Trip Searches Section */}
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            Popular Trip Searches on TriponBuddy
          </h3>
        </div>

        <div className="max-w-6xl mx-auto">
          <p className="text-muted-foreground mb-4">
            <span className="font-semibold">Trending on TriponBuddy:</span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            {trendingSearches.map((search, index) => (
              <span key={index}>
                {search}
                {index < trendingSearches.length - 1 && (
                  <span className="mx-1 text-muted-foreground/60">|</span>
                )}
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhyTriponBuddySection;