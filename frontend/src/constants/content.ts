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

// Note: destinationContent.ts is very large and contains dynamic imports and data.
// For now, re-exporting the necessary exports from there.
export { locations, seasons, destinationList, seasonalDestinations, indianStates } from '../content/destinationContent';