
  
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

  const seasonalDestinations = [
    // Summer Destinations
    {
      id: "shimla",
      name: "Shimla",
      state: "Himachal Pradesh",
      description: "Escape the heat in this cool hill station with colonial charm",
      season: "summer",
      bestTimeToVisit: "May - Jun",
    },
    {
      id: "manali",
      name: "Manali",
      state: "Himachal Pradesh", 
      description: "Adventure and natural beauty in the Himalayan foothills",
      season: "summer",
      bestTimeToVisit: "May - Jun",
    },
    {
      id: "darjeeling",
      name: "Darjeeling",
      state: "West Bengal",
      description: "Enjoy tea gardens and misty mountains with pleasant weather",
      season: "summer",
      bestTimeToVisit: "May - Jun",
    },
    {
      id: "ooty",
      name: "Ooty",
      state: "Tamil Nadu",
      description: "South India's premier hill station with botanical gardens",
      season: "summer",
      bestTimeToVisit: "May - Jun",
    },
    {
      id: "nainital",
      name: "Nainital",
      state: "Uttarakhand",
      description: "Lake city surrounded by mountains with boating activities",
      season: "summer",
      bestTimeToVisit: "May - Jun",
    },
    {
      id: "kullu",
      name: "Kullu",
      state: "Himachal Pradesh",
      description: "Valley of Gods, famous for apple orchards and Dussehra festival",
      season: "summer",
      bestTimeToVisit: "May - Jun",
    },
    {
      id: "rishikesh",
      name: "Rishikesh",
      state: "Uttarakhand",
      description: "The Yoga Capital with ashrams, adventure sports, and Ganges",
      season: "summer",
      bestTimeToVisit: "May - Jun",
    },
    {
      id: "mussoorie",
      name: "Mussoorie",
      state: "Uttarakhand",
      description: "Known as the 'Queen of Hills' with colonial charm and panoramic views",
      season: "summer",
      bestTimeToVisit: "May - Jun",
    },
    {
      id: "kalimpong",
      name: "Kalimpong",
      state: "West Bengal",
      description: "Scenic hill town with monasteries and orchid nurseries",
      season: "summer",
      bestTimeToVisit: "May - Jun",
    },
    {
      id: "bomdila",
      name: "Bomdila",
      state: "Arunachal Pradesh",
      description: "Hill town with monasteries and apple orchards",
      season: "summer",
      bestTimeToVisit: "May - Jun",
    },
    {
      id: "sela-pass",
      name: "Sela Pass",
      state: "Arunachal Pradesh",
      description: "High mountain pass with stunning views and Sela Lake",
      season: "summer",
      bestTimeToVisit: "May - Jun",
    },
    {
      id: "ukhrul",
      name: "Ukhrul",
      state: "Manipur",
      description: "Hill town famous for Shirui lily and tribal culture",
      season: "summer",
      bestTimeToVisit: "May - Jun",
    },
    // Winter Destinations
    {
      id: "goa",
      name: "Goa",
      state: "Goa",
      description: "Perfect beach weather and vibrant nightlife",
      season: "winter",
      bestTimeToVisit: "Nov - Feb",
    },
    {
      id: "jaipur",
      name: "Jaipur",
      state: "Rajasthan",
      description: "Explore the Pink City's forts and palaces in pleasant weather",
      season: "winter",
      bestTimeToVisit: "Nov - Feb",
    },
    {
      id: "rann-of-kutch",
      name: "Rann of Kutch",
      state: "Gujarat", 
      description: "Experience the white salt desert and cultural festival",
      season: "winter",
      bestTimeToVisit: "Nov - Feb",
    },
    {
      id: "kerala-backwaters",
      name: "Kerala Backwaters",
      state: "Kerala",
      description: "Houseboat cruises in perfect weather",
      season: "winter",
      bestTimeToVisit: "Nov - Feb",
    },
    {
      id: "varanasi-winter",
      name: "Varanasi",
      state: "Uttar Pradesh",
      description: "Spiritual experience along the Ganges in comfortable weather",
      season: "winter",
      bestTimeToVisit: "Nov - Feb",
    },
    {
      id: "amritsar-winter",
      name: "Amritsar",
      state: "Punjab",
      description: "Golden Temple and pleasant weather after summer",
      season: "winter",
      bestTimeToVisit: "Nov - Feb",
    },
    {
      id: "chandigarh",
      name: "Chandigarh",
      state: "Punjab",
      description: "A well-planned city with Rock Garden, Sukhna Lake, and modern architecture",
      season: "winter",
      bestTimeToVisit: "Nov - Feb",
    },
    {
      id: "india-gate",
      name: "India Gate",
      state: "Delhi",
      description: "War memorial dedicated to Indian soldiers",
      season: "winter",
      bestTimeToVisit: "Nov - Feb",
    },
    {
      id: "taj-mahal",
      name: "Taj Mahal",
      state: "Uttar Pradesh",
      description: "UNESCO World Heritage Site and one of the Seven Wonders of the World",

      season: "winter",
      bestTimeToVisit: "Nov - Feb",
    },
    {
      id: "jodhpur",
      name: "Jodhpur",
      state: "Rajasthan",
      description: "Blue City with Mehrangarh Fort and old-world charm",

      season: "winter",
      bestTimeToVisit: "Nov - Feb",
    },
    {
      id: "pushkar",
      name: "Pushkar",
      state: "Rajasthan",
      description: "Holy town with Brahma Temple and Camel Fair",

      season: "winter",
      bestTimeToVisit: "Nov - Feb",
    },
    {
      id: "lucknow",
      name: "Lucknow",
      state: "Uttar Pradesh",
      description: "City of Nawabs famous for architecture, cuisine, and embroidery",

      season: "winter",
      bestTimeToVisit: "Nov - Feb",
    },
    // Monsoon Destinations
    {
      id: "lonavala",
      name: "Lonavala", 
      state: "Maharashtra",
      description: "Lush green hills and waterfalls come alive",

      season: "monsoon",
      bestTimeToVisit: "Jul - Sep",
    },
    {
      id: "munnar-monsoon",
      name: "Munnar",
      state: "Kerala",
      description: "Tea plantations turn more vibrant and misty",

      season: "monsoon",
      bestTimeToVisit: "Jul - Sep",
    },
    {
      id: "cherrapunji",
      name: "Cherrapunji",
      state: "Meghalaya",
      description: "One of the wettest places with living root bridges",

      season: "monsoon",
      bestTimeToVisit: "Jul - Sep",
    },
    {
      id: "udaipur-monsoon",
      name: "Udaipur",
      state: "Rajasthan",
      description: "The Lake City looks even more romantic in the rains",

      season: "monsoon",
      bestTimeToVisit: "Jul - Sep",
    },
    {
      id: "dudhsagar-falls",
      name: "Dudhsagar Falls",
      state: "Goa",
      description: "Spectacular four-tiered waterfall on Goa-Karnataka border",

      season: "monsoon",
      bestTimeToVisit: "Jul - Sep",
    },
    {
      id: "mahabaleshwar",
      name: "Mahabaleshwar",
      state: "Maharashtra",
      description: "Hill station famous for strawberries and viewpoints",

      season: "monsoon",
      bestTimeToVisit: "Jul - Sep",
    },
    {
      id: "kanha-national-park",
      name: "Kanha National Park",
      state: "Madhya Pradesh",
      description: "Tiger reserve and lush forest sanctuary",

      season: "monsoon",
      bestTimeToVisit: "Jul - Sep",
    },
    {
      id: "bandhavgarh-national-park",
      name: "Bandhavgarh National Park",
      state: "Madhya Pradesh",
      description: "Famous for tiger sightings and ancient fort ruins",

      season: "monsoon",
      bestTimeToVisit: "Jul - Sep",
    },
    // Autumn Destinations
    {
      id: "kolkata",
      name: "Kolkata",
      state: "West Bengal",
      description: "Experience Durga Puja, the city's biggest festival",

      season: "autumn",
      bestTimeToVisit: "Sep - Nov",
    },
    {
      id: "varanasi-autumn",
      name: "Varanasi",
      state: "Uttar Pradesh", 
      description: "Dev Deepawali illuminates the ghats in autumn",

      season: "autumn",
      bestTimeToVisit: "Sep - Nov",
    },
    {
      id: "amritsar",
      name: "Amritsar",
      state: "Punjab",
      description: "Golden Temple and pleasant weather after summer",

      season: "autumn",
      bestTimeToVisit: "Sep - Nov",
    },
    {
      id: "ziro-valley",
      name: "Ziro Valley",
      state: "Arunachal Pradesh",
      description: "Music festival and beautiful rice fields",

      season: "autumn",
      bestTimeToVisit: "Sep - Nov",
    },
    {
      id: "dharamshala-autumn",
      name: "Dharamshala",
      state: "Himachal Pradesh",
      description: "Pleasant weather and colorful mountain views",

      season: "autumn",
      bestTimeToVisit: "Sep - Nov",
    },
    {
      id: "shillong-autumn",
      name: "Shillong",
      state: "Meghalaya",
      description: "The 'Scotland of the East' with autumn colors",

      season: "autumn",
      bestTimeToVisit: "Sep - Nov",
    },
    {
      id: "gangtok",
      name: "Gangtok",
      state: "Sikkim",
      description: "The capital with monasteries, cable cars, and Himalayan views",

      season: "autumn",
      bestTimeToVisit: "Sep - Nov",
    },
    {
      id: "pelling",
      name: "Pelling",
      state: "Sikkim",
      description: "Town with views of Kanchenjunga and ancient monasteries",

      season: "autumn",
      bestTimeToVisit: "Sep - Nov",
    },
    {
      id: "yumthang-valley",
      name: "Yumthang Valley",
      state: "Sikkim",
      description: "Valley of Flowers, famous for rhododendrons and hot springs",

      season: "autumn",
      bestTimeToVisit: "Sep - Nov",
    },
    {
      id: "tsomgo-lake",
      name: "Tsomgo Lake",
      state: "Sikkim",
      description: "A high-altitude glacial lake sacred to locals",

      season: "autumn",
      bestTimeToVisit: "Sep - Nov",
    },
    {
      id: "digha",
      name: "Digha",
      state: "West Bengal",
      description: "Popular seaside destination on the Bay of Bengal",

      season: "autumn",
      bestTimeToVisit: "Sep - Nov",
    },
    {
      id: "sundarbans",
      name: "Sundarbans",
      state: "West Bengal",
      description: "Largest mangrove forest, home to Royal Bengal Tiger, UNESCO World Heritage Site",

      season: "autumn",
      bestTimeToVisit: "Sep - Nov",
    },
  ];

  const destinationsByState = [
    {
  state: "Ladakh",
  count: 5,
  destinations: [
    {
      name: "Pangong Lake",
      description: "High-altitude lake known for changing colors.",

      bestTimeToVisit: "Jun - Sep"
    },
    {
      name: "Leh Palace",
      description: "Historic palace overlooking Leh town.",

      bestTimeToVisit: "May - Sep"
    },
    {
      name: "Hemis Monastery",
      description: "Largest and richest monastery in Ladakh.",

      bestTimeToVisit: "Jun - Sep"
    },
    {
      name: "Nubra Valley",
      description: "Scenic valley with sand dunes, monasteries, and Bactrian camels.",

      bestTimeToVisit: "Jun - Sep"
    },
    {
      name: "Magnetic Hill",
      description: "Optical illusion where vehicles appear to move uphill.",

      bestTimeToVisit: "May - Sep"
    }
  ]
},
    {
      state: "Andhra Pradesh",
      count: 2,
      destinations: [
            {
      name: "Araku Valley",
      description: "Scenic hill station with coffee plantations.",

      bestTimeToVisit: "Oct - Mar"
    },
    {
      name: "Lepakshi",
      description: "Famous for Veerabhadra Temple and hanging pillar.",

      bestTimeToVisit: "Oct - Mar"
    },
    {
      name: "Amaravati",
      description: "Historic Buddhist site with ancient stupas.",

      bestTimeToVisit: "Oct - Mar"
    },
        {
          name: "Tirupati Temple",
          description: "Famous for the Sri Venkateswara Temple on Tirumala Hills, one of the most visited religious sites in the world.",

          bestTimeToVisit: "Oct - May"
        },
        {
          name: "Visakhapatnam Beach", 
          description: "A coastal city with beautiful beaches, Araku Valley, and the Submarine Museum. Known for its natural harbor and industrial importance.",

          bestTimeToVisit: "Oct - May"
        }
      ]
    },
    {
      state: "Arunachal Pradesh",
      count: 2,
      destinations: [
            {
      name: "Bomdila",
      description: "Hill town with monasteries and apple orchards.",

      bestTimeToVisit: "Mar - Jun, Sep - Nov"
    },
    {
      name: "Namdapha National Park",
      description: "Fourth largest national park in India with diverse wildlife.",

      bestTimeToVisit: "Nov - Mar"
    },
    {
      name: "Sela Pass",
      description: "High mountain pass with stunning views and Sela Lake.",

      bestTimeToVisit: "Mar - Jun, Sep - Nov"
    },
        {
          name: "Tawang Monastery",
          description: "Home to the 400-year-old Tawang Monastery, stunning mountain views, and pristine lakes. A spiritual and scenic paradise.",

          bestTimeToVisit: "Oct - May"
        },
        {
          name: "Ziro Valley",
          description: "Known for its rice fields, the indigenous Apatani tribe, and the annual Ziro Music Festival. A UNESCO World Heritage Site.",

          bestTimeToVisit: "Oct - May"
        }
      ]
    },
    {
      state: "Assam",
      count: 6,
      destinations: [
            {
      name: "Majuli Island",
      description: "World’s largest river island, famous for satras and culture.",

      bestTimeToVisit: "Oct - Mar"
    },
    {
      name: "Kamakhya Temple",
      description: "Famous Shakti Peetha dedicated to Goddess Kamakhya.",

      bestTimeToVisit: "Oct - Mar"
    },
    {
      name: "Sualkuchi",
      description: "Village known as the Silk capital of Assam.",

      bestTimeToVisit: "Oct - Mar"
    },
    {
      name: "Manas National Park",
      description: "UNESCO biosphere reserve with elephants, tigers, and diverse fauna.",

      bestTimeToVisit: "Nov - Apr"
    },
        {
          name: "Brahmaputra River",
          description: "The gateway to Northeast India with the sacred Kamakhya Temple and proximity to the mighty Brahmaputra River.",

          bestTimeToVisit: "Nov - Mar"
        },
        {
          name: "Kaziranga Park",
          description: "UNESCO World Heritage Site famous for the one-horned rhinoceros and tiger reserve. Home to diverse wildlife and bird species.",

          bestTimeToVisit: "Nov - Mar"
        }
      ]
    },

    {
      state: "Bihar",
      count: 5,
      destinations: [
        {
          name: "Mahabodhi Temple",
          description: "The place where Lord Buddha attained enlightenment. Home to the sacred Mahabodhi Temple and numerous Buddhist monasteries.",

          bestTimeToVisit: "Oct - Mar"
        },
        {
            name: "Golghar",
            description: "Granary built during British rule with panoramic city views.",

            "bestTimeToVisit": "Oct - Mar"
        },
        {
            name: "Patna Sahib Gurudwara",
            description: "Important Sikh pilgrimage site, birthplace of Guru Gobind Singh.",

            "bestTimeToVisit": "All Year"
        },
        {
            name: "Vishnupad Temple",
            description: "Ancient temple dedicated to Lord Vishnu.",

            "bestTimeToVisit": "Oct - Mar"
        },
        {
              name: "Nalanda Ruins",
              description: "Site of the ancient Nalanda University, one of the world's oldest universities. A significant archaeological site.",

              bestTimeToVisit: "Oct - Mar"
        }
      ]
    },
    {
      state: "Chhattisgarh",
      count: 5,
      destinations: [
            {
      name: "Kanger Valley",
      description: "Biodiversity hotspot with caves and waterfalls.",

      bestTimeToVisit: "Oct - Mar"
    },
    {
      name: "Bastar",
      description: "Cultural hub with tribal villages, handicrafts, and festivals.",

      bestTimeToVisit: "Oct - Mar"
    },
    {
      name: "Bhoramdeo Temple",
      description: "Historic temple complex often called the Khajuraho of Chhattisgarh.",

      bestTimeToVisit: "Oct - Mar"
    },
        {
          name: "Chitrakote Falls",
          description: "Often called the 'Niagara Falls of India', this horseshoe-shaped waterfall on the Indravati River is a spectacular sight.",

          bestTimeToVisit: "Oct - Mar"
        },
        {
          name: "Raipur",
          description: "The capital city with a blend of urban development and natural beauty. Known for Mahant Ghasidas Memorial Museum and Nandan Van Zoo.",

          bestTimeToVisit: "Oct - Mar"
        }
      ]
    },
    {
  state: "Andaman & Nicobar Islands",
  count: 5,
  destinations: [
    {
      name: "Radhanagar Beach",
      description: "Pristine beach on Havelock Island, ideal for sunsets and swimming.",

      bestTimeToVisit: "Nov - Apr"
    },
    {
      name: "Cellular Jail",
      description: "Historic colonial prison and freedom struggle monument in Port Blair.",

      bestTimeToVisit: "Oct - Mar"
    },
    {
      name: "Ross Island",
      description: "Abandoned British settlement with ruins and history.",

      bestTimeToVisit: "Oct - Mar"
    },
    {
      name: "Havelock Island",
      description: "Popular for diving, snorkeling, and clear waters.",

      bestTimeToVisit: "Nov - Apr"
    },
    {
      name: "Neil Island",
      description: "Serene island with beaches and coral reefs.",

      bestTimeToVisit: "Nov - Apr"
    }
  ]
},
{
  state: "Lakshadweep",
  count: 5,
  destinations: [
    {
      name: "Agatti Island",
      description: "Coral island with lagoons, water sports, and diving.",

      bestTimeToVisit: "Oct - Mar"
    },
    {
      name: "Bangaram Island",
      description: "Uninhabited island, perfect for beach lovers and snorkelling.",

      bestTimeToVisit: "Oct - Mar"
    },
    {
      name: "Kadmat Island",
      description: "Famous for diving, dolphin spotting, and pristine beaches.",

      bestTimeToVisit: "Oct - Mar"
    },
    {
      name: "Minicoy Island",
      description: "Island with lighthouse, lagoon, and rich culture.",

      bestTimeToVisit: "Oct - Mar"
    },
    {
      name: "Kavaratti Island",
      description: "Capital island with mosques, beaches, and lagoons.",

      bestTimeToVisit: "Oct - Mar"
    }
  ]
},

    {
      state: "Goa",
      count: 7,
      destinations: [
            {
      name: "Baga Beach",
      description: "Lively beach famous for nightlife and water sports.",

      bestTimeToVisit: "Nov - Feb"
    },
    {
      name: "Calangute Beach",
      description: "Queen of Beaches, bustling with tourists and shacks.",

      bestTimeToVisit: "Nov - Feb"
    },
    {
      name: "Basilica of Bom Jesus",
      description: "UNESCO World Heritage Church housing relics of St. Francis Xavier.",

      bestTimeToVisit: "Nov - Feb"
    },
    {
      name: "Dudhsagar Falls",
      description: "Spectacular four-tiered waterfall on Goa-Karnataka border.",

      bestTimeToVisit: "Jul - Sep"
    },
    {
      name: "Anjuna Beach",
      description: "Known for trance parties and flea markets.",

      bestTimeToVisit: "Nov - Feb"
    },
        {
          name: "Baga Beach",
          description: "Known for its lively beaches, water sports, vibrant nightlife, and Portuguese heritage.",

          bestTimeToVisit: "Nov - May"
        },
        {
          name: "Palolem Beach",
          description: "Features more relaxed and less crowded beaches, luxury resorts, and pristine natural beauty. Perfect for a peaceful getaway.",

          bestTimeToVisit: "Nov - May"
        }
      ]
    },
    {
  state: "Karnataka",
  count: 5,
  destinations: [
    {
      name: "Bengaluru",
      description: "IT hub with parks, nightlife, and modern culture.",

      bestTimeToVisit: "Oct - Feb"
    },
    {
      name: "Mysuru",
      description: "Famous for Mysore Palace and Dasara festival.",

      bestTimeToVisit: "Oct - Mar"
    },
    {
      name: "Hampi",
      description: "UNESCO World Heritage ruins of Vijayanagara Empire.",

      bestTimeToVisit: "Oct - Mar"
    },
    {
      name: "Coorg",
      description: "Scenic coffee plantations and lush hills.",

      bestTimeToVisit: "Oct - May"
    },
    {
      name: "Gokarna",
      description: "Peaceful beach town with temples and trekking.",

      bestTimeToVisit: "Oct - Mar"
    }
  ]
},

    {
      state: "Gujarat",
      count: 6,
      destinations: [
            {
      name: "Gir National Park",
      description: "Only natural habitat of Asiatic lions.",

      bestTimeToVisit: "Dec - Mar"
    },
    {
      name: "Somnath",
      description: "One of the twelve Jyotirlingas of Lord Shiva.",

      bestTimeToVisit: "Oct - Mar"
    },
    {
      name: "Dwarka",
      description: "Ancient kingdom of Lord Krishna and Char Dham site.",

      bestTimeToVisit: "Oct - Mar"
    },
    {
      name: "Saputara",
      description: "Hill station with lush greenery and waterfalls.",

      bestTimeToVisit: "Jul - Sep"
    },
        {
          name: "Ahmedabad",
          description: "A UNESCO World Heritage City with stunning architecture, vibrant markets, and rich cultural heritage.",

          bestTimeToVisit: "Oct - Mar"
        },
        {
          name: "Rann of Kutch",
          description: "The white salt desert that transforms into a surreal landscape, especially during the Rann Utsav festival.",

          bestTimeToVisit: "Oct - Mar"
        }
      ]
    },
    {
      state: "Haryana",
      count: 5,
      destinations: [
        {
          name: "Pinjore Gardens",
          description: "Beautiful Mughal garden complex with fountains and historic structures.",

          bestTimeToVisit: "Oct - Mar"
        },
        {
          name: "Morni Hills",
          description: "Scenic hill station with lakes, trekking routes, and greenery.",

          bestTimeToVisit: "Oct - Mar"
        },

        {
          name: "Gurgaon",
          description: "A major financial and technology hub with modern architecture, shopping malls, and entertainment options.",

          bestTimeToVisit: "Oct - Mar"
        },
        {
          name: "Kurukshetra",
          description: "The legendary battlefield of the Mahabharata with historical and religious significance.",

          bestTimeToVisit: "Oct - Mar"
        }
      ]
    },
    {
      state: "Himachal Pradesh", 
      count: 5,
      destinations: [
        {
          name: "Dharamshala",
          description: "Home to the Dalai Lama and Tibetan government in exile. Known for Tibetan culture, monasteries, and beautiful landscapes.",

          bestTimeToVisit: "Apr - Jun, Sep - Nov"
        },
        {
          name: "Manali",
          description: "A popular hill station with adventure activities, snow-capped mountains, and the beautiful Rohtang Pass.",

          bestTimeToVisit: "Apr - Jun, Sep - Nov"
        },
        {
          name: "Shimla",
          description: "The former summer capital of British India, known for its colonial architecture, Mall Road, and panoramic mountain views.",

          bestTimeToVisit: "Apr - Jun, Sep - Nov"
        },
            {
          name: "Spiti Valley",
          description: "Cold desert valley with monasteries and breathtaking landscapes.",

          bestTimeToVisit: "Jun - Sep"
        },
        {
          name: "Kullu",
          description: "Valley of Gods, famous for apple orchards and Dussehra festival.",

          bestTimeToVisit: "Mar - Jun, Sep - Nov"
        }
      ]
    },
    {
  state: "Puducherry",
  count: 5,
  destinations: [
    {
      name: "Promenade Beach",
      description: "Popular urban beach for evening strolls.",

      bestTimeToVisit: "Oct - Mar"
    },
    {
      name: "Auroville",
      description: "International township known for Matrimandir and spirituality.",

      bestTimeToVisit: "Oct - Mar"
    },
    {
      name: "Paradise Beach",
      description: "Secluded beach accessible by boat, perfect for relaxation.",

      bestTimeToVisit: "Oct - Mar"
    },
    {
      name: "French Quarter",
      description: "Colonial architecture with colorful streets and cafes.",

      bestTimeToVisit: "Oct - Mar"
    },
    {
      name: "Serenity Beach",
      description: "Quiet beach ideal for surfing and meditation.",

      bestTimeToVisit: "Oct - Mar"
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

          bestTimeToVisit: "Oct - Mar"
        },
        {
          name: "Ranchi",
          description: "The capital city surrounded by waterfalls, hills, and forests. Known for Hundru Falls and Tagore Hill.",

          bestTimeToVisit: "Oct - Mar"
        }
      ]
    },
    {
      state: "Kerala",
      count: 2,
      destinations: [
            {
      name: "Thekkady",
      description: "Home to Periyar Wildlife Sanctuary and spice plantations.",

      bestTimeToVisit: "Sep - May"
    },
    {
      name: "Kumarakom",
      description: "Backwater village famous for bird sanctuary and luxury resorts.",

      bestTimeToVisit: "Nov - Feb"
    },
        {
          name: "Alleppey",
          description: "Famous for its backwaters, houseboats, and serene village life.",

          bestTimeToVisit: "Sep - Mar"
        },
        {
          name: "Kochi",
          description: "A coastal city with a rich history of trade, featuring Chinese fishing nets, colonial buildings, and vibrant local culture.",

          bestTimeToVisit: "Sep - Mar"
        },
        {
          name: "Munnar",
          description: "A hill station known for vast tea plantations, misty mountains, and cool climate.",

          bestTimeToVisit: "Sep - Mar"
        }
      ]
    },
    {
      state: "Madhya Pradesh",
      count: 6,
      destinations: [
            {
      name: "Kanha National Park",
      description: "Tiger reserve and lush forest sanctuary.",

      bestTimeToVisit: "Oct - Jun"
    },
    {
      name: "Bandhavgarh National Park",
      description: "Famous for tiger sightings and ancient fort ruins.",

      bestTimeToVisit: "Oct - Jun"
    },
    {
      name: "Gwalior Fort",
      description: "Historic hill fort with palaces and temples.",

      bestTimeToVisit: "Oct - Mar"
    },
    {
      name: "Orchha",
      description: "Medieval town with palaces, temples, and river views.",

      bestTimeToVisit: "Oct - Mar"
    },
        {
          name: "Bhopal",
          description: "The City of Lakes with a blend of Islamic and Hindu architecture, museums, and natural beauty.",

          bestTimeToVisit: "Oct - Mar"
        },
        {
          name: "Khajuraho",
          description: "Famous for its ancient temples with intricate carvings and sculptures. A UNESCO World Heritage Site.",

          bestTimeToVisit: "Oct - Mar"
        }
      ]
    },
    {
      state: "Maharashtra",
      count: 7,
      destinations: [
            {
      name: "Ajanta Caves",
      description: "UNESCO World Heritage Buddhist rock-cut caves.",

      bestTimeToVisit: "Nov - Mar"
    },
    {
      name: "Ellora Caves",
      description: "Remarkable rock-cut temples of Hindu, Buddhist, and Jain heritage.",

      bestTimeToVisit: "Nov - Mar"
    },
    {
      name: "Mahabaleshwar",
      description: "Hill station famous for strawberries and viewpoints.",

      bestTimeToVisit: "Oct - Jun"
    },
    {
      name: "Shirdi",
      description: "Spiritual town of Sai Baba devotees.",

      bestTimeToVisit: "Oct - Mar"
    },
        {
          name: "Lonavala",
          description: "A popular hill station between Mumbai and Pune, known for valleys, lakes, and the famous Lonavala chikki.",

          bestTimeToVisit: "Oct - May"
        },
        {
          name: "Mumbai",
          description: "India's financial capital and home to Bollywood. Coastal beauty with colonial architecture.",

          bestTimeToVisit: "Oct - May"
        },
        {
          name: "Pune",
          description: "A blend of tradition and modernity with historical sites and educational institutions.",

          bestTimeToVisit: "Oct - May"
        }
      ]
    },
    {
      state: "Manipur",
      count: 2,
      destinations: [
            {
      name: "Keibul Lamjao",
      description: "World’s only floating national park, home to Sangai deer.",

      bestTimeToVisit: "Nov - Apr"
    },
    {
      name: "Ima Keithel Market",
      description: "Unique all-women’s market in Imphal.",

      bestTimeToVisit: "All Year"
    },
    {
      name: "Ukhrul",
      description: "Hill town famous for Shirui lily and tribal culture.",

      bestTimeToVisit: "Mar - Jun, Sep - Nov"
    },
        {
          name: "Imphal",
          description: "The capital city with Loktak Lake, Kangla Fort, and vibrant cultural traditions.",

          bestTimeToVisit: "Oct - May"
        },
        {
          name: "Loktak Lake",
          description: "The largest freshwater lake in Northeast India with unique floating islands called phumdis.",

          bestTimeToVisit: "Oct - May"
        }
      ]
    },
    {
      state: "Meghalaya",
      count: 5,
      destinations: [
            {
      name: "Mawsynram",
      description: "Holds record as wettest place in the world.",

      bestTimeToVisit: "Oct - May"
    },
    {
      name: "Living Root Bridges",
      description: "Unique bio-engineered bridges made of tree roots.",

      bestTimeToVisit: "Oct - May"
    },
    {
      name: "Dawki",
      description: "Famous for its crystal-clear Umngot River.",

      bestTimeToVisit: "Oct - Mar"
    },
        {
          name: "Cherrapunji",
          description: "Known for living root bridges and stunning waterfalls.",

          bestTimeToVisit: "Sep - May"
        },
        {
          name: "Shillong",
          description: "The 'Scotland of the East' with rolling hills, waterfalls, and pleasant climate.",

          bestTimeToVisit: "Sep - May"
        }
      ]
    },
    {
      state: "Mizoram",
      count: 5,
      destinations: [
            {
      name: "Phawngpui",
      description: "Highest peak of Mizoram with rich biodiversity.",

      bestTimeToVisit: "Oct - Mar"
    },
    {
      name: "Vantawng Falls",
      description: "Tallest waterfall in Mizoram surrounded by lush forests.",

      bestTimeToVisit: "Oct - Mar"
    },
    {
      name: "Reiek",
      description: "Scenic hill offering panoramic views and heritage village.",

      bestTimeToVisit: "Oct - Mar"
    },
        {
          name: "Aizawl",
          description: "The capital city built on steep hills with panoramic views and vibrant markets.",

          bestTimeToVisit: "Oct - May"
        },
        {
          name: "Champhai",
          description: "A picturesque town near Myanmar border with vineyards, lakes, and landscapes.",

          bestTimeToVisit: "Oct - May"
        }
      ]
    },
    {
      state: "Nagaland",
      count: 6,
      destinations: [
            {
      name: "Dimapur",
      description: "Commercial hub with ancient ruins and markets.",

      bestTimeToVisit: "Oct - Mar"
    },
    {
      name: "Dzükou Valley",
      description: "Beautiful valley of flowers and trekking paradise.",

      bestTimeToVisit: "Jun - Sep"
    },
    {
      name: "Mokokchung",
      description: "Cultural center of the Ao tribe.",

      bestTimeToVisit: "Oct - Mar"
    },
    {
      name: "Mon",
      description: "Home of the Konyak tribe, known for traditional headhunting culture.",

      bestTimeToVisit: "Oct - Mar"
    },
        {
          name: "Dzukou Valley",
          description: "A hidden paradise with rolling hills, wildflowers, and trekking trails.",

          bestTimeToVisit: "Oct - May"
        },
        {
          name: "Kohima",
          description: "The capital city with Hornbill Festival, War Cemetery, and Naga tribal culture.",

          bestTimeToVisit: "Oct - May"
        }
      ]
    },
    {
      state: "Odisha",
      count: 5,
      destinations: [
        {
          name: "Konark Temple",
          description: "UNESCO World Heritage Site shaped like a giant chariot.",

          bestTimeToVisit: "Oct - Mar"
        },
        {
          name: "Chilika Lake",
          description: "Asia’s largest brackish water lagoon, famous for birdwatching and dolphins.",

          bestTimeToVisit: "Nov - Feb"
        },
        {
          name: "Khandagiri Caves",
          description: "Ancient rock-cut caves with Jain heritage.",

          bestTimeToVisit: "Oct - Mar"
        },
        {
          name: "Bhubaneswar",
          description: "The 'Temple City of India' with ancient temples and rich cultural heritage.",

          bestTimeToVisit: "Oct - Apr"
        },
        {
          name: "Puri",
          description: "Famous for Jagannath Temple, beaches, and the annual Rath Yatra festival.",

          bestTimeToVisit: "Oct - Apr"
        }
      ]
    },
    {
      state: "Punjab",
      count: 5,
      destinations: [
        {
          name: "Wagah Border",
          description: "International border with Pakistan, famous for daily Beating Retreat ceremony.",

          bestTimeToVisit: "Oct - Mar"
        },
        {
          name: "Jallianwala Bagh",
          description: "Historic site of the 1919 massacre, now a memorial garden.",

          bestTimeToVisit: "Oct - Mar"
        },
        {
          name: "Anandpur Sahib",
          description: "Important Sikh pilgrimage town, birthplace of Khalsa.",

          bestTimeToVisit: "Oct - Mar"
        },
        {
          name: "Amritsar",
          description: "Home to the Golden Temple, Wagah Border ceremony, and Punjabi cuisine.",

          bestTimeToVisit: "Oct - Mar"
        },
        {
          name: "Chandigarh",
          description: "A well-planned city with Rock Garden, Sukhna Lake, and modern architecture.",

          bestTimeToVisit: "Oct - Mar"
        }
      ]
    },
    {
      state: "Delhi",
      count: 5,
      destinations: [
        {
          name: "India Gate",
          description: "War memorial dedicated to Indian soldiers.",

          bestTimeToVisit: "Oct - Mar"
        },
        {
          name: "Qutub Minar",
          description: "Tallest brick minaret in the world and UNESCO World Heritage Site.",

          bestTimeToVisit: "Oct - Mar"
        },
        {
          name: "Red Fort",
          description: "Magnificent Mughal fort and UNESCO heritage site.",

          bestTimeToVisit: "Oct - Mar"
        },
        {
          name: "Lotus Temple",
          description: "Baháʼí House of Worship known for its flower-like architecture.",

          bestTimeToVisit: "Oct - Mar"
        },
        {
          name: "Akshardham",
          description: "Grand Hindu temple showcasing Indian culture and spirituality.",

          bestTimeToVisit: "Oct - Mar"
        }
      ]
    },
    {
      state: "Rajasthan",
      count: 5,
      destinations: [
            {
      name: "Jodhpur",
      description: "Blue City with Mehrangarh Fort and old-world charm.",

      bestTimeToVisit: "Oct - Mar"
    },
    {
      name: "Pushkar",
      description: "Holy town with Brahma Temple and Camel Fair.",

      bestTimeToVisit: "Oct - Mar"
    },
        {
          name: "Jaipur",
          description: "The Pink City with forts, palaces, and vibrant culture.",

          bestTimeToVisit: "Oct - Mar"
        },
        {
          name: "Jaisalmer",
          description: "The Golden City with yellow sandstone architecture.",

          bestTimeToVisit: "Oct - Mar"
        },
        {
          name: "Udaipur",
          description: "The City of Lakes with romantic settings, palaces, and gardens.",

          bestTimeToVisit: "Oct - Mar"
        }
      ]
    },
    {
      state: "Sikkim",
      count: 5,
      destinations: [
        {
          name: "Nathula Pass",
          description: "Historic mountain pass on Indo-China border.",

          bestTimeToVisit: "May - Oct"
        },
        {
          name: "Yumthang Valley",
          description: "Valley of Flowers, famous for rhododendrons and hot springs.",

          bestTimeToVisit: "Apr - Jun, Sep - Nov"
        },
        {
          name: "Pelling",
          description: "Town with views of Kanchenjunga and ancient monasteries.",

          bestTimeToVisit: "Mar - Jun, Sep - Nov"
        },
        {
          name: "Gangtok",
          description: "The capital with monasteries, cable cars, and Himalayan views.",

          bestTimeToVisit: "Mar - May, Sep - Nov"
        },
        {
          name: "Tsomgo Lake",
          description: "A high-altitude glacial lake sacred to locals.",

          bestTimeToVisit: "Mar - May, Sep - Nov"
        }
      ]
    },
    {
      state: "Tamil Nadu",
      count: 3,
      destinations: [
            {
      name: "Rameswaram",
      description: "Spiritual town and one of the Char Dhams.",

      bestTimeToVisit: "Oct - Apr"
    },
    {
      name: "Kanyakumari",
      description: "Southern tip of India where three seas meet.",

      bestTimeToVisit: "Oct - Mar"
    },
        {
          name: "Chennai",
          description: "The cultural capital with beaches, temples, and heritage.",

          bestTimeToVisit: "Oct - Mar"
        },
        {
          name: "Madurai",
          description: "Known for magnificent Meenakshi Amman Temple.",

          bestTimeToVisit: "Oct - Mar"
        },
        {
          name: "Ooty",
          description: "A hill station with tea gardens, botanical gardens, and Nilgiri Mountain Railway.",

          bestTimeToVisit: "Oct - Mar"
        }
      ]
    },
    {
      state: "Telangana",
      count: 2,
      destinations: [
            {
      name: "Nagarjuna Sagar",
      description: "Massive dam and Buddhist heritage site.",

      bestTimeToVisit: "Oct - Mar"
    },
    {
      name: "Ramoji Film City",
      description: "World’s largest film studio complex.",

      bestTimeToVisit: "Oct - Mar"
    },
    {
      name: "Basar",
      description: "Pilgrimage town famous for Saraswati temple.",

      bestTimeToVisit: "Oct - Mar"
    },
        {
          name: "Hyderabad",
          description: "The 'City of Pearls' with Charminar, Golconda Fort, and a blend of cultures.",

          bestTimeToVisit: "Oct - May"
        },
        {
          name: "Warangal",
          description: "Ancient city with Warangal Fort, Thousand Pillar Temple, and Kakatiya heritage.",

          bestTimeToVisit: "Oct - May"
        }
      ]
    },
    {
  state: "Jammu & Kashmir",
  count: 5,
  destinations: [
    {
      name: "Srinagar",
      description: "Famous for Dal Lake, houseboats, and Mughal gardens.",

      bestTimeToVisit: "Apr - Oct"
    },
    {
      name: "Gulmarg",
      description: "Popular ski resort and meadow of flowers.",

      bestTimeToVisit: "Dec - Mar (snow), Apr - Oct (scenic)"
    },
    {
      name: "Pahalgam",
      description: "Picturesque valley, starting point for Amarnath Yatra.",

      bestTimeToVisit: "Apr - Oct"
    },
    {
      name: "Vaishno Devi",
      description: "One of the most revered Hindu pilgrimage sites.",

      bestTimeToVisit: "All Year"
    },
    {
      name: "Sonamarg",
      description: "Valley of Gold, famous for glaciers and trekking.",

      bestTimeToVisit: "Apr - Oct"
    }
  ]
},

    {
      state: "Tripura",
      count: 2,
      destinations: [
            {
      name: "Ujjayanta Palace",
      description: "Royal palace in Agartala, now a museum.",

      bestTimeToVisit: "Oct - Mar"
    },
    {
      name: "Neermahal",
      description: "Water palace built in the middle of Rudrasagar Lake.",

      bestTimeToVisit: "Oct - Mar"
    },
    {
      name: "Jampui Hills",
      description: "Hill station known for oranges and scenic beauty.",

      bestTimeToVisit: "Oct - Mar"
    },
    {
      name: "Sepahijala Sanctuary",
      description: "Biodiversity hotspot with primates, birds, and lakes.",

      bestTimeToVisit: "Oct - Mar"
    },
        {
          name: "Agartala",
          description: "Capital city with Ujjayanta Palace, Neermahal Palace, and lakes.",

          bestTimeToVisit: "Oct - Mar"
        },
        {
          name: "Unakoti",
          description: "Ancient pilgrimage site with rock-cut sculptures from 7th–9th centuries.",

          bestTimeToVisit: "Oct - Mar"
        }
      ]
    },

    {
      state: "Uttar Pradesh",
      count: 5,
      destinations: [
        {
          name: "Fatehpur Sikri",
          description: "Iconic Mayapur, forts, and Mughal history.",

          bestTimeToVisit: "Oct - Mar"
        },
        {
          name: "Lucknow",
          description: "City of Nawabs famous for architecture, cuisine, and embroidery.",

          bestTimeToVisit: "Oct - Mar"
        },
        {
          name: "Varanasi",
          description: "One of the world's oldest cities with ghats, Ganges, and spiritual significance.",

          bestTimeToVisit: "Oct - Mar"
        },
        {
          name: "Taj Mahal",
          description: "UNESCO World Heritage Site and one of the Seven Wonders of the World.",

          bestTimeToVisit: "Oct - Mar"
        },
        {
          name: "Ayodhya",
          description: "Birthplace of Lord Rama and major Hindu pilgrimage site.",

          bestTimeToVisit: "Oct - Mar"
        }

      ]
    },
    {
      state: "Uttarakhand",
      count: 5,
      destinations: [
        {
          name: "Nainital",
          description: "Popular hill station with lake, boating, and trekking.",

          bestTimeToVisit: "Apr - Jun, Sep - Nov"
        },
        {
          name: "Rishikesh",
          description: "The Yoga Capital with ashrams, adventure sports, and Ganges.",

          bestTimeToVisit: "Apr - Jun, Sep - Nov"
        },
        {
          name: "Haridwar",
          description: "Major Hindu pilgrimage site on the banks of the Ganges, famous for Ganga Aarti.",

          bestTimeToVisit: "Oct - Mar"
        },
        {
          name: "Mussoorie",
          description: "Known as the 'Queen of Hills' with colonial charm and panoramic views.",

          bestTimeToVisit: "Mar - Jun, Sep - Nov"
        },
        {
          name: "Kedarnath",
          description: "Sacred Hindu temple dedicated to Lord Shiva in the Himalayas.",

          bestTimeToVisit: "May - Oct"
        }
      ]
    },
    {
      state: "West Bengal",
      count: 6,
      destinations: [
        {
          name: "Victoria Memorial",
          description: "Iconic marble building symbolizing British India’s legacy.",

          bestTimeToVisit: "Oct - Mar"
        },
        {
          name: "Kalimpong",
          description: "Scenic hill town with monasteries and orchid nurseries.",

          bestTimeToVisit: "Mar - Jun, Sep - Nov"
        },
        {
          name: "Digha",
          description: "Popular seaside destination on the Bay of Bengal.",

          bestTimeToVisit: "Oct - Mar"
        },
        {
          name: "Darjeeling",
          description: "Famous for Darjeeling tea, Himalayan Railway, and Kanchenjunga views.",

          bestTimeToVisit: "Oct - Mar"
        },
        {
          name: "Kolkata",
          description: "The cultural capital with colonial architecture and rich heritage.",

          bestTimeToVisit: "Oct - Mar"
        },
        {
          name: "Sundarbans",
          description: "Largest mangrove forest, home to Royal Bengal Tiger, UNESCO World Heritage Site.",

          bestTimeToVisit: "Oct - Mar"
        }
      ]
    }
  ];

  const destinationList = destinationsByState.map(state => ({
    ...state,
    destinations: state.destinations.map(dest => ({
      id: dest.name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, ''),
      name: dest.name,
      state: state.state,
      description: dest.description,
      season: "all",
      bestTimeToVisit: "Oct - May"
    }))
  }));

  // Update with seasonal data
  seasonalDestinations.forEach(seasonal => {
    const stateObj = destinationList.find(s => s.state === seasonal.state);
    if (stateObj) {
      const dest = stateObj.destinations.find(d => d.id === seasonal.id || d.name === seasonal.name);
      if (dest) {
        dest.season = seasonal.season;
        dest.name = seasonal.name;
        dest.description = seasonal.description;
        dest.id = seasonal.id;
        dest.bestTimeToVisit = seasonal.bestTimeToVisit;
      } else {
        // add new
        stateObj.destinations.push({
          id: seasonal.id,
          name: seasonal.name,
          state: seasonal.state,
          description: seasonal.description,
          season: seasonal.season,
          bestTimeToVisit: seasonal.bestTimeToVisit
        });
        stateObj.count++;
      }
    }
  });

  // Indian states for filtering
  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ];

export { locations, seasons, destinationList, seasonalDestinations, indianStates };
