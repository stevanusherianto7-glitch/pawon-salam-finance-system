
import { create } from 'zustand';
import { AttendanceLog, AttendanceStatus, WorkSchedule } from '../types';
import { attendanceApi } from '../services/api';

interface AttendanceState {
  todayLog: AttendanceLog | null;
  schedule: WorkSchedule | null;
  history: AttendanceLog[];
  isLoading: boolean;
  fetchTodayStatus: (employeeId: string) => Promise<void>;
  fetchSchedule: (employeeId: string) => Promise<void>;
  performCheckIn: (employeeId: string, lat: number, long: number, photo?: string) => Promise<void>;
  performCheckOut: (logId: string) => Promise<void>;
  fetchHistory: (employeeId: string) => Promise<void>;
  updateAttendanceLog: (logId: string, updates: Partial<AttendanceLog>) => Promise<boolean>;
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  todayLog: null,
  schedule: null,
  history: [],
  isLoading: false,

  fetchTodayStatus: async (employeeId: string) => {
    set({ isLoading: true });
    try {
      const res = await attendanceApi.getTodayLog(employeeId);
      if (res.success) {
        set({ todayLog: res.data! });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSchedule: async (employeeId: string) => {
    // No loading state for schedule to avoid flickering everything
    try {
      const res = await attendanceApi.getTodaySchedule(employeeId);
      if (res.success && res.data) {
        set({ schedule: res.data });
      }
    } catch (e) {
      console.error("Failed to fetch schedule", e);
    }
  },

  performCheckIn: async (employeeId, lat, long, photo) => {
    set({ isLoading: true });
    try {
      // Logic to determine Late vs Present
      const now = new Date();
      const isLate = now.getHours() > 9; // Late after 9:00 AM

      const res = await attendanceApi.checkIn({
        employeeId,
        latitude: lat,
        longitude: long,
        photoInUrl: photo,
        status: isLate ? AttendanceStatus.LATE : AttendanceStatus.PRESENT
      });

      if (res.success && res.data) {
        set({ todayLog: res.data });
        // Refresh history
        get().fetchHistory(employeeId);
      }
    } finally {
      set({ isLoading: false });
    }
  },

  performCheckOut: async (logId) => {
    set({ isLoading: true });
    try {
      const res = await attendanceApi.checkOut(logId);
      if (res.success && res.data) {
        set({ todayLog: res.data });
        // Refresh history
         if (get().todayLog?.employeeId) {
             get().fetchHistory(get().todayLog!.employeeId);
         }
      }
    } finally {
      set({ isLoading: false });
    }
  },

  fetchHistory: async (employeeId) => {
    set({ isLoading: true });
    try {
      const res = await attendanceApi.getHistory(employeeId);
      if (res.success && res.data) {
        set({ history: res.data });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  updateAttendanceLog: async (logId, updates) => {
    set({ isLoading: true });
    try {
      const res = await attendanceApi.updateLog(logId, updates);
      if (res.success && res.data) {
        // Update local history state to reflect changes immediately
        set((state) => ({
            history: state.history.map(log => log.id === logId ? res.data! : log)
        }));
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    } finally {
      set({ isLoading: false });
    }
  }
}));