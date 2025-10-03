import tripBuddyLogo from "@/assets/triponbuddylogo.png";

export const LoadingState = () => {
  return (
    <div className="flex items-center justify-center py-12 min-h-[200px]">
      {/* Bouncing Animation Container */}
      <div className="animate-bounce-slow flex flex-col items-center space-y-4">

        {/* Floating Logo Animation with Spinning Lines */}
        <div className="relative flex items-center justify-center w-40 h-40 md:w-48 md:h-48">
          {/* Spinning circular lines around the logo - 3 separate arcs */}
          <svg className="absolute inset-0 w-40 h-40 md:w-48 md:h-48 animate-spin-slow" viewBox="0 0 160 160">
            {/* Dark Blue Arc */}
            <path
              d="M 80 20 A 60 60 0 0 1 140 80"
              fill="none"
              stroke="#2563eb"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Light Blue Arc */}
            <path
              d="M 140 80 A 60 60 0 0 1 80 140"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.6"
            />
            {/* Pink Arc */}
            <path
              d="M 80 140 A 60 60 0 0 1 20 80"
              fill="none"
              stroke="#ec4899"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.5"
            />
          </svg>

          <div className="relative z-10">
            <img
              src={tripBuddyLogo}
              alt="TripOnBuddy"
              className="w-20 h-20 md:w-24 md:h-24 object-contain drop-shadow-lg"
            />
            {/* Ripple effect */}
            <div className="absolute inset-0 rounded-full border-3 md:border-4 border-primary/30 animate-ping"></div>
          </div>
        </div>

        {/* Loading text */}
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  );
};