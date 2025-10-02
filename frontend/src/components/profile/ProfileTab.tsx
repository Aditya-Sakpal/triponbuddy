import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserStats } from "@/hooks/api-hooks";
import { UserProfile } from "@clerk/clerk-react";
import { useState } from "react";
import { Edit, Mail, Calendar, MapPin, User } from "lucide-react";

export const ProfileTab = () => {
  const { user } = useUser();
  const [showUserProfile, setShowUserProfile] = useState(false);
  
  const { data: userStatsData, isLoading: statsLoading } = useUserStats(
    user?.id || ""
  );

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Info Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">Personal Information</CardTitle>
          {showUserProfile ? (
            <div className="fixed inset-0 z-[99] bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-4xl max-h-[85vh] overflow-hidden relative mt-16">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUserProfile(false)}
                  className="absolute top-4 right-4 z-10"
                >
                  ✕
                </Button>
                <UserProfile />
              </div>
            </div>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => setShowUserProfile(true)}
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <img
                src={user.imageUrl}
                alt={user.fullName || "Profile"}
                className="w-24 h-24 rounded-full border-4 border-blue-100"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <User className="h-5 w-5 text-bula" />
              <div>
                <p className="text-sm font-medium text-gray-600">Full Name</p>
                <p className="text-base font-semibold">{user.fullName || "Not provided"}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="h-5 w-5 text-bula" />
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-base font-semibold">{user.primaryEmailAddress?.emailAddress || "Not provided"}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-bula" />
              <div>
                <p className="text-sm font-medium text-gray-600">Member Since</p>
                <p className="text-base font-semibold">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Not available"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <MapPin className="h-5 w-5 text-bula" />
              <div>
                <p className="text-sm font-medium text-gray-600">Username</p>
                <p className="text-base font-semibold">{user.username || "Not set"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Travel Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bula"></div>
            </div>
          ) : userStatsData?.stats ? (
            <div className="flex items-center justify-center gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-bula">{userStatsData.stats.total_trips}</p>
                <p className="text-sm font-medium text-gray-600">Total Trips</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">{userStatsData.stats.saved_trips}</p>
                <p className="text-sm font-medium text-gray-600">Saved Trips</p>
              </div>
                          
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No travel statistics available yet.</p>
              <p className="text-sm text-gray-400 mt-2">Start planning trips to see your stats here!</p>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
};
