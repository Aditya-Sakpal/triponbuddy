import { useUser, SignOutButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserStats, useUserProfile, useUpdateUserProfile } from "@/hooks/api-hooks";
import { UserProfile } from "@clerk/clerk-react";
import { useState } from "react";
import { Edit, Mail, Calendar, MapPin, User, AlertCircle, Save, LogOut } from "lucide-react";

export const ProfileTab = () => {
  const { user } = useUser();
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  
  const { data: userStatsData, isLoading: statsLoading } = useUserStats(
    user?.id || ""
  );
  
  const { data: userProfileData, isLoading: profileLoading } = useUserProfile(
    user?.id || ""
  );
  
  const updateProfileMutation = useUpdateUserProfile();

  const isProfileComplete = userProfileData?.profile?.age && userProfileData?.profile?.gender;

  const handleEditProfile = () => {
    setAge(userProfileData?.profile?.age?.toString() || "");
    setGender(userProfileData?.profile?.gender || "");
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    if (!user || !age || !gender) return;
    
    const ageNum = parseInt(age);
    if (ageNum < 18 || ageNum > 120) {
      return;
    }

    await updateProfileMutation.mutateAsync({
      userId: user.id,
      profileData: {
        age: ageNum,
        gender: gender
      }
    });

    setIsEditingProfile(false);
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setAge("");
    setGender("");
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Required Panel - Profile Incomplete */}
      {!profileLoading && !isProfileComplete && (
        <Card className="border-red-500 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-red-900">Action Required: Complete Your Profile</h3>
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-600 text-white">
                    Incomplete
                  </span>
                </div>
                <p className="text-sm text-red-800 mb-3">
                  Please set your age and gender to request joining trips. This information helps trip owners match with compatible travel companions.
                </p>
                <Button 
                  onClick={handleEditProfile}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700"
                >
                  Complete Profile Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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

          {/* Age and Gender Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Travel Profile</h3>
              {!isEditingProfile && isProfileComplete && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={handleEditProfile}
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              )}
            </div>

            {isEditingProfile ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-age">
                    Age <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="profile-age"
                    type="number"
                    min="18"
                    max="120"
                    placeholder="Enter your age (must be 18+)"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    disabled={updateProfileMutation.isPending}
                  />
                  <p className="text-xs text-muted-foreground">
                    You must be at least 18 years old
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-gender">
                    Gender <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={gender}
                    onValueChange={setGender}
                    disabled={updateProfileMutation.isPending}
                  >
                    <SelectTrigger id="profile-gender">
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={!age || !gender || updateProfileMutation.isPending}
                    size="sm"
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={updateProfileMutation.isPending}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-bula" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Age</p>
                    <p className="text-base font-semibold">
                      {profileLoading ? (
                        <span className="text-sm text-gray-400">Loading...</span>
                      ) : userProfileData?.profile?.age ? (
                        `${userProfileData.profile.age} years`
                      ) : (
                        <span className="text-sm text-red-600">Not set</span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="h-5 w-5 text-bula" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Gender</p>
                    <p className="text-base font-semibold">
                      {profileLoading ? (
                        <span className="text-sm text-gray-400">Loading...</span>
                      ) : userProfileData?.profile?.gender ? (
                        userProfileData.profile.gender.charAt(0).toUpperCase() + 
                        userProfileData.profile.gender.slice(1)
                      ) : (
                        <span className="text-sm text-red-600">Not set</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
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

      {/* Logout Section - Visible on mobile */}
      <Card className="md:hidden">
        <CardContent className="pt-6">
          <SignOutButton>
            <Button variant="destructive" className="w-full gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </SignOutButton>
        </CardContent>
      </Card>
    </div>
  );
};
