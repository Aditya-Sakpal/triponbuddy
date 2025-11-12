/**
 * Hosted Trips Hero Section Component
 * Hero section for the hosted trips page
 */

import destinationsHeroBg from "@/assets/destinations-hero-bg.jpg";

export const HostedTripsHeroSection = () => {
  return (
    <section
      className="relative py-28 px-6 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(102, 126, 234, 0.8), rgba(147, 107, 230, 0.8)), url(${destinationsHeroBg})`,
      }}
    >
      <div className="container mx-auto text-center relative z-10">
        <h1 className="font-bold mb-6 text-4xl md:text-5xl text-white">
          Hosted Trips
        </h1>
        <p className="text-lg leading-relaxed text-white/90 max-w-3xl mx-auto">
          Join exciting trips hosted by fellow travelers or share your own journey with the community. 
          Find travel companions and create unforgettable memories together!
        </p>
      </div>
    </section>
  );
};
