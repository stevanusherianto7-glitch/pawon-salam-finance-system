
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Payslip, UserRole } from '../types';
import { payrollApi } from '../services/api';

interface PayrollState {
  payslips: Payslip[];
  currentPayslip: Payslip | null;
  isLoading: boolean;
  fetchPayslips: (role: UserRole, userId: string) => Promise<void>;
  fetchPayslipDetail: (id: string) => Promise<void>;
  savePayslip: (payslip: Payslip) => Promise<boolean>;
  sendPayslip: (id: string) => Promise<boolean>;
}

export const usePayrollStore = create<PayrollState>()(
  persist(
    (set) => ({
      payslips: [],
      currentPayslip: null,
      isLoading: false,

      fetchPayslips: async (role, userId) => {
        set({ isLoading: true });
        try {
          const res = await payrollApi.getPayslips(role, userId);
          if (res.success && res.data) {
            // Sort by date desc
            const sorted = res.data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            set({ payslips: sorted });
          }
        } finally {
          set({ isLoading: false });
        }
      },

      fetchPayslipDetail: async (id) => {
        set({ isLoading: true });
        try {
          const res = await payrollApi.getPayslipDetail(id);
          if (res.success) set({ currentPayslip: res.data! });
        } finally {
          set({ isLoading: false });
        }
      },

      savePayslip: async (payslip) => {
        set({ isLoading: true });
        try {
          const res = await payrollApi.savePayslip(payslip);
          if (res.success && res.data) {
            set(state => {
              const exists = state.payslips.find(p => p.id === payslip.id);
              return {
                payslips: exists
                  ? state.payslips.map(p => p.id === payslip.id ? res.data! : p)
                  : [res.data!, ...state.payslips]
              };
            });
            return true;
          }
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      sendPayslip: async (id) => {
        set({ isLoading: true });
        try {
          const res = await payrollApi.sendPayslip(id);
          if (res.success && res.data) {
            set(state => ({
              payslips: state.payslips.map(p => p.id === id ? res.data! : p)
            }));
            return true;
          }
          return false;
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'payroll-storage',
      partialize: (state) => ({
        payslips: state.payslips,
        currentPayslip: state.currentPayslip
      })
    }
  )
);