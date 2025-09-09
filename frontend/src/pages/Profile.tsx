import { Footer, Navigation } from "@/components/shared";
import { HeroSection, ProfileCard } from "@/components/profile";

const Profile = () => {
    return (
      <div className="min-h-screen bg-background">
          <Navigation />
          
          <HeroSection />
          
          <ProfileCard />
          
          <div className="pb-16">
            <Footer />
          </div>
      </div>
  );
};

export default Profile;