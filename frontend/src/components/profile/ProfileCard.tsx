import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ProfileTab } from "./ProfileTab";
import { MyTripsTab } from "./MyTripsTab";
import { useSearchParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useUserProfile } from "@/hooks/api-hooks";

export const ProfileCard = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'trips' ? 'trips' : 'profile';
  const { user } = useUser();
  
  const { data: userProfileData, isLoading: profileLoading } = useUserProfile(
    user?.id || ""
  );

  const isProfileComplete = userProfileData?.profile?.age && userProfileData?.profile?.gender;

  return (
    <div className="container mx-auto px-6 -mt-16 relative z-10 pb-16">
      <Card className="max-w-4xl mx-auto bg-gray-100 shadow-lg">
        <Tabs defaultValue={activeTab} className="w-full">
          <TabsList className="inline-flex h-auto items-center justify-start gap-8 rounded-none bg-transparent border-b border-gray-200 w-full p-4">
            <TabsTrigger 
              value="profile" 
              className="rounded-none border-b-2 px-0 pb-3 pt-0 font-medium text-gray-600 shadow-none transition-none data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none hover:text-blue-600 text-lg relative"
            >
              Profile
              {!profileLoading && !isProfileComplete && (
                <span className="absolute -top-1 -right-3 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
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
