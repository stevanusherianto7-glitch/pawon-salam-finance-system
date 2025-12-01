
import { create } from 'zustand';
import { DailyPerformanceSnapshot, PerformanceReview, JobdeskSubmission } from '../types';
import { performanceApi, jobdeskApi } from '../services/api';

interface PerformanceState {
  currentSnapshot: DailyPerformanceSnapshot | null;
  snapshotHistory: DailyPerformanceSnapshot[]; 
  dailySubmissions: DailyPerformanceSnapshot[]; // For HR/Owner daily monitor
  reviews: PerformanceReview[];
  currentJobdesk: JobdeskSubmission | null;
  isLoading: boolean;
  
  // Performance Actions
  fetchDailySnapshot: (employeeId: string) => Promise<void>;
  fetchSnapshotHistory: (employeeId: string) => Promise<void>; 
  fetchAllSnapshotsByDate: (date: string) => Promise<void>; // New action for HR/Owner
  fetchReviews: (employeeId: string) => Promise<void>;
  saveReview: (review: PerformanceReview) => Promise<boolean>;
  updateDailySnapshot: (employeeId: string, date: string, updates: Partial<DailyPerformanceSnapshot>) => Promise<boolean>;
  
  // Jobdesk Actions
  fetchJobdesk: (employeeId: string) => Promise<void>;
  saveJobdesk: (submission: JobdeskSubmission) => Promise<boolean>;
}

export const usePerformanceStore = create<PerformanceState>((set) => ({
  currentSnapshot: null,
  snapshotHistory: [],
  dailySubmissions: [],
  reviews: [],
  currentJobdesk: null,
  isLoading: false,

  fetchDailySnapshot: async (employeeId) => {
    set({ isLoading: true });
    const today = new Date().toISOString().split('T')[0];
    const res = await performanceApi.getDailySnapshot(employeeId, today);
    if (res.success) {
        set({ currentSnapshot: res.data });
    }
    set({ isLoading: false });
  },
  
  fetchSnapshotHistory: async (employeeId) => {
    set({ isLoading: true });
    const res = await performanceApi.getSnapshotHistory(employeeId);
    if (res.success && res.data) {
        set({ snapshotHistory: res.data });
    }
    set({ isLoading: false });
  },

  fetchAllSnapshotsByDate: async (date: string) => {
    set({ isLoading: true });
    try {
        const res = await performanceApi.getAllSnapshotsByDate(date);
        if (res.success && res.data) {
            set({ dailySubmissions: res.data });
        }
    } finally {
        set({ isLoading: false });
    }
  },

  fetchReviews: async (employeeId) => {
    set({ isLoading: true });
    const res = await performanceApi.getReviews(employeeId);
    if (res.success && res.data) {
        set({ reviews: res.data });
    }
    set({ isLoading: false });
  },

  saveReview: async (review) => {
    set({ isLoading: true });
    try {
        const res = await performanceApi.saveReview(review);
        if (res.success && res.data) {
            set(state => ({
                reviews: [...state.reviews.filter(r => r.id !== review.id), res.data!]
            }));
            return true;
        }
        return false;
    } finally {
        set({ isLoading: false });
    }
  },
  
  updateDailySnapshot: async (employeeId, date, updates) => {
      set({ isLoading: true });
      try {
          const res = await performanceApi.updateDailySnapshot(employeeId, date, updates);
          if (res.success && res.data) {
              set(state => {
                  const newCurrent = (state.currentSnapshot && state.currentSnapshot.date === date) 
                                     ? res.data! : state.currentSnapshot;
                  const newHistory = [...state.snapshotHistory.filter(s => s.date !== date), res.data!];
                  return { currentSnapshot: newCurrent, snapshotHistory: newHistory };
              });
              return true;
          }
          return false;
      } finally {
          set({ isLoading: false });
      }
  },

  fetchJobdesk: async (employeeId) => {
      set({ isLoading: true });
      const today = new Date().toISOString().split('T')[0];
      try {
          const res = await jobdeskApi.getSubmission(employeeId, today);
          if (res.success) {
              set({ currentJobdesk: res.data });
          } else {
              set({ currentJobdesk: null });
          }
      } finally {
          set({ isLoading: false });
      }
  },

  saveJobdesk: async (submission) => {
      set({ isLoading: true });
      try {
          const res = await jobdeskApi.saveSubmission(submission);
          if (res.success && res.data) {
              set({ currentJobdesk: res.data });
              return true;
          }
          return false;
      } finally {
          set({ isLoading: false });
      }
  }
}));