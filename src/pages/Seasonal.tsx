import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ArrowRight } from "lucide-react";

// Import destination images
import shimlaImg from "@/assets/destinations/shimla.jpg";
import manaliImg from "@/assets/destinations/manali.jpg";
import darjeelingImg from "@/assets/destinations/darjeeling.jpg";
import ootypImg from "@/assets/destinations/ooty.jpg";
import nainitalImg from "@/assets/destinations/nainital.jpg";
import northGoaImg from "@/assets/destinations/north-goa.jpg";
import jaipurImg from "@/assets/destinations/jaipur.jpg";
import rannOfKutchImg from "@/assets/destinations/rann-of-kutch.jpg";
import aleppeyImg from "@/assets/destinations/alleppey.jpg";
import varanasiImg from "@/assets/destinations/varanasi.jpg";
import lonavaImg from "@/assets/destinations/lonavala.jpg";
import munnarImg from "@/assets/destinations/munnar.jpg";
import cherrapunjiImg from "@/assets/destinations/cherrapunji.jpg";
import udaipurImg from "@/assets/destinations/udaipur.jpg";
import kolkataImg from "@/assets/destinations/kolkata.jpg";
import amritsarImg from "@/assets/destinations/amritsar.jpg";
import ziroValleyImg from "@/assets/destinations/ziro-valley.jpg";
import dharamshalaImg from "@/assets/destinations/dharamshala.jpg";
import shillongImg from "@/assets/destinations/shillong.jpg";

interface Destination {
  id: string;
  name: string;
  state: string;
  description: string;
  image: string;
  season: "summer" | "winter" | "monsoon" | "autumn";
}

const seasonalDestinations: Destination[] = [
  // Summer Destinations
  {
    id: "shimla",
    name: "Shimla",
    state: "Himachal Pradesh",
    description: "Escape the heat in this cool hill station with colonial charm",
    image: shimlaImg,
    season: "summer",
  },
  {
    id: "manali",
    name: "Manali",
    state: "Himachal Pradesh", 
    description: "Adventure and natural beauty in the Himalayan foothills",
    image: manaliImg,
    season: "summer",
  },
  {
    id: "darjeeling",
    name: "Darjeeling",
    state: "West Bengal",
    description: "Enjoy tea gardens and misty mountains with pleasant weather",
    image: darjeelingImg,
    season: "summer",
  },
  {
    id: "ooty",
    name: "Ooty",
    state: "Tamil Nadu",
    description: "South India's premier hill station with botanical gardens",
    image: ootypImg,
    season: "summer",
  },
  {
    id: "nainital",
    name: "Nainital",
    state: "Uttarakhand",
    description: "Lake city surrounded by mountains with boating activities",
    image: nainitalImg,
    season: "summer",
  },
  // Winter Destinations
  {
    id: "goa",
    name: "Goa",
    state: "Goa",
    description: "Perfect beach weather and vibrant nightlife",
    image: northGoaImg,
    season: "winter",
  },
  {
    id: "jaipur",
    name: "Jaipur",
    state: "Rajasthan",
    description: "Explore the Pink City's forts and palaces in pleasant weather",
    image: jaipurImg,
    season: "winter",
  },
  {
    id: "rann-of-kutch",
    name: "Rann of Kutch",
    state: "Gujarat", 
    description: "Experience the white salt desert and cultural festival",
    image: rannOfKutchImg,
    season: "winter",
  },
  {
    id: "kerala-backwaters",
    name: "Kerala Backwaters",
    state: "Kerala",
    description: "Houseboat cruises in perfect weather",
    image: aleppeyImg,
    season: "winter",
  },
  {
    id: "varanasi-winter",
    name: "Varanasi",
    state: "Uttar Pradesh",
    description: "Spiritual experience along the Ganges in comfortable weather",
    image: varanasiImg,
    season: "winter",
  },
  // Monsoon Destinations
  {
    id: "lonavala",
    name: "Lonavala", 
    state: "Maharashtra",
    description: "Lush green hills and waterfalls come alive",
    image: lonavaImg,
    season: "monsoon",
  },
  {
    id: "munnar-monsoon",
    name: "Munnar",
    state: "Kerala",
    description: "Tea plantations turn more vibrant and misty",
    image: munnarImg,
    season: "monsoon",
  },
  {
    id: "cherrapunji",
    name: "Cherrapunji",
    state: "Meghalaya",
    description: "One of the wettest places with living root bridges",
    image: cherrapunjiImg,
    season: "monsoon",
  },
  {
    id: "udaipur-monsoon",
    name: "Udaipur",
    state: "Rajasthan",
    description: "The Lake City looks even more romantic in the rains",
    image: udaipurImg,
    season: "monsoon",
  },
  // Autumn Destinations
  {
    id: "kolkata",
    name: "Kolkata",
    state: "West Bengal",
    description: "Experience Durga Puja, the city's biggest festival",
    image: kolkataImg,
    season: "autumn",
  },
  {
    id: "varanasi-autumn",
    name: "Varanasi",
    state: "Uttar Pradesh", 
    description: "Dev Deepawali illuminates the ghats in autumn",
    image: varanasiImg,
    season: "autumn",
  },
  {
    id: "amritsar",
    name: "Amritsar",
    state: "Punjab",
    description: "Golden Temple and pleasant weather after summer",
    image: amritsarImg,
    season: "autumn",
  },
  {
    id: "ziro-valley",
    name: "Ziro Valley",
    state: "Arunachal Pradesh",
    description: "Music festival and beautiful rice fields",
    image: ziroValleyImg,
    season: "autumn",
  },
  {
    id: "dharamshala-autumn",
    name: "Dharamshala",
    state: "Himachal Pradesh",
    description: "Pleasant weather and colorful mountain views",
    image: dharamshalaImg,
    season: "autumn",
  },
  {
    id: "shillong-autumn",
    name: "Shillong",
    state: "Meghalaya",
    description: "The 'Scotland of the East' with autumn colors",
    image: shillongImg,
    season: "autumn",
  },
];

