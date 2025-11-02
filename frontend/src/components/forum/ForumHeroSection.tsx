/**
 * Forum Hero Section Component
 * Hero section with background image and title for the forum page
 */

import destinationsHeroBg from "@/assets/destinations-hero-bg.jpg";

export const ForumHeroSection = () => {
  return (
    <section
      className="relative py-28 px-6 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(102, 126, 234, 0.8), rgba(147, 107, 230, 0.8)), url(${destinationsHeroBg})`,
      }}
    >
      <div className="container mx-auto text-center relative z-10">
        <h1 className="font-bold mb-6 text-4xl md:text-5xl text-white">
          Community Forum
        </h1>
        <p className="text-lg leading-relaxed text-white/90 max-w-3xl mx-auto">
          Share your travel experiences, connect with fellow travelers, and discover amazing 
          stories from around the world. Join our vibrant community of adventure seekers!
        </p>
      </div>
    </section>
  );
};
