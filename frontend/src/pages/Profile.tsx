import { Footer, Navigation } from "@/components/shared";
import { HeroSection } from "@/components/profile";

const Profile = () => {
    return (
      <div className="min-h-screen bg-background">
          <Navigation />
          
          <HeroSection />
          
          <Footer />
      </div>
  );
};

export default Profile;