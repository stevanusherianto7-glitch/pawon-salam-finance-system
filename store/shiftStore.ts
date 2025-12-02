
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ShiftAssignment, ShiftType } from '../types';
import { shiftApi } from '../services/api';
import { useNotificationStore } from './notificationStore';

interface ShiftState {
  shifts: ShiftAssignment[];
  isLoading: boolean;
  fetchMonthlyShifts: (month: number, year: number) => Promise<void>;
  generateDefaults: (month: number, year: number) => Promise<void>;
  updateShift: (id: string, type: ShiftType) => Promise<boolean>;
  publishShifts: (month: number, year: number) => Promise<boolean>;
}

export const useShiftStore = create<ShiftState>()(
  persist(
    (set, get) => ({
      shifts: [],
      isLoading: false,

      fetchMonthlyShifts: async (month, year) => {
        set({ isLoading: true });
        try {
          const res = await shiftApi.getMonthlyShifts(month, year);
          if (res.success && res.data) {
            set({ shifts: res.data });
          }
        } finally {
          set({ isLoading: false });
        }
      },

      generateDefaults: async (month, year) => {
        set({ isLoading: true });
        try {
          const res = await shiftApi.generateDefaults(month, year);
          if (res.success && res.data) {
            set({ shifts: res.data });
            useNotificationStore.getState().showNotification('Draft jadwal berhasil dibuat', 'success');
          }
        } finally {
          set({ isLoading: false });
        }
      },

      updateShift: async (id, type) => {
        try {
          const res = await shiftApi.updateAssignment(id, type);
          if (res.success && res.data) {
            set(state => ({
              shifts: state.shifts.map(s => s.id === id ? res.data! : s)
            }));
            useNotificationStore.getState().showNotification('Shift berhasil diupdate', 'success');
            return true;
          }
          useNotificationStore.getState().showNotification('Gagal mengupdate shift', 'error');
          return false;
        } catch (e) {
          useNotificationStore.getState().showNotification('Terjadi kesalahan', 'error');
          return false;
        }
      },

      publishShifts: async (month, year) => {
        set({ isLoading: true });
        try {
          const res = await shiftApi.publishShifts(month, year);
          if (res.success) {
            set(state => ({
              shifts: state.shifts.map(s => ({ ...s, isPublished: true }))
            }));
            useNotificationStore.getState().showNotification('Jadwal berhasil dipublikasikan ke karyawan!', 'success');
            return true;
          }
          useNotificationStore.getState().showNotification('Gagal mempublikasikan jadwal', 'error');
          return false;
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'shift-storage',
      partialize: (state) => ({
        shifts: state.shifts
      })
    }
  )
);