import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Navigation from "@/components/global/Navigation";
import Footer from "@/components/Footer";
import destinationsHeroBg from "@/assets/destinations-hero-bg.jpg";

// Import all destination images
import tirupatiTemple from "@/assets/destinations/tirupati-temple.jpg";
import visakhapatnamBeach from "@/assets/destinations/visakhapatnam-beach.jpg";
import tawangMonastery from "@/assets/destinations/tawang-monastery.jpg";
import ziroValley from "@/assets/destinations/ziro-valley.jpg";
import brahmaputraRiver from "@/assets/destinations/brahmaputra-river.jpg";
import kazirangaNationalPark from "@/assets/destinations/kaziranga-national-park.jpg";
import melbourne from "@/assets/destinations/melbourne.jpg";
import sydney from "@/assets/destinations/sydney.jpg";
import mahabodhiTemple from "@/assets/destinations/mahabodhi-temple.jpg";
import nalandaUniversity from "@/assets/destinations/nalanda-university.jpg";
import chitrakoteFalls from "@/assets/destinations/chitrakote-falls.jpg";
import raipur from "@/assets/destinations/raipur.jpg";
import nice from "@/assets/destinations/nice.jpg";
import paris from "@/assets/destinations/paris.jpg";
import northGoa from "@/assets/destinations/north-goa.jpg";
import southGoa from "@/assets/destinations/south-goa.jpg";
import ahmedabad from "@/assets/destinations/ahmedabad.jpg";
import rannOfKutch from "@/assets/destinations/rann-of-kutch.jpg";
import gurgaon from "@/assets/destinations/gurgaon.jpg";
import kurukshetra from "@/assets/destinations/kurukshetra.jpg";
import dharamshala from "@/assets/destinations/dharamshala.jpg";
import manali from "@/assets/destinations/manali.jpg";
import shimla from "@/assets/destinations/shimla.jpg";
import florence from "@/assets/destinations/florence.jpg";
import rome from "@/assets/destinations/rome.jpg";
import venice from "@/assets/destinations/venice.jpg";
import kyoto from "@/assets/destinations/kyoto.jpg";
import tokyo from "@/assets/destinations/tokyo.jpg";
import jamshedpur from "@/assets/destinations/jamshedpur.jpg";
import ranchi from "@/assets/destinations/ranchi.jpg";
import alleppey from "@/assets/destinations/alleppey.jpg";
import kochi from "@/assets/destinations/kochi.jpg";
import munnar from "@/assets/destinations/munnar.jpg";
import bhopal from "@/assets/destinations/bhopal.jpg";
import khajuraho from "@/assets/destinations/khajuraho.jpg";
import lonavala from "@/assets/destinations/lonavala.jpg";
import mumbai from "@/assets/destinations/mumbai.jpg";
import pune from "@/assets/destinations/pune.jpg";
import imphal from "@/assets/destinations/imphal.jpg";
import loktakLake from "@/assets/destinations/loktak-lake.jpg";
import cherrapunji from "@/assets/destinations/cherrapunji.jpg";
import shillong from "@/assets/destinations/shillong.jpg";
import aizawl from "@/assets/destinations/aizawl.jpg";
import champhai from "@/assets/destinations/champhai.jpg";
import dzukouValley from "@/assets/destinations/dzukou-valley.jpg";
import kohima from "@/assets/destinations/kohima.jpg";
import bhubaneswar from "@/assets/destinations/bhubaneswar.jpg";
import puri from "@/assets/destinations/puri.jpg";
import amritsar from "@/assets/destinations/amritsar.jpg";
import chandigarh from "@/assets/destinations/chandigarh.jpg";
import jaipur from "@/assets/destinations/jaipur.jpg";
import jaisalmer from "@/assets/destinations/jaisalmer.jpg";
import udaipur from "@/assets/destinations/udaipur.jpg";
import gangtok from "@/assets/destinations/gangtok.jpg";
import tsomgoLake from "@/assets/destinations/tsomgo-lake.jpg";
import chennai from "@/assets/destinations/chennai.jpg";
import madurai from "@/assets/destinations/madurai.jpg";
import ooty from "@/assets/destinations/ooty.jpg";
import hyderabad from "@/assets/destinations/hyderabad.jpg";
import warangal from "@/assets/destinations/warangal.jpg";
import bangkok from "@/assets/destinations/bangkok.jpg";
import phuket from "@/assets/destinations/phuket.jpg";
import agartala from "@/assets/destinations/agartala.jpg";
import unakoti from "@/assets/destinations/unakoti.jpg";
import abuDhabi from "@/assets/destinations/abu-dhabi.jpg";
import dubai from "@/assets/destinations/dubai.jpg";
import miami from "@/assets/destinations/miami.jpg";
import newYork from "@/assets/destinations/new-york.jpg";
import sanFrancisco from "@/assets/destinations/san-francisco.jpg";
import fatehpurSikri from "@/assets/destinations/fatehpur-sikri.jpg";
import lucknow from "@/assets/destinations/lucknow.jpg";
import varanasi from "@/assets/destinations/varanasi.jpg";
import nainital from "@/assets/destinations/nainital.jpg";
import rishikesh from "@/assets/destinations/rishikesh.jpg";
import darjeeling from "@/assets/destinations/darjeeling.jpg";
import kolkata from "@/assets/destinations/kolkata.jpg";
import sundarbans from "@/assets/destinations/sundarbans.jpg";

