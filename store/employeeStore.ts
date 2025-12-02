
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Employee } from '../types';
import { employeeApi } from '../services/api';

interface EmployeeState {
  employees: Employee[];
  isLoading: boolean;
  fetchEmployees: () => Promise<void>;
  addEmployee: (data: Omit<Employee, 'id' | 'avatarUrl'>) => Promise<boolean>;
  updateEmployee: (id: string, data: Partial<Employee>) => Promise<boolean>;
}

export const useEmployeeStore = create<EmployeeState>()(
  persist(
    (set, get) => ({
      employees: [],
      isLoading: false,

      fetchEmployees: async () => {
        set({ isLoading: true });
        try {
          const res = await employeeApi.getAll();
          if (res.success && res.data) {
            set({ employees: res.data });
          }
        } finally {
          set({ isLoading: false });
        }
      },

      addEmployee: async (data) => {
        set({ isLoading: true });
        try {
          const res = await employeeApi.addEmployee(data);
          if (res.success && res.data) {
            set((state) => ({
              employees: [...state.employees, res.data!]
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
      },

      updateEmployee: async (id, data) => {
        set({ isLoading: true });
        try {
          const res = await employeeApi.updateEmployee(id, data);
          if (res.success && res.data) {
            set((state) => ({
              employees: state.employees.map(e => e.id === id ? res.data! : e)
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
    }),
    {
      name: 'employee-storage',
      partialize: (state) => ({
        employees: state.employees
      })
    }
  )
);