import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import destinationsHeroBg from "@/assets/destinations-hero-bg.jpg";

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
          name: "Tirupati Temple",
          description: "Famous for the Sri Venkateswara Temple on Tirumala Hills, one of the most visited religious sites in the world.",
          image: "/placeholder.svg"
        },
        {
          name: "Visakhapatnam Beach", 
          description: "A coastal city with beautiful beaches, Araku Valley, and the Submarine Museum. Known for its natural harbor and industrial importance.",
          image: "/placeholder.svg"
        }
      ]
    },
    {
      state: "Arunachal Pradesh",
      count: 2,
      destinations: [
        {
          name: "Tawang Monastery",
          description: "Home to the 400-year-old Tawang Monastery, stunning mountain views, and pristine lakes. A spiritual and scenic paradise.",
          image: "/placeholder.svg"
        },
        {
          name: "Ziro Valley",
          description: "Known for its rice fields, the indigenous Apatani tribe, and the annual Ziro Music Festival. A UNESCO World Heritage Site.",
          image: "/placeholder.svg"
        }
      ]
    },
    {
      state: "Assam",
      count: 2,
      destinations: [
        {
          name: "Brahmaputra River",
          description: "The gateway to Northeast India with the sacred Kamakhya Temple and proximity to the mighty Brahmaputra River.",
          image: "/placeholder.svg"
        },
        {
          name: "Kaziranga National Park",
          description: "UNESCO World Heritage Site famous for the one-horned rhinoceros and tiger reserve. Home to diverse wildlife and bird species.",
          image: "/placeholder.svg"
        }
      ]
    },
    {
      state: "Australia",
      count: 2,
      destinations: [
        {
          name: "Melbourne",
          description: "A cultural hub with a European feel, known for its coffee culture, street art, and sporting events.",
          image: "/placeholder.svg"
        },
        {
          name: "Sydney",
          description: "Australia's largest city with the iconic Opera House, Harbour Bridge, and beautiful beaches like Bondi.",
          image: "/placeholder.svg"
        }
      ]
    },
    {
      state: "Bihar",
      count: 2,
      destinations: [
        {
          name: "Mahabodhi Temple, Bodh Gaya",
          description: "The place where Lord Buddha attained enlightenment. Home to the sacred Mahabodhi Temple and numerous Buddhist monasteries.",
          image: "/placeholder.svg"
        },
        {
          name: "Nalanda University Ruins",
          description: "Site of the ancient Nalanda University, one of the world's oldest universities. A significant archaeological site.",
          image: "/placeholder.svg"
        }
      ]
    },
    {
      state: "Chhattisgarh",
      count: 2,
      destinations: [
        {
          name: "Chitrakote Falls",
          description: "Often called the 'Niagara Falls of India', this horseshoe-shaped waterfall on the Indravati River is a spectacular sight.",
          image: "/placeholder.svg"
        },
        {
          name: "Raipur",
          description: "The capital city with a blend of urban development and natural beauty. Known for Mahant Ghasidas Memorial Museum and Nandan Van Zoo.",
          image: "/placeholder.svg"
        }
      ]
    },
    {
      state: "France",
      count: 2,
      destinations: [
        {
          name: "Nice",
          description: "A beautiful coastal city on the French Riviera with stunning beaches, promenades, and Mediterranean charm.",
          image: "/placeholder.svg"
        },
        {
          name: "Paris",
          description: "The City of Light famous for the Eiffel Tower, Louvre Museum, and charming boulevards. A global center for art, fashion, and culture.",
          image: "/placeholder.svg"
        }
      ]
    },
    {
      state: "Goa",
      count: 2,
      destinations: [
        {
          name: "North Goa (Baga Beach)",
          description: "Known for its lively beaches, water sports, vibrant nightlife, and Portuguese heritage.",
          image: "/placeholder.svg"
        },
        {
          name: "South Goa (Palolem Beach)",
          description: "Features more relaxed and less crowded beaches, luxury resorts, and pristine natural beauty. Perfect for a peaceful getaway.",
          image: "/placeholder.svg"
        }
      ]
    },
    {
      state: "Gujarat",
      count: 2,
      destinations: [
        {
          name: "Ahmedabad",
          description: "A UNESCO World Heritage City with stunning architecture, vibrant markets, and rich cultural heritage.",
          image: "/placeholder.svg"
        },
        {
          name: "Rann of Kutch",
          description: "The white salt desert that transforms into a surreal landscape, especially during the Rann Utsav festival.",
          image: "/placeholder.svg"
        }
      ]
    },
    {
      state: "Haryana",
      count: 2,
      destinations: [
        {
          name: "Gurgaon",
          description: "A major financial and technology hub with modern architecture, shopping malls, and entertainment options.",
          image: "/placeholder.svg"
        },
        {
          name: "Kurukshetra",
          description: "The legendary battlefield of the Mahabharata with historical and religious significance.",
          image: "/placeholder.svg"
        }
      ]
    },
    {
      state: "Himachal Pradesh", 
      count: 3,
      destinations: [
        {
          name: "Dharamshala",
          description: "Home to the Dalai Lama and Tibetan government in exile. Known for Tibetan culture, monasteries, and beautiful landscapes.",
          image: "/placeholder.svg"
        },
        {
          name: "Manali",
          description: "A popular hill station with adventure activities, snow-capped mountains, and the beautiful Rohtang Pass.",
          image: "/placeholder.svg"
        },
        {
          name: "Shimla",
          description: "The former summer capital of British India, known for its colonial architecture, Mall Road, and panoramic mountain views.",
          image: "/placeholder.svg"
        }
      ]
    },
    {
      state: "Italy",
      count: 3,
      destinations: [
        {
          name: "Florence",
          description: "The birthplace of the Renaissance with the iconic Duomo, Uffizi Gallery, and Ponte Vecchio.",
          image: "/placeholder.svg"
        },
        {
          name: "Rome",
          description: "The Eternal City with ancient ruins like the Colosseum and Roman Forum, alongside Vatican City and Renaissance masterpieces.",
          image: "/placeholder.svg"
        },
        {
          name: "Venice",
          description: "The romantic city of canals with no roads, only waterways. Famous for St. Mark's Square, gondola rides, and unique architecture.",
          image: "/placeholder.svg"
        }
      ]
    },
    {
      state: "Japan",
      count: 2,
      destinations: [
        {
          name: "Kyoto",
          description: "Japan's cultural heart with over 1,600 Buddhist temples, 400 Shinto shrines, and beautiful gardens and palaces.",
          image: "/placeholder.svg"
        },
        {
          name: "Tokyo",
          description: "A fascinating blend of ultramodern and traditional, with skyscrapers, historic temples, and vibrant pop culture scene.",
          image: "/placeholder.svg"
        }
      ]
    },
    {
      state: "Jharkhand",
      count: 2,
      destinations: [
        {
          name: "Jamshedpur",
          description: "India's first planned industrial city with beautiful parks, lakes, and the Tata Steel plant.",
          image: "/placeholder.svg"
        },
        {
          name: "Ranchi",
          description: "The capital city surrounded by waterfalls, hills, and forests. Known for Hundru Falls and Tagore Hill.",
          image: "/placeholder.svg"
        }
      ]
    },
    {
      state: "Kerala",
      count: 3,
      destinations: [
        {
          name: "Alleppey",
          description: "Famous for its backwaters, houseboats, and serene village life.",
          image: "/placeholder.svg"
        },
        {
          name: "Kochi",
          description: "A coastal city with a rich history of trade, featuring Chinese fishing nets, colonial buildings, and vibrant local culture.",
          image: "/placeholder.svg"
        },
        {
          name: "Munnar",
          description: "A hill station known for vast tea plantations, misty mountains, and cool climate.",
          image: "/placeholder.svg"
        }
      ]
    },
    {
      state: "Madhya Pradesh",
      count: 2,
      destinations: [
        {
          name: "Bhopal",
          description: "The City of Lakes with a blend of Islamic and Hindu architecture, museums, and natural beauty.",
          image: "/placeholder.svg"
        },
        {
          name: "Khajuraho",
          description: "Famous for its ancient temples with intricate carvings and sculptures. A UNESCO World Heritage Site.",
          image: "/placeholder.svg"
        }
      ]
    },
    {
      state: "Maharashtra",
      count: 3,
      destinations: [
        {
          name: "Lonavala",
          description: "A popular hill station between Mumbai and Pune, known for valleys, lakes, and the famous Lonavala chikki.",
          image: "/placeholder.svg"
        },
        {
          name: "Mumbai",
          description: "India's financial capital and home to Bollywood. Coastal beauty with colonial architecture.",
          image: "/placeholder.svg"
        },
        {
          name: "Pune",
          description: "A blend of tradition and modernity with historical sites and educational institutions.",
          image: "/placeholder.svg"
        }
      ]
    },
    {
      state: "Manipur",
      count: 2,
      destinations: [
        {
          name: "Imphal",
          description: "The capital city with Loktak Lake, Kangla Fort, and vibrant cultural traditions.",
          image: "/placeholder.svg"
        },
        {
          name: "Loktak Lake",
          description: "The largest freshwater lake in Northeast India with unique floating islands called phumdis.",
          image: "/placeholder.svg"
        }
      ]
    },
    {
      state: "Meghalaya",
      count: 2,
      destinations: [
        {
          name: "Cherrapunji",
          description: "Known for living root bridges and stunning waterfalls.",
          image: "/placeholder.svg"
        },
        {
          name: "Shillong",
          description: "The 'Scotland of the East' with rolling hills, waterfalls, and pleasant climate.",
          image: "/placeholder.svg"
        }
      ]
    },
    {
      state: "Mizoram",
      count: 2,
      destinations: [
        {
          name: "Aizawl",
          description: "The capital city built on steep hills with panoramic views and vibrant markets.",
          image: "/placeholder.svg"
        },
        {
          name: "Champhai",
          description: "A picturesque town near Myanmar border with vineyards, lakes, and landscapes.",
          image: "/placeholder.svg"
        }
      ]
    },
    {
      state: "Nagaland",
      count: 2,
      destinations: [
        {
          name: "Dzukou Valley",
          description: "A hidden paradise with rolling hills, wildflowers, and trekking trails.",
          image: "/placeholder.svg"
        },
        {
          name: "Kohima",
          description: "The capital city with Hornbill Festival, War Cemetery, and Naga tribal culture.",
          image: "/placeholder.svg"
        }
      ]
    },
    {
      state: "Odisha",
      count: 2,
      destinations: [
        {
          name: "Bhubaneswar",
          description: "The 'Temple City of India' with ancient temples and rich cultural heritage.",
          image: "/placeholder.svg"
        },
        {
          name: "Puri",
          description: "Famous for Jagannath Temple, beaches, and the annual Rath Yatra festival.",
          image: "/placeholder.svg"
        }
      ]
    },
    {
      state: "Punjab",
      count: 2,
      destinations: [
        {
          name: "Amritsar",
          description: "Home to the Golden Temple, Wagah Border ceremony, and Punjabi cuisine.",
          image: "/placeholder.svg"
        },
        {
          name: "Chandigarh",
          description: "A well-planned city with Rock Garden, Sukhna Lake, and modern architecture.",
          image: "/placeholder.svg"
        }
      ]
    },
    {
      state: "Rajasthan",
      count: 3,
      destinations: [
        {
          name: "Jaipur",
          description: "The Pink City with forts, palaces, and vibrant culture.",
          image: "/placeholder.svg"
        },
        {
          name: "Jaisalmer",
          description: "The Golden City with yellow sandstone architecture.",
          image: "/placeholder.svg"
        },
        {
          name: "Udaipur",
          description: "The City of Lakes with romantic settings, palaces, and gardens.",
          image: "/placeholder.svg"
        }
      ]
    },
    {
      state: "Sikkim",
      count: 2,
      destinations: [
        {
          name: "Gangtok",
          description: "The capital with monasteries, cable cars, and Himalayan views.",
          image: "/placeholder.svg"
        },
        {
          name: "Tsomgo Lake",
          description: "A high-altitude glacial lake sacred to locals.",
          image: "/placeholder.svg"
        }
      ]
    },
    {
      state: "Tamil Nadu",
      count: 3,
      destinations: [
        {
          name: "Chennai",
          description: "The cultural capital with beaches, temples, and heritage.",
          image: "/placeholder.svg"
        },
        {
          name: "Madurai",
          description: "Known for magnificent Meenakshi Amman Temple.",
          image: "/placeholder.svg"
        },
        {
          name: "Ooty",
          description: "A hill station with tea gardens, botanical gardens, and Nilgiri Mountain Railway.",
          image: "/placeholder.svg"
        }
      ]
    },
    {
      state: "Telangana",
      count: 2,
      destinations: [
        {
          name: "Hyderabad",
          description: "The 'City of Pearls' with Charminar, Golconda Fort, and a blend of cultures.",
          image: "/placeholder.svg"
        },
        {
          name: "Warangal",
          description: "Ancient city with Warangal Fort, Thousand Pillar Temple, and Kakatiya heritage.",
          image: "/placeholder.svg"
        }
      ]
    },
    {
      state: "Thailand",
      count: 2,
      destinations: [
        {
          name: "Bangkok",
          description: "Thailand's vibrant capital with ornate shrines and bustling street life.",
          image: "/placeholder.svg"
        },
        {
          name: "Phuket",
          description: "Known for beaches, clear waters, and nightlife.",
          image: "/placeholder.svg"
        }
      ]
    },
    {
      state: "Tripura",
      count: 2,
      destinations: [
        {
          name: "Agartala",
          description: "Capital city with Ujjayanta Palace, Neermahal Palace, and lakes.",
          image: "/placeholder.svg"
        },
        {
          name: "Unakoti",
          description: "Ancient pilgrimage site with rock-cut sculptures from 7th–9th centuries.",
          image: "/placeholder.svg"
        }
      ]
    },
    {
      state: "United Arab Emirates",
      count: 2,
      destinations: [
        {
          name: "Abu Dhabi",
          description: "The UAE capital with stunning mosque, Ferrari World, and beaches.",
          image: "/placeholder.svg"
        },
        {
          name: "Dubai",
          description: "A city of superlatives with Burj Khalifa, luxury shopping, and ultramodern architecture.",
          image: "/placeholder.svg"
        }
      ]
    },
    {
      state: "United States",
      count: 3,
      destinations: [
        {
          name: "Miami",
          description: "A vibrant city with beaches, Art Deco architecture, and Latin cultural influence.",
          image: "/placeholder.svg"
        },
        {
          name: "New York",
          description: "The Big Apple with Times Square, Central Park, Statue of Liberty.",
          image: "/placeholder.svg"
        },
        {
          name: "San Francisco",
          description: "Known for Golden Gate Bridge, cable cars, and Victorian houses.",
          image: "/placeholder.svg"
        }
      ]
    },
    {
      state: "Uttar Pradesh",
      count: 3,
      destinations: [
        {
          name: "Fatehpur Sikri",
          description: "Iconic Mayapur, forts, and Mughal history.",
          image: "/placeholder.svg"
        },
        {
          name: "Lucknow",
          description: "City of Nawabs famous for architecture, cuisine, and embroidery.",
          image: "/placeholder.svg"
        },
        {
          name: "Varanasi",
          description: "One of the world's oldest cities with ghats, Ganges, and spiritual significance.",
          image: "/placeholder.svg"
        }
      ]
    },
    {
      state: "Uttarakhand",
      count: 2,
      destinations: [
        {
          name: "Nainital",
          description: "Popular hill station with lake, boating, and trekking.",
          image: "/placeholder.svg"
        },
        {
          name: "Rishikesh",
          description: "The Yoga Capital with ashrams, adventure sports, and Ganges.",
          image: "/placeholder.svg"
        }
      ]
    },
    {
      state: "West Bengal",
      count: 3,
      destinations: [
        {
          name: "Darjeeling",
          description: "Famous for Darjeeling tea, Himalayan Railway, and Kanchenjunga views.",
          image: "/placeholder.svg"
        },
        {
          name: "Kolkata",
          description: "The cultural capital with colonial architecture and rich heritage.",
          image: "/placeholder.svg"
        },
        {
          name: "Sundarbans",
          description: "Largest mangrove forest, home to Royal Bengal Tiger, UNESCO World Heritage Site.",
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
      <section 
        className="relative py-28 px-6 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(102, 126, 234, 0.8), rgba(147, 107, 230, 0.8)), url(${destinationsHeroBg})`,
        }}
      >
        <div className="container mx-auto text-center relative z-10">
          <h1 className="font-bold text-white mb-6 leading-tight" style={{ fontSize: '2.8rem' }}>
            Explore Incredible Destinations Worldwide
          </h1>
          <p className="text-white/90 max-w-4xl mx-auto leading-relaxed" style={{ fontSize: '1.2rem' }}>
            Discover the diverse beauty of both domestic and international destinations - from 
            majestic mountains and serene beaches to ancient temples and vibrant cities.
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="relative -mt-16 px-6 z-20">
        <div className="container mx-auto max-w-4xl">
          <Card className="p-6 shadow-lg bg-white rounded-lg">
            <div className="flex flex-col md:flex-row gap-6 items-end justify-center">
              <div className="space-y-2 flex-1 max-w-xs">
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

              <div className="space-y-2 flex-1 max-w-xs">
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

              <div className="flex items-center justify-center">
                <div className="flex flex-col items-center space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Worldwide</label>
                  <Switch
                    id="worldwide"
                    checked={isWorldwide}
                    onCheckedChange={setIsWorldwide}
                  />
                </div>
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