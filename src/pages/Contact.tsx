import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { User, Mail, MapPin } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header Section */}
      <section className="pt-32 pb-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Contact Us
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Get in touch with TriponBuddy for all your India travel needs. We provide support for trip planning, hotel bookings, transportation arrangements, tour packages, and travel queries. Our team helps with destinations across Kerala, Rajasthan, Goa, Himachal Pradesh, and all of India.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {/* Blue Contact Us Heading */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-blue-600 mb-8">
                Contact Us
              </h2>
            </div>

            {/* Contact Details Card */}
            <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
              <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">
                Contact Us
              </h3>

              <div className="space-y-8">
                {/* Founders */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Founders</h4>
                    <p className="text-gray-600">Arnav Sandip Raj</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Email</h4>
                    <a 
                      href="mailto:triponbuddy@gmail.com" 
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      triponbuddy@gmail.com
                    </a>
                  </div>
                </div>

                {/* Headquarters */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Headquarters</h4>
                    <p className="text-gray-600">India</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Services */}
            <div className="mt-12 bg-blue-50 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Customer Support Services
              </h3>
              <p className="text-gray-600 leading-relaxed text-center">
                Trip itinerary assistance, hotel booking support, transportation help, tour operator connections, travel documentation, visa guidance, budget planning, destination recommendations, group travel coordination, corporate travel services.
              </p>
            </div>

            {/* Contact Information */}
            <div className="mt-12 bg-green-50 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                How to Reach Us
              </h3>
              <p className="text-gray-600 leading-relaxed text-center">
                Email us at <a href="mailto:triponbuddy@gmail.com" className="text-blue-600 hover:text-blue-800 font-semibold">triponbuddy@gmail.com</a> for quick support. We respond within 24 hours. Get help with booking issues, itinerary changes, payment queries, cancellations, and travel emergencies.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;