const Destinations = () => {
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedSeason, setSelectedSeason] = useState("all");
  const [isWorldwide, setIsWorldwide] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [preloadingComplete, setPreloadingComplete] = useState(false);

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
          image: tirupatiTemple
        },
        {
          name: "Visakhapatnam Beach", 
          description: "A coastal city with beautiful beaches, Araku Valley, and the Submarine Museum. Known for its natural harbor and industrial importance.",
          image: visakhapatnamBeach
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
          image: tawangMonastery
        },
        {
          name: "Ziro Valley",
          description: "Known for its rice fields, the indigenous Apatani tribe, and the annual Ziro Music Festival. A UNESCO World Heritage Site.",
          image: ziroValley
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
          image: brahmaputraRiver
        },
        {
          name: "Kaziranga National Park",
          description: "UNESCO World Heritage Site famous for the one-horned rhinoceros and tiger reserve. Home to diverse wildlife and bird species.",
          image: kazirangaNationalPark
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
          image: melbourne
        },
        {
          name: "Sydney",
          description: "Australia's largest city with the iconic Opera House, Harbour Bridge, and beautiful beaches like Bondi.",
          image: sydney
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
          image: mahabodhiTemple
        },
        {
          name: "Nalanda University Ruins",
          description: "Site of the ancient Nalanda University, one of the world's oldest universities. A significant archaeological site.",
          image: nalandaUniversity
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
          image: chitrakoteFalls
        },
        {
          name: "Raipur",
          description: "The capital city with a blend of urban development and natural beauty. Known for Mahant Ghasidas Memorial Museum and Nandan Van Zoo.",
          image: raipur
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
          image: nice
        },
        {
          name: "Paris",
          description: "The City of Light famous for the Eiffel Tower, Louvre Museum, and charming boulevards. A global center for art, fashion, and culture.",
          image: paris
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
          image: northGoa
        },
        {
          name: "South Goa (Palolem Beach)",
          description: "Features more relaxed and less crowded beaches, luxury resorts, and pristine natural beauty. Perfect for a peaceful getaway.",
          image: southGoa
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
          image: ahmedabad
        },
        {
          name: "Rann of Kutch",
          description: "The white salt desert that transforms into a surreal landscape, especially during the Rann Utsav festival.",
          image: rannOfKutch
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
          image: gurgaon
        },
        {
          name: "Kurukshetra",
          description: "The legendary battlefield of the Mahabharata with historical and religious significance.",
          image: kurukshetra
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
          image: dharamshala
        },
        {
          name: "Manali",
          description: "A popular hill station with adventure activities, snow-capped mountains, and the beautiful Rohtang Pass.",
          image: manali
        },
        {
          name: "Shimla",
          description: "The former summer capital of British India, known for its colonial architecture, Mall Road, and panoramic mountain views.",
          image: shimla
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
          image: florence
        },
        {
          name: "Rome",
          description: "The Eternal City with ancient ruins like the Colosseum and Roman Forum, alongside Vatican City and Renaissance masterpieces.",
          image: rome
        },
        {
          name: "Venice",
          description: "The romantic city of canals with no roads, only waterways. Famous for St. Mark's Square, gondola rides, and unique architecture.",
          image: venice
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
          image: kyoto
        },
        {
          name: "Tokyo",
          description: "A fascinating blend of ultramodern and traditional, with skyscrapers, historic temples, and vibrant pop culture scene.",
          image: tokyo
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
          image: jamshedpur
        },
        {
          name: "Ranchi",
          description: "The capital city surrounded by waterfalls, hills, and forests. Known for Hundru Falls and Tagore Hill.",
          image: ranchi
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
          image: alleppey
        },
        {
          name: "Kochi",
          description: "A coastal city with a rich history of trade, featuring Chinese fishing nets, colonial buildings, and vibrant local culture.",
          image: kochi
        },
        {
          name: "Munnar",
          description: "A hill station known for vast tea plantations, misty mountains, and cool climate.",
          image: munnar
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
          image: bhopal
        },
        {
          name: "Khajuraho",
          description: "Famous for its ancient temples with intricate carvings and sculptures. A UNESCO World Heritage Site.",
          image: khajuraho
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
          image: lonavala
        },
        {
          name: "Mumbai",
          description: "India's financial capital and home to Bollywood. Coastal beauty with colonial architecture.",
          image: mumbai
        },
        {
          name: "Pune",
          description: "A blend of tradition and modernity with historical sites and educational institutions.",
          image: pune
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
          image: imphal
        },
        {
          name: "Loktak Lake",
          description: "The largest freshwater lake in Northeast India with unique floating islands called phumdis.",
          image: loktakLake
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
          image: cherrapunji
        },
        {
          name: "Shillong",
          description: "The 'Scotland of the East' with rolling hills, waterfalls, and pleasant climate.",
          image: shillong
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
          image: aizawl
        },
        {
          name: "Champhai",
          description: "A picturesque town near Myanmar border with vineyards, lakes, and landscapes.",
          image: champhai
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
          image: dzukouValley
        },
        {
          name: "Kohima",
          description: "The capital city with Hornbill Festival, War Cemetery, and Naga tribal culture.",
          image: kohima
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
          image: bhubaneswar
        },
        {
          name: "Puri",
          description: "Famous for Jagannath Temple, beaches, and the annual Rath Yatra festival.",
          image: puri
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
          image: amritsar
        },
        {
          name: "Chandigarh",
          description: "A well-planned city with Rock Garden, Sukhna Lake, and modern architecture.",
          image: chandigarh
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
          image: jaipur
        },
        {
          name: "Jaisalmer",
          description: "The Golden City with yellow sandstone architecture.",
          image: jaisalmer
        },
        {
          name: "Udaipur",
          description: "The City of Lakes with romantic settings, palaces, and gardens.",
          image: udaipur
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
          image: gangtok
        },
        {
          name: "Tsomgo Lake",
          description: "A high-altitude glacial lake sacred to locals.",
          image: tsomgoLake
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
          image: chennai
        },
        {
          name: "Madurai",
          description: "Known for magnificent Meenakshi Amman Temple.",
          image: madurai
        },
        {
          name: "Ooty",
          description: "A hill station with tea gardens, botanical gardens, and Nilgiri Mountain Railway.",
          image: ooty
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
          image: hyderabad
        },
        {
          name: "Warangal",
          description: "Ancient city with Warangal Fort, Thousand Pillar Temple, and Kakatiya heritage.",
          image: warangal
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
          image: bangkok
        },
        {
          name: "Phuket",
          description: "Known for beaches, clear waters, and nightlife.",
          image: phuket
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
          image: agartala
        },
        {
          name: "Unakoti",
          description: "Ancient pilgrimage site with rock-cut sculptures from 7th–9th centuries.",
          image: unakoti
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
          image: abuDhabi
        },
        {
          name: "Dubai",
          description: "A city of superlatives with Burj Khalifa, luxury shopping, and ultramodern architecture.",
          image: dubai
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
          image: miami
        },
        {
          name: "New York",
          description: "The Big Apple with Times Square, Central Park, Statue of Liberty.",
          image: newYork
        },
        {
          name: "San Francisco",
          description: "Known for Golden Gate Bridge, cable cars, and Victorian houses.",
          image: sanFrancisco
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
          image: fatehpurSikri
        },
        {
          name: "Lucknow",
          description: "City of Nawabs famous for architecture, cuisine, and embroidery.",
          image: lucknow
        },
        {
          name: "Varanasi",
          description: "One of the world's oldest cities with ghats, Ganges, and spiritual significance.",
          image: varanasi
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
          image: nainital
        },
        {
          name: "Rishikesh",
          description: "The Yoga Capital with ashrams, adventure sports, and Ganges.",
          image: rishikesh
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
          image: darjeeling
        },
        {
          name: "Kolkata",
          description: "The cultural capital with colonial architecture and rich heritage.",
          image: kolkata
        },
        {
          name: "Sundarbans",
          description: "Largest mangrove forest, home to Royal Bengal Tiger, UNESCO World Heritage Site.",
          image: sundarbans
        }
      ]
    }
  ];

  // Preload all images on component mount with priority loading
  useEffect(() => {
    const preloadImages = async () => {
      // Get all images from filtered destinations
      const allImages = destinationsByState.flatMap(stateData => 
        stateData.destinations.map(destination => destination.image)
      );

      // Priority load first 12 images (visible on initial load)
      const priorityImages = allImages.slice(0, 12);
      const remainingImages = allImages.slice(12);

      // Add link preload tags for priority images
      priorityImages.forEach((imageSrc, index) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = imageSrc;
        if ('fetchPriority' in link) {
          (link as any).fetchPriority = 'high';
        }
        // Add crossorigin for better caching
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      });

      // Load priority images first
      const priorityPromises = priorityImages.map(imageSrc => {
        return new Promise<string>((resolve) => {
          const img = new Image();
          img.onload = () => {
            setLoadedImages(prev => new Set(prev).add(imageSrc));
            resolve(imageSrc);
          };
          img.onerror = () => {
            console.warn(`Failed to load priority image: ${imageSrc}`);
            resolve(imageSrc); // Don't reject, just continue
          };
          // Set high priority for these images
          if ('fetchPriority' in img) {
            (img as any).fetchPriority = 'high';
          }
          img.src = imageSrc;
        });
      });

      // Load priority images immediately
      await Promise.allSettled(priorityPromises);

      // Load remaining images with slight delay to not block priority ones
      setTimeout(() => {
        const remainingPromises = remainingImages.map(imageSrc => {
          return new Promise<string>((resolve) => {
            const img = new Image();
            img.onload = () => {
              setLoadedImages(prev => new Set(prev).add(imageSrc));
              resolve(imageSrc);
            };
            img.onerror = () => {
              console.warn(`Failed to load image: ${imageSrc}`);
              resolve(imageSrc);
            };
            img.src = imageSrc;
          });
        });

        Promise.allSettled(remainingPromises).finally(() => {
          setPreloadingComplete(true);
        });
      }, 50);
    };

    preloadImages();

    // Cleanup function to remove preload links
    return () => {
      const preloadLinks = document.querySelectorAll('link[rel="preload"][as="image"]');
      preloadLinks.forEach(link => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
        
      });
    };
  }, []);

  // Handle individual image load
  const handleImageLoad = useCallback((imageSrc: string) => {
    setLoadedImages(prev => new Set(prev).add(imageSrc));
    
  }, []);

  // Indian states for filtering
  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ];

  // Filter destinations based on worldwide switch
  const filteredDestinations = destinationsByState.filter(stateData => {
    if (isWorldwide) {
      return true; // Show all destinations
    } else {
      return indianStates.includes(stateData.state); // Show only Indian destinations
    }
  });

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
            {filteredDestinations.map((stateData) => (
              <div key={stateData.state} className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-foreground">{stateData.state}</h3>
                  <Badge variant="secondary" className="bg-blue-600 text-white">
                    {stateData.count} destinations
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stateData.destinations.map((destination, index) => {
                    const isImageLoaded = loadedImages.has(destination.image);
                    
                    return (
                      <Card key={index} className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group">
                        <div className="aspect-video relative overflow-hidden">
                          {/* Background placeholder */}
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                            {!isImageLoaded && (
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            )}
                          </div>
                          
                          {/* Actual image */}
                          <img
                            src={destination.image}
                            alt={destination.name}
                            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                              isImageLoaded ? 'opacity-100' : 'opacity-0'
                            }`}
                            onLoad={() => handleImageLoad(destination.image)}
                            loading="eager"
                            decoding="async"
                            style={{ 
                              willChange: 'transform, opacity',
                              backfaceVisibility: 'hidden'
                            }}
                          />
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                            {destination.name}
                          </h4>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {destination.description}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
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