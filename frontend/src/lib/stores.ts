import { create } from 'zustand';
import type { TripDB, UserStats } from '../constants';

// Auth Store
interface AuthState {
  userId: string | null;
  isAuthenticated: boolean;
  setUser: (userId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  (set) => ({
    userId: null,
    isAuthenticated: false,
    setUser: (userId: string) => set({ userId, isAuthenticated: true }),
    logout: () => set({ userId: null, isAuthenticated: false }),
  })
);

// Trips Store
interface TripsState {
  trips: TripDB[];
  currentTrip: TripDB | null;
  isLoading: boolean;
  error: string | null;
  totalTrips: number;
  currentPage: number;
  hasNextPage: boolean;

  // Actions
  setTrips: (trips: TripDB[], total: number, page: number, hasNext: boolean) => void;
  addTrip: (trip: TripDB) => void;
  updateTrip: (tripId: string, updates: Partial<TripDB>) => void;
  removeTrip: (tripId: string) => void;
  setCurrentTrip: (trip: TripDB | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearTrips: () => void;
}

export const useTripsStore = create<TripsState>()(
  (set, get) => ({
    trips: [],
    currentTrip: null,
    isLoading: false,
    error: null,
    totalTrips: 0,
    currentPage: 1,
    hasNextPage: false,

    setTrips: (trips, total, page, hasNext) =>
      set({ trips, totalTrips: total, currentPage: page, hasNextPage: hasNext }),

    addTrip: (trip) =>
      set((state) => ({ trips: [trip, ...state.trips] })),

    updateTrip: (tripId, updates) =>
      set((state) => ({
        trips: state.trips.map((trip) =>
          trip.trip_id === tripId ? { ...trip, ...updates } : trip
        ),
        currentTrip: state.currentTrip?.trip_id === tripId
          ? { ...state.currentTrip, ...updates }
          : state.currentTrip,
      })),

    removeTrip: (tripId) =>
      set((state) => ({
        trips: state.trips.filter((trip) => trip.trip_id !== tripId),
        currentTrip: state.currentTrip?.trip_id === tripId ? null : state.currentTrip,
      })),

    setCurrentTrip: (trip) => set({ currentTrip: trip }),

    setLoading: (loading) => set({ isLoading: loading }),

    setError: (error) => set({ error, isLoading: false }),

    clearTrips: () => set({
      trips: [],
      currentTrip: null,
      totalTrips: 0,
      currentPage: 1,
      hasNextPage: false,
      error: null
    }),
  })
);

// User Store
interface UserState {
  stats: UserStats | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setStats: (stats: UserStats) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  (set, get) => ({
    profile: null,
    stats: null,
    isLoading: false,
    error: null,

    setStats: (stats) => set({ stats }),

    setLoading: (loading) => set({ isLoading: loading }),

    setError: (error) => set({ error, isLoading: false }),

    clearUser: () => set({
      stats: null,
      error: null
    }),
  })
);

// UI Store for global UI state
interface UiState {
  isSidebarOpen: boolean;
  isLoading: boolean;
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    duration?: number;
  }>;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  addNotification: (notification: Omit<UiState['notifications'][0], 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useUiStore = create<UiState>()(
  (set, get) => ({
    isSidebarOpen: false,
    isLoading: false,
    notifications: [],

    toggleSidebar: () =>
      set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

    setSidebarOpen: (open) => set({ isSidebarOpen: open }),

    setLoading: (loading) => set({ isLoading: loading }),

    addNotification: (notification) =>
      set((state) => ({
        notifications: [
          ...state.notifications,
          {
            ...notification,
            id: Date.now().toString(),
            duration: notification.duration || 5000,
          },
        ],
      })),

    removeNotification: (id) =>
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      })),

    clearNotifications: () => set({ notifications: [] }),
  })
);
