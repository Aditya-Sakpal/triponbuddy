import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { DestinationCard } from "@/components/shared/DestinationCard";
import { destinationList } from "@/constants";
import { seasonConfig } from "@/constants";
import { SeasonSelector } from "./SeasonSelector";

export const SeasonalTabs = () => {
  const [activeTab, setActiveTab] = useState("summer");

  const getDestinationsBySeason = (season: string) => {
    return destinationList.flatMap(state => state.destinations).filter(dest => dest.season === season);
  };

    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Seasonal Recommendations
            </h2>
            <div className="w-16 h-1 bg-bula mx-auto mb-8"></div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <SeasonSelector />

            {Object.entries(seasonConfig).map(([season, config]) => (
              <TabsContent key={season} value={season} className="space-y-8">
                <div className="text-center space-y-4">
                  <h2 className={`text-3xl font-bold ${config.color}`}>
                    {config.title}
                  </h2>
                  <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    {config.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {getDestinationsBySeason(season).map((destination) => (
                    <DestinationCard
                      key={destination.id}
                      destination={destination}
                      showState={true}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>
    );
};
    