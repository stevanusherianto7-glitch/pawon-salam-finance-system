
import { create } from 'zustand';
import { Employee, ApiResponse } from '../types';
import { authApi, adminApi } from '../services/api';

interface AuthState {
  user: Employee | null;          // The "Effective" User (Active Context)
  originalUser: Employee | null;  // The "Real" User (Super Admin), null if not impersonating
  isAuthenticated: boolean;
  isLoading: boolean;
  isImpersonating: boolean;

  // REAL LOGIN FLOW (Phone ONLY)
  login: (phone: string) => Promise<{ success: boolean, message?: string }>;

  // Super Admin Secure Login Flow
  loginSuperAdmin: (email: string, pass: string) => Promise<{ success: boolean, message?: string }>;

  // Super Admin Impersonation Tool
  impersonateByPhone: (targetPhone: string) => Promise<{ success: boolean, message?: string }>;

  // Common
  logout: () => void;
  updateUser: (data: Partial<Employee>) => void;
  stopImpersonation: () => void;
  startImpersonation: (targetUser: Employee) => void;
}

export const useAuthStore = create<AuthState>()(
  (set, get) => ({
    user: null,
    originalUser: null,
    isAuthenticated: false,
    isLoading: false,
    isImpersonating: false,

    login: async (phone) => {
      set({ isLoading: true });
      try {
        const response = await authApi.login({ phone });
        if (response.success && response.data) {
          set({ user: response.data, isAuthenticated: true, isLoading: false, originalUser: null, isImpersonating: false });
          return { success: true };
        }
        set({ isLoading: false });
        return { success: false, message: response.message };
      } catch (error) {
        set({ isLoading: false });
        return { success: false, message: "Login Error" };
      }
    },

    loginSuperAdmin: async (email, pass) => {
      set({ isLoading: true });
      try {
        const res: ApiResponse<Employee> = await authApi.loginSuperAdmin(email, pass);
        if (res.success && res.data) {
          set({ user: res.data, isAuthenticated: true, isLoading: false, originalUser: null, isImpersonating: false });
          return { success: true };
        }
        set({ isLoading: false });
        return { success: false, message: res.message };
      } catch (e) {
        set({ isLoading: false });
        return { success: false, message: "Super Admin Login Error" };
      }
    },

    impersonateByPhone: async (targetPhone) => {
      const currentUser = get().user;
      // Only Super Admin can trigger this
      if (!currentUser) return { success: false, message: "Session expired" };

      set({ isLoading: true });
      try {
        // Call special admin endpoint
        const res = await adminApi.impersonateByPhone(targetPhone, currentUser.id);

        if (res.success && res.data) {
          set({
            originalUser: currentUser, // Store Super Admin
            user: res.data,            // Switch to Target
            isImpersonating: true,
            isLoading: false
          });
          return { success: true };
        }
        set({ isLoading: false });
        return { success: false, message: res.message };
      } catch (e) {
        set({ isLoading: false });
        return { success: false, message: "Impersonation failed" };
      }
    },

    logout: () => set({ user: null, originalUser: null, isAuthenticated: false, isImpersonating: false }),

    updateUser: (data) => set((state) => ({
      user: state.user ? { ...state.user, ...data } : null
    })),

    stopImpersonation: () => {
      const realUser = get().originalUser;
      if (realUser) {
        set({
          user: realUser,        // Restore admin
          originalUser: null,
          isImpersonating: false
        });
      }
    },

    startImpersonation: (targetUser) => {
      const currentUser = get().user;
      if (currentUser) {
        set({
          originalUser: currentUser,
          user: targetUser,
          isImpersonating: true
        });
      }
    }
  })
);

