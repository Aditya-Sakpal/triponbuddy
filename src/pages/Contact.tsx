import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { User, Mail, MapPin } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Main Content */}
      <div className="pt-32 pb-16">
        <div className="container mx-auto px-6">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Contact Us
            </h2>
          </div>

          {/* Blue Contact Us Heading */}
          <div className="text-center mb-8">
            {/* <h2 className="text-3xl font-bold text-blue-600">
              Contact Us
            </h2> */}
          </div>

          {/* Contact Card */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              {/* <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">
                Contact Us
              </h3> */}

              <div className="space-y-6">
                {/* Founders */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">Founders</h4>
                    <p className="text-gray-600">Arnav Sandip Raj</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">Email</h4>
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
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">Headquarters</h4>
                    <p className="text-gray-600">India</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;