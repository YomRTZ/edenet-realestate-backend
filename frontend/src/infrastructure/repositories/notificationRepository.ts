// src/infrastructure/repositories/notificationRepository.ts

import apiClient from '@/src/infrastructure/http/axiosClient';
import type { Notification } from '@/src/core/types';

const notificationRepository = {
  fetchAll: async (): Promise<{ notifications: Notification[]; unreadCount: number }> => {
    const { data } = await apiClient.get('/notifications');
    return data;
  },

  markRead: async (id: string): Promise<void> => {
    await apiClient.post(`/notifications/${id}/read`);
  },

  markAllRead: async (): Promise<void> => {
    await apiClient.post('/notifications/read-all');
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`);
  },
};

export default notificationRepository;
