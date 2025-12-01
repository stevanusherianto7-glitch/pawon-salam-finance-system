
import { create } from 'zustand';
import { LeaveRequest, LeaveType } from '../types';
import { leaveApi } from '../services/api';

interface LeaveState {
  requests: LeaveRequest[];
  isLoading: boolean;
  fetchRequests: (employeeId: string) => Promise<void>;
  submitRequest: (data: Omit<LeaveRequest, 'id' | 'status'>) => Promise<boolean>;
}

export const useLeaveStore = create<LeaveState>((set, get) => ({
  requests: [],
  isLoading: false,

  fetchRequests: async (employeeId) => {
    set({ isLoading: true });
    try {
      const res = await leaveApi.getHistory(employeeId);
      if (res.success && res.data) {
        set({ requests: res.data });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  submitRequest: async (data) => {
    set({ isLoading: true });
    try {
      const res = await leaveApi.submitRequest(data);
      if (res.success && res.data) {
        set((state) => ({
          requests: [res.data!, ...state.requests]
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