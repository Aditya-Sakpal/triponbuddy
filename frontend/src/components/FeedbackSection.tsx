import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useState } from "react";

const FeedbackSection = () => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  return (
    <section className="py-20 bg-blue-100">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold font-latin text-primary mb-6">
              Share Your Feedback
            </h2>
            <p className="text-lg font-latin text-muted-foreground leading-relaxed">
              We value your opinion! Let us know how we can improve
              your travel planning experience.
            </p>
          </div>
          
          {/* Right side - Form */}
          <Card className="p-8">
            <CardContent className="p-0">
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Your Name
                  </label>
                  <Input
                    placeholder="Enter your name"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Your Email
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Your Feedback
                  </label>
                  <Textarea
                    placeholder="Tell us what you think..."
                    rows={4}
                    className="w-full resize-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Rate Your Experience
                  </label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="p-1"
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => setRating(star)}
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= (hoveredRating || rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                
                <Button className="w-full py-3 text-lg font-latin">
                  Submit Feedback
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default FeedbackSection;