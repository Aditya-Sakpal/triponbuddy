import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const testimonials = [
  {
    quote: "TriponBuddy made our family vacation to Rajasthan so easy! The detailed itinerary saved us hours of research and the local tips made our Golden Triangle tour truly special.",
    name: "Priya Sharma",
    trip: "Trip to Jaipur, Rajasthan",
  },
  {
    quote: "The personalized recommendations were spot on! We discovered hidden gems in Kerala that we never would have found on our own. Highly recommend!",
    name: "Rahul Kumar",
    trip: "Backpacking in Kerala",
  },
  {
    quote: "As a solo traveler, safety was my top concern. TriponBuddy's verified guides and 24/7 support gave me peace of mind throughout my Himalayan trek.",
    name: "Ananya Patel",
    trip: "Solo Trek in Himalayas",
  },
  {
    quote: "The cultural immersion experiences were incredible. From traditional cooking classes to local festivals, every moment was memorable.",
    name: "Vikram Singh",
    trip: "Cultural Tour of Gujarat",
  },
];

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
          <Carousel className="w-full">
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index}>
                  <Card className="p-8">
                    <CardContent className="p-0">
                      <div className="text-center">
                        <p className="text-lg text-muted-foreground font-latin italic mb-8 leading-relaxed">
                          "{testimonial.quote}"
                        </p>
                        
                        <div className="flex items-center justify-center space-x-4">
                          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-primary-foreground" />
                          </div>
                          <div className="text-left">
                            <h4 className="font-semibold font-latin text-foreground">{testimonial.name}</h4>
                            <p className="text-sm font-latin text-muted-foreground">{testimonial.trip}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;