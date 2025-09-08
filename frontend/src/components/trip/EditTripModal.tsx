/**
 * EditTripModal Component
 * 
 * A modal component that allows users to edit their existing trip details and regenerate the itinerary.
 * Features:
 * - Pre-fills form with current trip data (destination, dates, preferences, etc.)
 * - Allows modification of all trip parameters
 * - Shows change detection - only enables "Update Trip" when changes are made
 * - Integrates with trip generation API to create a new itinerary
 * - Shows loading modal during regeneration process
 * - Automatically navigates to the new trip once regeneration is complete
 * 
 * Props:
 * - isOpen: Controls modal visibility
 * - onClose: Callback to close the modal
 * - trip: Current trip data to edit
 * - onTripUpdated: Callback when trip is successfully updated with new trip ID
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { LocationAutocomplete } from "@/components/ui/location-autocomplete";
import { MapPin, Calendar, Clock, Mountain, Building, Umbrella, Music, ShoppingBag, Utensils, X } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useGenerateTrip } from "@/hooks/api-hooks";
import { TripGenerationModal } from "./TripGenerationModal";
import type { TripDB, TripPreferences, Itinerary } from "@/lib/types";

interface EditTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripDB;
  onTripUpdated: (newTripId: string) => void;
}

export const EditTripModal = ({ isOpen, onClose, trip, onTripUpdated }: EditTripModalProps) => {
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(['Relaxation']);
  const [destination, setDestination] = useState("");
  const [startLocation, setStartLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [durationDays, setDurationDays] = useState<number>(3);
  const [isInternational, setIsInternational] = useState(false);
  
  const generateTripMutation = useGenerateTrip();
  
  const preferenceOptions = useMemo(() => [
    { icon: Mountain, label: "Adventure" },
    { icon: Building, label: "Culture" },
    { icon: Umbrella, label: "Relaxation" },
    { icon: Music, label: "Classical" },
    { icon: ShoppingBag, label: "Shopping" },
    { icon: Utensils, label: "Food" },
  ], []);

  // Initialize form with trip data when modal opens
  useEffect(() => {
    if (isOpen && trip) {
      setDestination(trip.destination || "");
      setStartLocation(trip.start_location || "");
      setStartDate(trip.start_date || "");
      setDurationDays(trip.duration_days || 3);
      setIsInternational(trip.is_international || false);
      
      // Extract preferences from trip data
      const itinerary = trip.itinerary_data as unknown as Itinerary;
      const preferences: string[] = [];
      
      // Try to infer preferences from trip tags or set defaults
      if (trip.tags && trip.tags.length > 0) {
        trip.tags.forEach(tag => {
          const matchingPref = preferenceOptions.find(
            opt => opt.label.toLowerCase() === tag.toLowerCase()
          );
          if (matchingPref && preferences.length < 3) {
            preferences.push(matchingPref.label);
          }
        });
      }
      
      // If no preferences found, set default
      if (preferences.length === 0) {
        preferences.push('Relaxation');
      }
      
      setSelectedPreferences(preferences);
    }
  }, [isOpen, trip, preferenceOptions]);

  // Handle trip generation success
  useEffect(() => {
    if (generateTripMutation.isSuccess && generateTripMutation.data?.trip_id) {
      console.log('Trip updated successfully, new trip ID:', generateTripMutation.data.trip_id);
      onTripUpdated(generateTripMutation.data.trip_id);
      onClose();
      // Reset mutation state
      generateTripMutation.reset();
    }
  }, [generateTripMutation.isSuccess, generateTripMutation.data, generateTripMutation, onTripUpdated, onClose]);

  // Handle errors
  useEffect(() => {
    if (generateTripMutation.isError) {
      console.error('Trip update failed:', generateTripMutation.error);
      alert(`Failed to update trip: ${generateTripMutation.error?.message || 'Unknown error'}`);
    }
  }, [generateTripMutation.isError, generateTripMutation.error]);

  const handleToggle = (label: string) => {
    if (selectedPreferences.includes(label)) {
      setSelectedPreferences(selectedPreferences.filter(p => p !== label));
    } else if (selectedPreferences.length < 3) {
      setSelectedPreferences([...selectedPreferences, label]);
    }
  };

  const handleUpdateTrip = () => {
    console.log('Update trip clicked', { 
      trip: trip.trip_id,
      destination, 
      startDate, 
      durationDays 
    });

    if (!destination || !startDate || !durationDays) {
      console.log('Missing required fields');
      alert('Please fill in all required fields');
      return;
    }

    // Build preferences object
    const userPreferences: TripPreferences = {
      adventure: selectedPreferences.includes('Adventure'),
      culture: selectedPreferences.includes('Culture'),
      relaxation: selectedPreferences.includes('Relaxation'),
      classical: selectedPreferences.includes('Classical'),
      shopping: selectedPreferences.includes('Shopping'),
      food: selectedPreferences.includes('Food'),
    };

    console.log('Regenerating trip with:', {
      user_id: trip.user_id,
      destination,
      start_location: startLocation || undefined,
      start_date: startDate,
      duration_days: durationDays,
      preferences: userPreferences,
      is_international: isInternational,
    });

    generateTripMutation.mutate({
      user_id: trip.user_id,
      destination,
      start_location: startLocation || undefined,
      start_date: startDate,
      duration_days: durationDays,
      preferences: userPreferences,
      is_international: isInternational,
    });
  };

  const handleClose = () => {
    if (!generateTripMutation.isPending) {
      onClose();
    }
  };

  // Check if any field has changed
  const hasChanges = () => {
    const originalPrefs: string[] = [];
    if (trip.tags && trip.tags.length > 0) {
      trip.tags.forEach(tag => {
        const matchingPref = preferenceOptions.find(
          opt => opt.label.toLowerCase() === tag.toLowerCase()
        );
        if (matchingPref) {
          originalPrefs.push(matchingPref.label);
        }
      });
    }
    if (originalPrefs.length === 0) originalPrefs.push('Relaxation');

    return (
      destination !== (trip.destination || "") ||
      startLocation !== (trip.start_location || "") ||
      startDate !== (trip.start_date || "") ||
      durationDays !== (trip.duration_days || 3) ||
      isInternational !== (trip.is_international || false) ||
      JSON.stringify(selectedPreferences.sort()) !== JSON.stringify(originalPrefs.sort())
    );
  };

  return (
    <>
      <TripGenerationModal 
        isOpen={generateTripMutation.isPending} 
        onClose={() => {}} // Can't close while generating
      />
      
      <Dialog open={isOpen && !generateTripMutation.isPending} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold">
                Edit Your Trip
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <Card className="border-0 shadow-none">
            <CardContent className="p-6 space-y-6">
              {/* Location Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="edit-start-location" className="text-sm font-medium">
                    Start Location <span className="text-muted-foreground">ⓘ</span>
                  </Label>
                  <LocationAutocomplete
                    id="edit-start-location"
                    value={startLocation}
                    onChange={setStartLocation}
                    placeholder="Enter your starting point"
                    icon={<MapPin className="w-4 h-4" />}
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Destination <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="edit-worldwide" 
                        checked={isInternational}
                        onCheckedChange={setIsInternational}
                      />
                      <Label htmlFor="edit-worldwide" className="text-sm text-muted-foreground">International</Label>
                    </div>
                  </div>
                  <LocationAutocomplete
                    value={destination}
                    onChange={setDestination}
                    placeholder="Where do you want to go?"
                    icon={<MapPin className="w-4 h-4 text-primary" />}
                    required
                  />
                </div>
              </div>

              {/* Date and Duration Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="edit-start-date" className="text-sm font-medium">
                    Start Date <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input 
                      id="edit-start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Number of Days <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input 
                      type="number"
                      min="1"
                      max="30"
                      value={durationDays}
                      onChange={(e) => setDurationDays(parseInt(e.target.value) || 1)}
                      placeholder="How long is your trip?"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Travel Preferences */}
              <div>
                <Label className="text-sm font-medium mb-4 block">
                  Travel Preferences <span className="text-muted-foreground">ⓘ</span>
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  {preferenceOptions.map((pref, index) => {
                    const Icon = pref.icon;
                    const isSelected = selectedPreferences.includes(pref.label);
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleToggle(pref.label)}
                        disabled={selectedPreferences.length >= 3 && !isSelected}
                        className={`flex flex-col items-center space-y-2 p-4 rounded-lg border transition-all ${
                          isSelected 
                            ? 'bg-primary/10 border-primary text-primary' 
                            : 'bg-background border-border hover:border-primary/50'
                        } ${selectedPreferences.length >= 3 && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-sm font-medium">{pref.label}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedPreferences.length}/3 selected
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={handleClose}
                  disabled={generateTripMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateTrip}
                  disabled={
                    generateTripMutation.isPending || 
                    !destination || 
                    !startDate || 
                    !durationDays ||
                    !hasChanges()
                  }
                  className="min-w-[150px]"
                >
                  {generateTripMutation.isPending ? 'Updating...' : 'Update Trip'}
                </Button>
              </div>

              {hasChanges() && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800 text-center">
                    Changes detected. Click "Update Trip" to regenerate your itinerary with the new preferences.
                  </p>
                </div>
              )}

              {!hasChanges() && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-sm text-gray-600 text-center">
                    No changes detected. Modify any field above to enable trip update.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  );
};
