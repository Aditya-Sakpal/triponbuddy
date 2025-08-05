import { Card, CardContent } from "@/components/ui/card";
import { 
  MapPin, 
  TrendingUp, 
  Shield, 
  Zap, 
  DollarSign, 
  Users, 
  Clock, 
  Award 
} from "lucide-react";

const EnhancedFeaturesSection = () => {
  const features = [
    {
      icon: Zap,
      title: "Trip Planning",
      description: "TriponBuddy creates perfect itineraries. Our trip buddy algorithm analyzes thousands of travel patterns to suggest the best routes, timings, and experiences for your trip.",
      highlight: "AI-Powered"
    },
    {
      icon: TrendingUp,
      title: "Compare & Save on Travel Packages",
      description: "TriponBuddy aggregates deals from 100+ verified vendors. Compare honeymoon packages, group tours, and luxury trips. Save up to 30% when you book with TriponBuddy!",
      highlight: "Save 30%"
    },
    {
      icon: Shield,
      title: "Verified & Trusted",
      description: "Every travel package on TriponBuddy is verified. Read genuine TriponBuddy reviews from 50,000+ happy travelers. Your trip buddy ensures safe and memorable journeys.",
      highlight: "50,000+ Reviews"
    }
  ];

  const stats = [
    { icon: Users, number: "50,000+", label: "Happy Travelers" },
    { icon: MapPin, number: "50+", label: "Destinations" },
    { icon: DollarSign, number: "30%", label: "Average Savings" },
    { icon: Clock, number: "24/7", label: "Support" }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Why TriponBuddy is India's Best Trip Buddy
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto"></div>
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                {feature.highlight}
              </div>
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="text-3xl font-bold text-primary mb-1">{stat.number}</div>
              <div className="text-muted-foreground text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Popular Searches */}
        <Card className="p-8">
          <CardContent className="p-0">
            <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
              Popular Trip Searches on TriponBuddy
            </h3>
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                <span className="font-semibold text-primary">Trending on TriponBuddy:</span>
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "Kerala honeymoon packages",
                  "Goa beach resorts", 
                  "Rajasthan heritage tours",
                  "Himachal adventure trips",
                  "Kashmir family packages",
                  "Andaman water sports",
                  "Ladakh bike trips",
                  "Northeast India tours",
                  "Golden Triangle packages",
                  "Mumbai weekend getaways",
                  "Bangalore to Coorg trips",
                  "Delhi to Shimla tours"
                ].map((search, index) => (
                  <span 
                    key={index}
                    className="bg-muted/50 text-muted-foreground px-3 py-1 rounded-full text-sm hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                  >
                    {search}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default EnhancedFeaturesSection;