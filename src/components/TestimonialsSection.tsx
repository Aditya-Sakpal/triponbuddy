import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-latin text-foreground mb-4">
            What Our Travelers Say
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto"></div>
        </div>
        
        <div className="max-w-4xl mx-auto relative">
          <Card className="p-8">
            <CardContent className="p-0">
              <div className="text-center">
                <p className="text-lg text-muted-foreground font-latin italic mb-8 leading-relaxed">
                  "TriponBuddy made our family vacation to Rajasthan so easy! The detailed
                  itinerary saved us hours of research and the local tips made our Golden
                  Triangle tour truly special."
                </p>
                
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold font-latin text-foreground">Priya Sharma</h4>
                    <p className="text-sm font-latin text-muted-foreground">Trip to Jaipur, Rajasthan</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Navigation arrows */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;