import { create } from 'zustand';
import { Message, UserRole, MessageAudience, Employee } from '../types';
import { messageApi } from '../services/api';
import { useNotificationStore } from './notificationStore';

interface MessageState {
  messages: Message[];
  unreadCount: number;
  isLoading: boolean;
  isSending: boolean;
  fetchMessages: (userId: string, userRole: UserRole) => Promise<void>;
  sendMessage: (sender: Employee, content: string, audience: MessageAudience) => Promise<boolean>;
  markMessageAsRead: (messageId: string, userId: string) => Promise<void>;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: [],
  unreadCount: 0,
  isLoading: false,
  isSending: false,

  fetchMessages: async (userId, userRole) => {
    set({ isLoading: true });
    try {
      const res = await messageApi.getMessages(userId, userRole);
      if (res.success && res.data) {
        const unread = res.data.filter(m => !m.readBy.includes(userId)).length;
        set({ messages: res.data, unreadCount: unread, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
      console.error("Failed to fetch messages", error);
    }
  },

  sendMessage: async (sender, content, audience) => {
    set({ isSending: true });
    try {
      const res = await messageApi.sendMessage(sender, content, audience);
      if (res.success && res.data) {
        set(state => ({
          messages: [res.data!, ...state.messages],
        }));
        useNotificationStore.getState().showNotification('Pesan berhasil dikirim!', 'success');
        return true;
      }
      useNotificationStore.getState().showNotification(res.message, 'error');
      return false;
    } catch (error) {
      useNotificationStore.getState().showNotification('Gagal mengirim pesan.', 'error');
      return false;
    } finally {
      set({ isSending: false });
    }
  },
  
  markMessageAsRead: async (messageId, userId) => {
    const message = get().messages.find(m => m.id === messageId);
    // Only proceed if the message exists and is unread by the user
    if (message && !message.readBy.includes(userId)) {
      // Optimistic UI update
      set(state => {
        const updatedMessages = state.messages.map(m =>
          m.id === messageId ? { ...m, readBy: [...m.readBy, userId] } : m
        );
        return {
          messages: updatedMessages,
          unreadCount: Math.max(0, state.unreadCount - 1),
        };
      });
      // Fire and forget API call
      await messageApi.markAsRead(messageId, userId);
    }
  },
}));
