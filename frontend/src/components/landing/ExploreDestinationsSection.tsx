import { Button } from "@/components/ui/button";

export const ExploreDestinationsSection = () => {
  return (
    <section className="py-20 bg-[#4a4b4a] overflow-x-hidden">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold font-latin text-white mb-6">
          Not sure where to go?
        </h2>
        <p className="text-lg text-white/80 font-latin mb-8 max-w-2xl mx-auto">
          Explore our curated collection of top destinations and get inspired for your next
          adventure.
        </p>
        <Button 
          size="lg" 
          variant="outline" 
          className="px-8 py-4 text-lg bg-white text-bula border-white hover:bg-white/90 font-latin"
          onClick={() => window.location.href = '/explore'}
        >
          Explore Destinations
        </Button>
      </div>
    </section>
  );
};
