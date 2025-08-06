import { Plane, DollarSign, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const WhyTriponBuddySection = () => {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Main Title */}
        <h2 className="text-4xl font-bold text-center mb-12 text-blue-600">
          Why TriponBuddy is India's Best Trip Buddy
        </h2>
        
        {/* Three Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Trip Planning */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Plane className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Trip Planning</h3>
            <p className="text-gray-600 leading-relaxed">
              TriponBuddy creates perfect itineraries. Our trip buddy algorithm analyzes thousands of travel patterns to suggest the best routes, timings, and experiences for your trip.
            </p>
          </div>

          {/* Compare & Save */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Compare & Save on Travel Packages</h3>
            <p className="text-gray-600 leading-relaxed">
              TriponBuddy aggregates deals from 100+ verified vendors. Compare honeymoon packages, group tours, and luxury trips. Save up to 30% when you book with TriponBuddy!
            </p>
          </div>

          {/* Verified & Trusted */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Verified & Trusted</h3>
            <p className="text-gray-600 leading-relaxed">
              Every travel package on TriponBuddy is verified. Read genuine TriponBuddy reviews from 50,000+ happy travelers. Your trip buddy ensures safe and memorable journeys.
            </p>
          </div>
        </div>

        {/* Popular Trip Searches Popup */}
        <div className="text-center">
          <Dialog>
            <DialogTrigger asChild>
              <button className="text-blue-600 hover:text-blue-800 font-semibold underline">
                View Popular Trip Searches on TriponBuddy
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  Popular Trip Searches on TriponBuddy
                </DialogTitle>
              </DialogHeader>
              <div className="text-gray-600 leading-relaxed">
                <p>
                  <span className="font-semibold text-gray-900">Trending on TriponBuddy:</span> Kerala honeymoon packages | Goa beach resorts | Rajasthan heritage tours | Himachal adventure trips | Kashmir family packages | Andaman water sports | Ladakh bike trips | Northeast India tours | Golden Triangle packages | Mumbai weekend getaways | Bangalore to Coorg trips | Delhi to Shimla tours | Kolkata to Darjeeling packages | Chennai to Pondicherry trips | Hyderabad to Araku Valley
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
};

export default WhyTriponBuddySection;