import { Card, CardContent } from "@/components/ui/card";
import { features } from "@/content/homeContent";

export const WhyPlanSection = () => {

  return (
    <section className="py-20 bg-background overflow-x-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-latin text-foreground mb-4">
            Why Plan with TriponBuddy
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold font-latin text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm font-latin leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
