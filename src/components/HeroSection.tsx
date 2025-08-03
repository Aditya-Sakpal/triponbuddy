const HeroSection = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center text-center px-6">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Main Title */}
        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight animate-float">
          TripOnBuddy
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-2xl mx-auto">
          Welcome to TripOnBuddy! Your Trip Buddy for Perfect Travel on Budget.
        </p>
        
        {/* Call to Action */}
        <div className="pt-8 space-y-4">
          <button className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-xl">
            Start Your Journey
          </button>
          <p className="text-white/70 text-sm">
            Discover amazing destinations around the world
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;