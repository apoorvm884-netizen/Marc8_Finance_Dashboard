import { useContext, useCallback } from 'react';
import { NotificationContext } from '@/providers/notification-provider';

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }

  const { addNotification, removeNotification, clearNotifications, notifications } = context;

  const notify = {
    success: useCallback(
      (title: string, description?: string, duration?: number) =>
        addNotification({ type: 'success', title, description, duration }),
      [addNotification]
    ),
    error: useCallback(
      (title: string, description?: string, duration?: number) =>
        addNotification({ type: 'error', title, description, duration }),
      [addNotification]
    ),
    warning: useCallback(
      (title: string, description?: string, duration?: number) =>
        addNotification({ type: 'warning', title, description, duration }),
      [addNotification]
    ),
    info: useCallback(
      (title: string, description?: string, duration?: number) =>
        addNotification({ type: 'info', title, description, duration }),
      [addNotification]
    ),
  };

  return { notifications, notify, removeNotification, clearNotifications };
}
