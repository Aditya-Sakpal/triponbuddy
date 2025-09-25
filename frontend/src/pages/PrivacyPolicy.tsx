import { Card, CardContent } from "@/components/ui/card";

const PrivacyPolicy = () => {
  return (
    <div className="pt-32 pb-16">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20 overflow-hidden h-full flex flex-col">
            <CardContent className="p-8 md:p-12 flex-1 flex flex-col">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-center">
                Privacy Policy
              </h1>

              <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
                <p className="text-lg leading-relaxed">
                  At TripOnBuddy, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our trip planning platform.
                </p>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Information We Collect</h2>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Account information (name, email, profile picture) when you sign up</li>
                    <li>Trip preferences and planning data you provide</li>
                    <li>Usage data and analytics to improve our service</li>
                    <li>Device and browser information for technical support</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">How We Use Your Information</h2>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>To create and manage your personalized trip itineraries</li>
                    <li>To communicate with you about your trips and account</li>
                    <li>To improve our AI-powered trip planning features</li>
                    <li>To provide customer support and respond to your inquiries</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Data Security</h2>
                  <p>
                    We implement industry-standard security measures to protect your personal information:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li>Encryption of data in transit and at rest</li>
                    <li>Secure authentication using Clerk authentication service</li>
                    <li>Regular security audits and updates</li>
                    <li>Limited access to personal data on a need-to-know basis</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Third-Party Services</h2>
                  <p>
                    We use the following third-party services that may collect information:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li><strong>Clerk:</strong> For user authentication and account management</li>
                    <li><strong>Unsplash:</strong> For destination images (no personal data shared)</li>
                    <li><strong>Google Gemini:</strong> For AI-powered trip planning (anonymized trip data only)</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Your Rights</h2>
                  <p>You have the right to:</p>
                  <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li>Access and review your personal data</li>
                    <li>Update or correct your information</li>
                    <li>Delete your account and associated data</li>
                    <li>Opt out of non-essential communications</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
                  <p>
                    If you have any questions about this Privacy Policy or our data practices, please contact us at{" "}
                    <a href="mailto:triponbuddy@gmail.com" className="text-primary hover:underline">
                      triponbuddy@gmail.com
                    </a>
                  </p>
                </section>

                <div className="border-t pt-6 mt-8">
                  <p className="text-sm text-muted-foreground">
                    Last updated: September 25, 2025
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;