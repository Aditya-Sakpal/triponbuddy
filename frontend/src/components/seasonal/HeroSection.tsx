import destinationsHeroBg from "@/assets/destinations-hero-bg.jpg";

export const HeroSection = () => {
  return (

      <section 
        className="relative h-96 bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: `url(${destinationsHeroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30" />
        <div className="relative container mx-auto px-6 h-full flex items-center justify-center">
          <div className="max-w-4xl text-white text-center">
            <h1 className="font-bold mb-6" style={{ fontSize: '2.8rem' }}>
              Explore Incredible Destinations Worldwide
            </h1>
            <p className="leading-relaxed text-white/90" style={{ fontSize: '1.2rem' }}>
              Discover the diverse beauty of both domestic and international destinations - from majestic mountains and serene beaches to ancient temples and vibrant cities
            </p>
          </div>
        </div>
      </section>
    );
};