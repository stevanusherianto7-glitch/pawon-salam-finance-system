import { create } from 'zustand';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface AppNotification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

export interface SpecialNotification {
  message: string;
  type: 'birthday' | 'announcement';
  data?: any; // To store context like employee IDs
}

interface NotificationState {
  notifications: AppNotification[];
  specialNotification: SpecialNotification | null;
  isSpecialNotificationVisible: boolean;
  showNotification: (message: string, type: NotificationType, duration?: number) => void;
  removeNotification: (id: string) => void;
  showSpecialNotification: (message: string, type: SpecialNotification['type'], data?: any) => void;
  hideSpecialNotification: () => void;
  checkBirthdayDismissal: (employeeIds: string[]) => boolean; // Returns true if dismissed
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  specialNotification: null,
  isSpecialNotificationVisible: false,

  showNotification: (message, type, duration = 3000) => {
    const id = Date.now().toString();
    set((state) => ({
      notifications: [...state.notifications, { id, message, type, duration }],
    }));

    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    }, duration);
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  showSpecialNotification: (message, type, data) => {
    set({
      specialNotification: { message, type, data },
      isSpecialNotificationVisible: true,
    });
  },

  hideSpecialNotification: () => {
    const { specialNotification } = get();

    // SMART DISMISSAL LOGIC
    if (specialNotification?.type === 'birthday' && specialNotification.data?.employeeIds) {
      const ids = specialNotification.data.employeeIds as string[];
      const dateStr = new Date().toISOString().split('T')[0];
      const uniqueKey = `birthday_dismissed_${dateStr}_${ids.sort().join(',')}`;
      localStorage.setItem(uniqueKey, 'true');
    }

    set({
      isSpecialNotificationVisible: false,
      specialNotification: null
    });
  },

  checkBirthdayDismissal: (employeeIds: string[]) => {
    const dateStr = new Date().toISOString().split('T')[0];
    const uniqueKey = `birthday_dismissed_${dateStr}_${employeeIds.sort().join(',')}`;
    return localStorage.getItem(uniqueKey) === 'true';
  }
}));