const seasonConfig = {
  summer: {
    title: "Summer Destinations",
    description: "Beat the heat with these cool hill stations and mountain retreats",
    color: "text-orange-600"
  },
  winter: {
    title: "Winter Destinations", 
    description: "Enjoy perfect weather at beaches, deserts, and cultural sites",
    color: "text-blue-600"
  },
  monsoon: {
    title: "Monsoon Escapes",
    description: "Witness nature's beauty with lush landscapes and waterfalls", 
    color: "text-green-600"
  },
  autumn: {
    title: "Autumn Favorites",
    description: "Experience festivals and pleasant weather across India",
    color: "text-amber-600"
  }
};

const Seasonal = () => {
  const [activeTab, setActiveTab] = useState("summer");

  const getDestinationsBySeason = (season: string) => {
    return seasonalDestinations.filter(dest => dest.season === season);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-br from-primary via-primary-variant to-accent overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
        <div className="relative container mx-auto px-6 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl font-bold mb-4">
              Seasonal Recommendations
            </h1>
            <p className="text-xl text-white/90">
              Discover the perfect destinations for every season - from cool summer retreats to vibrant monsoon escapes
            </p>
          </div>
        </div>
      </section>

      {/* Seasonal Tabs Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-12">
              <TabsTrigger value="summer">Summer</TabsTrigger>
              <TabsTrigger value="winter">Winter</TabsTrigger>
              <TabsTrigger value="monsoon">Monsoon</TabsTrigger>
              <TabsTrigger value="autumn">Autumn</TabsTrigger>
            </TabsList>

            {Object.entries(seasonConfig).map(([season, config]) => (
              <TabsContent key={season} value={season} className="space-y-8">
                <div className="text-center space-y-4">
                  <h2 className={`text-3xl font-bold ${config.color}`}>
                    {config.title}
                  </h2>
                  <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    {config.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {getDestinationsBySeason(season).map((destination) => (
                    <Card key={destination.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
                      <div className="relative overflow-hidden rounded-t-lg">
                        <img
                          src={destination.image}
                          alt={destination.name}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 text-white">
                          <h3 className="text-xl font-semibold">{destination.name}</h3>
                          <p className="text-white/80 text-sm">{destination.state}</p>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <CardDescription className="text-muted-foreground mb-4">
                          {destination.description}
                        </CardDescription>
                        <Button 
                          variant="ghost" 
                          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        >
                          Explore Destination
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Seasonal;