import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { whyFeatures } from "@/content/homeContent";

const WhyTriponBuddySection = () => {
  return (
    <section className="py-16 px-4 bg-blue-100/50">
      <div className="max-w-6xl mx-auto">
        {/* Main Title */}
        <h2 className="text-4xl font-bold font-latin text-center mb-12 text-blue-600">
          Why TriponBuddy is India's Best Trip Buddy
        </h2>
        
        {/* Three Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {whyFeatures.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-4">
                <feature.icon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold font-latin mb-3 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600 font-latin leading-relaxed text-left">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Popular Trip Searches Card */}
        <Card className="mb-12 p-6">
          <CardContent className="p-0">
            <h3 className="text-2xl font-bold font-latin mb-4 text-gray-900">Popular Trip Searches on TriponBuddy</h3>
            <p className="text-gray-600 font-latin leading-relaxed">
              <span className="font-semibold font-latin text-gray-900">Trending on TriponBuddy:</span> Kerala honeymoon packages | Goa beach resorts | Rajasthan heritage tours | Himachal adventure trips | Kashmir family packages | Andaman water sports | Ladakh bike trips | Northeast India tours | Golden Triangle packages | Mumbai weekend getaways | Bangalore to Coorg trips | Delhi to Shimla tours | Kolkata to Darjeeling packages | Chennai to Pondicherry trips | Hyderabad to Araku Valley
            </p>
          </CardContent>
        </Card>

        {/* Join the TriponBuddy Community Section */}
        <div className="text-center">
          <h3 className="text-2xl font-bold font-latin mb-4 text-gray-900">Join the TriponBuddy Community</h3>
          <p className="text-gray-600 font-latin mb-6 max-w-3xl mx-auto">
            Be part of India's fastest-growing travel community. Let TriponBuddy be your trip buddy for unforgettable adventures!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 font-latin">
              Explore Destinations
            </Button>
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 font-latin">
              Join TriponBuddy
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyTriponBuddySection;