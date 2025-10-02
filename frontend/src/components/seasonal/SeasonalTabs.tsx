import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DestinationCard } from "@/components/shared/DestinationCard";
import { seasonalDestinations } from "@/constants";
import { seasonConfig } from "@/constants";

export const SeasonalTabs = () => {
  const [activeTab, setActiveTab] = useState("summer");

  const getDestinationsBySeason = (season: string) => {
    return seasonalDestinations.filter(dest => dest.season === season);
  };

  const tabs = [
    { value: "summer", label: "Summer Destinations" },
    { value: "winter", label: "Winter Destinations" },
    { value: "monsoon", label: "Monsoon Escapes" },
    { value: "autumn", label: "Autumn Favorites" },
  ];

    return (
      <section className="py-16 bg-bula/10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Seasonal Recommendations
            </h2>
            <div className="w-16 h-1 bg-bula mx-auto mb-8"></div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 gap-4 md:inline-flex md:h-auto md:items-center md:justify-center md:gap-8 md:rounded-none md:bg-transparent md:p-0 md:border-b md:border-gray-200 md:w-full pb-24">
              {tabs.map(tab => (
                <TabsTrigger 
                  key={tab.value}
                  value={tab.value}
                  className="rounded-none border-b-2 px-0 pb-3 pt-0 font-medium text-gray-600 shadow-none transition-none data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none hover:text-blue-600 text-sm md:text-xl"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(seasonConfig).map(([season, config]) => (
              <TabsContent key={season} value={season} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center space-y-4">
                  <h2 className={`text-3xl font-bold ${config.color}`}>
                    {config.title}
                  </h2>
                  <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    {config.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {getDestinationsBySeason(season).map((destination, index) => (
                    <div
                      key={destination.id}
                      className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <DestinationCard
                        destination={destination}
                        showState={true}
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>
    );
};
    