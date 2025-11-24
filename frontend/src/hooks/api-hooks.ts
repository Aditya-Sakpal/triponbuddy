import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TripsApiService, UsersApiService, FeedbackApiService } from '../lib/api-services';
import { useTripsStore, useUserStore, useUiStore } from '../lib/stores';
import { queryKeys } from '../constants';
import type {
  TripGenerationRequest,
  TripListParams,
  TripUpdateRequest,
  FeedbackCreate,
  ApiError,
  UserProfileUpdate,
} from '../constants';

// Trips Hooks
export const useGenerateTrip = () => {
  const queryClient = useQueryClient();
  const { addTrip, setLoading, setError } = useTripsStore();
  const { addNotification } = useUiStore();

  return useMutation({
    mutationFn: ({ request, signal }: { request: TripGenerationRequest; signal?: AbortSignal }) => {
      return TripsApiService.generateTrip(request, signal);
    },
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (data) => {
      // The backend creates a trip record, so we should invalidate trips queries
      queryClient.invalidateQueries({ queryKey: queryKeys.trips });
      addNotification({
        type: 'success',
        message: 'Trip generated successfully!',
      });
    },
    onError: (error: Error) => {
      console.log('❌ Mutation error:', error);
      // Don't show error notification for aborted requests
      if (error.name === 'CanceledError' || error.message.includes('cancel')) {
        console.log('Request was cancelled');
        return;
      }
      const message = error?.message || 'Failed to generate trip';
      setError(message);
      addNotification({
        type: 'error',
        message,
      });
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

export const useTrips = (params: TripListParams) => {
  const { setTrips, setLoading, setError } = useTripsStore();

  return useQuery({
    queryKey: [...queryKeys.trips, params],
    queryFn: () => TripsApiService.getUserTrips(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTrip = (tripId: string, userId: string) => {
  const { setCurrentTrip, setLoading, setError } = useTripsStore();

  return useQuery({
    queryKey: queryKeys.trip(tripId),
    queryFn: () => TripsApiService.getTrip(tripId, userId),
    enabled: !!tripId && !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUpdateTrip = () => {
  const queryClient = useQueryClient();
  const { updateTrip } = useTripsStore();
  const { addNotification } = useUiStore();

  return useMutation({
    mutationFn: ({ tripId, updates, userId }: {
      tripId: string;
      updates: TripUpdateRequest;
      userId: string;
    }) => TripsApiService.updateTrip(tripId, updates, userId),
    onSuccess: (data, variables) => {
      // Update local state
      updateTrip(variables.tripId, variables.updates);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.trip(variables.tripId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.trips });

      addNotification({
        type: 'success',
        message: data.message || 'Trip updated successfully',
      });
    },
    onError: (error: ApiError) => {
      const message = error?.message || 'Failed to update trip';
      addNotification({
        type: 'error',
        message,
      });
    },
  });
};

export const useDeleteTrip = () => {
  const queryClient = useQueryClient();
  const { removeTrip } = useTripsStore();
  const { addNotification } = useUiStore();

  return useMutation({
    mutationFn: ({ tripId, userId }: { tripId: string; userId: string }) =>
      TripsApiService.deleteTrip(tripId, userId),
    onSuccess: (data, variables) => {
      // Update local state
      removeTrip(variables.tripId);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.trip(variables.tripId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.trips });

      addNotification({
        type: 'success',
        message: data.message || 'Trip deleted successfully',
      });
    },
    onError: (error: ApiError) => {
      const message = error?.message || 'Failed to delete trip';
      addNotification({
        type: 'error',
        message,
      });
    },
  });
};

export const useSaveTrip = () => {
  const queryClient = useQueryClient();
  const { updateTrip } = useTripsStore();
  const { addNotification } = useUiStore();

  return useMutation({
    mutationFn: ({ tripId, userId }: { tripId: string; userId: string }) =>
      TripsApiService.saveTrip(tripId, userId),
    onSuccess: (data, variables) => {
      // Update local state
      updateTrip(variables.tripId, { is_saved: true });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.trip(variables.tripId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.trips });

      addNotification({
        type: 'success',
        message: data.message || 'Trip saved successfully',
      });
    },
    onError: (error: ApiError) => {
      const message = error?.message || 'Failed to save trip';
      addNotification({
        type: 'error',
        message,
      });
    },
  });
};

export const useUnsaveTrip = () => {
  const queryClient = useQueryClient();
  const { updateTrip } = useTripsStore();
  const { addNotification } = useUiStore();

  return useMutation({
    mutationFn: ({ tripId, userId }: { tripId: string; userId: string }) =>
      TripsApiService.unsaveTrip(tripId, userId),
    onSuccess: (data, variables) => {
      // Update local state
      updateTrip(variables.tripId, { is_saved: false });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.trip(variables.tripId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.trips });

      addNotification({
        type: 'success',
        message: data.message || 'Trip removed from saved',
      });
    },
    onError: (error: ApiError) => {
      const message = error?.message || 'Failed to unsave trip';
      addNotification({
        type: 'error',
        message,
      });
    },
  });
};

// User Hooks
export const useUserStats = (userId: string) => {
  const { setStats, setLoading, setError } = useUserStore();

  return useQuery({
    queryKey: queryKeys.userStats,
    queryFn: () => UsersApiService.getUserStats(userId),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUserProfile = (userId: string) => {
  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => UsersApiService.getUserProfile(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useUiStore();

  return useMutation({
    mutationFn: ({ userId, profileData }: { userId: string; profileData: UserProfileUpdate }) =>
      UsersApiService.updateUserProfile(userId, profileData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', variables.userId] });
      addNotification({
        type: 'success',
        message: data.message || 'Profile updated successfully',
      });
    },
    onError: (error: ApiError) => {
      const message = error?.message || 'Failed to update profile';
      addNotification({
        type: 'error',
        message,
      });
    },
  });
};

// Feedback Hooks
export const useSubmitFeedback = () => {
  const { addNotification } = useUiStore();

  return useMutation({
    mutationFn: ({ feedback, userId }: { feedback: FeedbackCreate; userId: string }) =>
      FeedbackApiService.submitFeedback(feedback, userId),
    onSuccess: (data) => {
      if (data.success) {
        addNotification({
          type: 'success',
          message: data.message || 'Feedback submitted successfully',
        });
      }
    },
    onError: (error: ApiError) => {
      const message = error?.message || 'Failed to submit feedback';
      addNotification({
        type: 'error',
        message,
      });
    },
  });
};
