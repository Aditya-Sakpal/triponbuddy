export const HeroSection = () => {
  return (
    <div className="relative h-[60vh] md:h-[70vh] flex items-center justify-center text-center px-6">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in my-12">
        {/* Main Title */}
        <h1 className="text-4xl md:text-6xl font-bold font-latin text-white leading-tight">
          TripOnBuddy
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl font-latin text-white/90 leading-relaxed max-w-2xl mx-auto">
          Welcome to TripOnBuddy! Your Trip Buddy for Perfect Travel.
        </p>
        
      </div>
    </div>
  );
};

