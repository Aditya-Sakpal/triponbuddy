import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ProfileTab } from "./ProfileTab";
import { MyTripsTab } from "./MyTripsTab";
import { useSearchParams } from "react-router-dom";

export const ProfileCard = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'trips' ? 'trips' : 'profile';

  return (
    <div className="container mx-auto px-6 -mt-16 relative z-10 mb-16 ">
      <Card className="max-w-6xl mx-auto bg-gray-100 shadow-lg">
        <Tabs defaultValue={activeTab} className="w-full">
          <TabsList className="inline-flex h-auto items-center justify-start gap-8 rounded-none bg-transparent border-b border-gray-200 w-full p-4">
            <TabsTrigger 
              value="profile" 
              className="rounded-none border-b-2 px-0 pb-3 pt-0 font-medium text-gray-600 shadow-none transition-none data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none hover:text-blue-600 text-lg"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger 
              value="trips" 
              className="rounded-none border-b-2 px-0 pb-3 pt-0 font-medium text-gray-600 shadow-none transition-none data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none hover:text-blue-600 text-lg"
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
