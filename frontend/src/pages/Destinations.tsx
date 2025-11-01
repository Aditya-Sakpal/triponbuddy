import { useState } from "react";
import { HeroSection, FilterSection, DestList } from "@/components/destination";

const Destinations = () => {
    const [selectedLocation, setSelectedLocation] = useState("all");
    const [selectedSeason, setSelectedSeason] = useState("all");
    const [isWorldwide, setIsWorldwide] = useState(false);

    return (
      <>
          <HeroSection />
          <FilterSection 
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
            selectedSeason={selectedSeason}
            setSelectedSeason={setSelectedSeason}
            isWorldwide={isWorldwide}
            setIsWorldwide={setIsWorldwide}
          />
          <DestList 
            selectedLocation={selectedLocation}
            selectedSeason={selectedSeason}
            isWorldwide={isWorldwide}
          />
      </>
  );
};

export default Destinations;