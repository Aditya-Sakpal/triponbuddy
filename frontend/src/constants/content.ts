import { MapPin, Building, Utensils, DollarSign, Plane, CheckCircle } from "lucide-react";

// Home content
export const features = [
    {
      icon: MapPin,
      title: "Personalized Itineraries",
      description: "Get personalized travel plans tailored to your preferences, budget, and schedule."
    },
    {
      icon: Building,
      title: "Accommodation Options",
      description: "Find the perfect places to stay that match your style and budget."
    },
    {
      icon: Utensils,
      title: "Local Recommendations",
      description: "Discover hidden gems and local favorites for authentic experiences."
    },
    {
      icon: DollarSign,
      title: "Budget Management",
      description: "Keep track of your expenses and plan according to your budget."
    }
  ];

export const whyFeatures = [
  {
    icon: Plane,
    title: "Trip Planning",
    description: "TriponBuddy creates perfect itineraries. Our trip buddy algorithm analyzes thousands of travel patterns to suggest the best routes, timings, and experiences for your trip."
  },
  {
    icon: DollarSign,
    title: "Compare & Save on Travel Packages",
    description: "TriponBuddy aggregates deals from 100+ verified vendors. Compare honeymoon packages, group tours, and luxury trips. Save up to 30% when you book with TriponBuddy!"
  },
  {
    icon: CheckCircle,
    title: "Verified & Trusted",
    description: "Every travel package on TriponBuddy is verified. Read genuine TriponBuddy reviews from 50,000+ happy travelers. Your trip buddy ensures safe and memorable journeys."
  }
];

export const testimonials = [
  {
    quote: "TriponBuddy made our family vacation to Rajasthan so easy! The detailed itinerary saved us hours of research and the local tips made our Golden Triangle tour truly special.",
    name: "Priya Sharma",
    trip: "Trip to Jaipur, Rajasthan",
  },
  {
    quote: "The personalized recommendations were spot on! We discovered hidden gems in Kerala that we never would have found on our own. Highly recommend!",
    name: "Rahul Kumar",
    trip: "Backpacking in Kerala",
  },
  {
    quote: "As a solo traveler, safety was my top concern. TriponBuddy's verified guides and 24/7 support gave me peace of mind throughout my Himalayan trek.",
    name: "Ananya Patel",
    trip: "Solo Trek in Himalayas",
  },
  {
    quote: "The cultural immersion experiences were incredible. From traditional cooking classes to local festivals, every moment was memorable.",
    name: "Vikram Singh",
    trip: "Cultural Tour of Gujarat",
  },
];

// Season content
export const seasonConfig = {
    summer: {
      title: "Summer Destinations",
      description: "Beat the heat with these cool hill stations and mountain retreats",
      color: "text-orange-600"
    },
    winter: {
      title: "Winter Destinations",
      description: "Enjoy perfect weather at beaches, deserts, and cultural sites",
      color: "text-blue-600" // Fixed typo from "text-bula"
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

// Sample trip
export const sampleTrip = {
      trip_id: 'demo-trip-' + Date.now(),
      user_id: 'demo-user',
      title: 'Relax & Rejuvenate in Mumbai: A Luxury Wellness Escape',
      destination: 'Mumbai',
      start_location: 'Bhubaneswar',
      start_date: '2025-09-11',
      duration_days: 2,
      budget: 135000,
      is_international: false,
      is_saved: false,
      itinerary_data: {
        title: 'Relax & Rejuvenate in Mumbai: A Luxury Wellness Escape',
        destination: 'Mumbai',
        duration_days: 2,
        start_date: '2025-09-11',
        estimated_total_cost: '₹135000',
        best_time_to_visit: 'October to March offers pleasant, cooler weather with lower humidity, ideal for exploring.',
        travel_tips: [
          'Mumbai traffic can be challenging; allocate extra time for travel.',
          'Stay hydrated, especially in September as humidity can be high.',
          'Pre-book all spa treatments and fine dining reservations.'
        ],
        daily_plans: [
          {
            day: 1,
            date: '2025-09-11',
            theme: 'Arrival & Ultimate Wellness Indulgence',
            activities: [
              {
                time: '08:00 AM - 10:30 AM',
                activity: 'Travel from Bhubaneshwar to Mumbai',
                location: 'Bhubaneshwar Airport to Mumbai Airport',
                description: 'Board a comfortable flight from Bhubaneshwar to Mumbai.',
                estimated_cost: '₹10000',
                duration: '2.5 hours',
                image_search_query: 'Bhubaneshwar Mumbai flight',
                booking_info: {
                  required: true,
                  url: 'https://www.makemytrip.com/flights/',
                  price_range: '₹8000-12000'
                }
              }
            ]
          }
        ],
        accommodation: [
          {
            name: 'The Taj Mahal Palace, Mumbai',
            type: 'Luxury Hotel',
            price_range: '₹28000-₹35000/night',
            rating: '4.8/5',
            location: 'Apollo Bunder, Colaba, Mumbai',
            booking_url: 'https://www.tajhotels.com/',
            amenities: ['Jiva Spa', 'Outdoor Pool', 'Fine Dining']
          }
        ],
        transportation: [
          {
            type: 'Flights',
            from: 'Bhubaneshwar (BBI)',
            to: 'Mumbai (BOM)',
            estimated_cost: '₹20000',
            duration: '2.5 hours each way',
            booking_url: 'https://www.makemytrip.com/flights/'
          }
        ],
        neighboring_places: [
          {
            name: 'Alibaug',
            distance: 'Approx. 95 km',
            description: 'A serene coastal town known for its clean beaches.',
            time_to_reach: 'Approx. 2-3 hours',
            best_known_for: 'Beaches, Kolaba Fort',
            estimated_cost: '₹4000-₹6000',
            image_search_query: 'Alibaug beach'
          }
        ]
      },
      tags: ['Luxury', 'Wellness', 'Relaxation'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

// Note: destinationContent.ts is very large and contains dynamic imports and data.
// For now, re-exporting the necessary exports from there.
export { locations, seasons, destinationList, indianStates } from '../content/destinationContent';