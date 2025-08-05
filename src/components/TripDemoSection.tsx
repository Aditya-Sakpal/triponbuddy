import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, User, Download, Edit, Save } from "lucide-react";

const TripDemoSection = () => {
  const destinations = [
    {
      name: "Mayapur",
      description: "One of the seven wonders of the world",
      image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&h=300&fit=crop"
    },
    {
      name: "Varanasi Ghats",
      description: "Experience the spiritual heart of India",
      image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=400&h=300&fit=crop"
    },
    {
      name: "Golden Temple, Amritsar",
      description: "The holiest Gurdwara of Sikhism",
      image: "https://images.unsplash.com/photo-1585552515789-24ba4b09b5b9?w=400&h=300&fit=crop"
    },
    {
      name: "Kerala Backwaters",
      description: "Serene waterways of God's Own Country",
      image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&h=300&fit=crop"
    },
    {
      name: "Beaches of Goa",
      description: "Sun, sand and shoreline of India's favorite coastal destination",
      image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&h=300&fit=crop"
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        {/* Trip Header */}
        <Card className="mb-12 p-6">
          <CardContent className="p-0">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Your Trip to Paris</h2>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>May 15 - May 20, 2023</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>1 Traveler</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">₹1,500</div>
                <div className="text-sm text-muted-foreground">(Approx)</div>
                <div className="text-xs text-muted-foreground">Accommodation and Travel are excluded</div>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button variant="outline" size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save Trip
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit Trip
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {destinations.map((destination, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video overflow-hidden">
                <img 
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-2">{destination.name}</h3>
                <p className="text-sm text-muted-foreground">{destination.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex justify-center">
          <div className="flex bg-muted rounded-lg p-1">
            <button className="px-6 py-2 bg-primary text-primary-foreground rounded-md">Itinerary</button>
            <button className="px-6 py-2 text-muted-foreground hover:text-foreground">Accommodation</button>
            <button className="px-6 py-2 text-muted-foreground hover:text-foreground">Transportation</button>
            <button className="px-6 py-2 text-muted-foreground hover:text-foreground">Travel Tips</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TripDemoSection;