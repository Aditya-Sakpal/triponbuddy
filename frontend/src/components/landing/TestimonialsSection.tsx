import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { testimonials } from "@/constants";

export const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-muted/30 overflow-x-hidden">
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

