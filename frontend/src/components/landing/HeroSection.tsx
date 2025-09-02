const HeroSection = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center text-center px-6">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Main Title */}
        <h1 className="text-5xl md:text-7xl font-bold font-latin text-white leading-tight">
          TripOnBuddy
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl md:text-2xl font-latin text-white/90 leading-relaxed max-w-2xl mx-auto">
          Welcome to TripOnBuddy! Your Trip Buddy for Perfect Travel on Budget.
        </p>
        
      </div>
    </div>
  );
};

export default HeroSection;