import { Button } from "@/components/ui/button";

const ExploreDestinationsSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
          Not sure where to go?
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Explore our curated collection of top destinations and get inspired for your next
          adventure.
        </p>
        <Button size="lg" className="px-8 py-4 text-lg">
          Explore Destinations
        </Button>
      </div>
    </section>
  );
};

export default ExploreDestinationsSection;