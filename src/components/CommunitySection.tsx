import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, MapPin, Star, Heart } from "lucide-react";

const CommunitySection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
      <div className="container mx-auto px-6">
        <Card className="p-8 text-center max-w-4xl mx-auto">
          <CardContent className="p-0">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="w-10 h-10 text-primary" />
              </div>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Join the TriponBuddy Community
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Be part of India's fastest-growing travel community. Let TriponBuddy be your trip buddy for unforgettable adventures!
            </p>

            {/* Community Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Heart className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-2xl font-bold text-primary">50,000+</span>
                </div>
                <p className="text-muted-foreground text-sm">Happy Travelers</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Star className="w-5 h-5 text-yellow-500 mr-2" />
                  <span className="text-2xl font-bold text-primary">4.8/5</span>
                </div>
                <p className="text-muted-foreground text-sm">User Rating</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <MapPin className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-2xl font-bold text-primary">50+</span>
                </div>
                <p className="text-muted-foreground text-sm">Destinations</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8 py-4 text-lg">
                Join TriponBuddy
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                Explore Destinations
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default CommunitySection;