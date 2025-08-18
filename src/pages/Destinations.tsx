import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Destinations = () => {
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedSeason, setSelectedSeason] = useState("all");
  const [isWorldwide, setIsWorldwide] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  const locations = [
    "All Locations",
    "Andhra Pradesh",
    "Arunachal Pradesh", 
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal"
  ];

  const seasons = [
    "All Seasons",
    "Summer",
    "Winter", 
    "Monsoon",
    "Autumn"
  ];

  const destinationsByState = [
    {
      state: "Andhra Pradesh",
      count: 2,
      destinations: [
        {
          name: "Tirupati",
          description: "Famous for the Sri Venkateswara Temple",
          image: "/placeholder.svg"
        },
        {
          name: "Visakhapatnam", 
          description: "A coastal city with beautiful beaches",
          image: "/placeholder.svg"
        }
      ]
    },
    {
      state: "Rajasthan",
      count: 5,
      destinations: [
        {
          name: "Jaipur",
          description: "The Pink City with magnificent palaces",
          image: "/placeholder.svg"
        },
        {
          name: "Udaipur",
          description: "City of Lakes with romantic charm",
          image: "/placeholder.svg"
        },
        {
          name: "Jaisalmer",
          description: "Golden City in the heart of Thar Desert",
          image: "/placeholder.svg"
        }
      ]
    },
    {
      state: "Kerala",
      count: 4,
      destinations: [
        {
          name: "Munnar",
          description: "Hill station famous for tea plantations",
          image: "/placeholder.svg"
        },
        {
          name: "Alleppey",
          description: "Venice of the East with backwaters",
          image: "/placeholder.svg"
        },
        {
          name: "Kochi",
          description: "Queen of Arabian Sea",
          image: "/placeholder.svg"
        }
      ]
    },
    {
      state: "Himachal Pradesh", 
      count: 6,
      destinations: [
        {
          name: "Shimla",
          description: "Queen of Hills and summer capital",
          image: "/placeholder.svg"
        },
        {
          name: "Manali",
          description: "Valley of Gods with snow-capped mountains",
          image: "/placeholder.svg"
        },
        {
          name: "Dharamshala",
          description: "Little Lhasa in India",
          image: "/placeholder.svg"
        }
      ]
    },
    {
      state: "Goa",
      count: 3,
      destinations: [
        {
          name: "North Goa",
          description: "Vibrant beaches and nightlife",
          image: "/placeholder.svg"
        },
        {
          name: "South Goa",
          description: "Peaceful beaches and luxury resorts",
          image: "/placeholder.svg"
        }
      ]
    }
  ];

  const handleRetryImages = () => {
    setIsLoadingImages(true);
    setTimeout(() => setIsLoadingImages(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 py-20 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Explore Incredible Destinations Worldwide
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-4xl mx-auto">
            Discover the diverse beauty of both domestic and international destinations - from 
            majestic mountains and serene beaches to ancient temples and vibrant cities.
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 px-6">
        <div className="container mx-auto">
          <Card className="p-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Location</label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location.toLowerCase().replace(/\s+/g, '-')}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Season</label>
                <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Seasons" />
                  </SelectTrigger>
                  <SelectContent>
                    {seasons.map((season) => (
                      <SelectItem key={season} value={season.toLowerCase().replace(/\s+/g, '-')}>
                        {season}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between md:justify-start gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="worldwide"
                    checked={isWorldwide}
                    onCheckedChange={setIsWorldwide}
                  />
                  <label htmlFor="worldwide" className="text-sm font-medium">
                    Worldwide
                  </label>
                </div>
                <Button 
                  onClick={handleRetryImages}
                  variant="outline"
                  size="sm"
                  className="bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                >
                  Retry Loading Images
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Destinations Section */}
      <section className="py-12 px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Destinations by Location</h2>
          
          <div className="space-y-12">
            {destinationsByState.map((stateData) => (
              <div key={stateData.state} className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-foreground">{stateData.state}</h3>
                  <Badge variant="secondary" className="bg-blue-600 text-white">
                    {stateData.count} destinations
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stateData.destinations.map((destination, index) => (
                    <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="aspect-video relative">
                        {isLoadingImages ? (
                          <Skeleton className="w-full h-full" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-lg mb-2">{destination.name}</h4>
                        <p className="text-muted-foreground text-sm">{destination.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Destinations;