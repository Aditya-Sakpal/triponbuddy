import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ProfileTab } from "./ProfileTab";
import { MyTripsTab } from "./MyTripsTab";

export const ProfileCard = () => {
  return (
    <div className="container mx-auto px-6 -mt-16 relative z-10 mb-16">
      <Card className="max-w-6xl mx-auto bg-white shadow-lg">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-50 p-1 h-12">
            <TabsTrigger 
              value="profile" 
              className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger 
              value="trips" 
              className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
            >
              My Trips
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="p-6">
            <ProfileTab />
          </TabsContent>

          <TabsContent value="trips" className="p-6">
            <MyTripsTab />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};
