import {
  createContext,
  useCallback,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { ToastViewport } from '@/components/ui/toast';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn, generateId } from '@/lib/utils';
import type { Notification } from '@/types';

interface NotificationContextValue {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const MAX_VISIBLE = 5;
const DEFAULT_DURATION = 5000;

type NotificationAction =
  | { type: 'ADD'; payload: Notification }
  | { type: 'REMOVE'; payload: string }
  | { type: 'CLEAR' };

function notificationReducer(state: Notification[], action: NotificationAction): Notification[] {
  switch (action.type) {
    case 'ADD':
      return [...state, action.payload].slice(-MAX_VISIBLE);
    case 'REMOVE':
      return state.filter((n) => n.id !== action.payload);
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

export const NotificationContext = createContext<NotificationContextValue | null>(null);

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: 'border-emerald-500/30 bg-emerald-500/10',
  error: 'border-red-500/30 bg-red-500/10',
  warning: 'border-amber-500/30 bg-amber-500/10',
  info: 'border-blue-500/30 bg-blue-500/10',
};

const iconColors = {
  success: 'text-emerald-400',
  error: 'text-red-400',
  warning: 'text-amber-400',
  info: 'text-blue-400',
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, dispatch] = useReducer(notificationReducer, []);

  const removeNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE', payload: id });
  }, []);

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id'>) => {
      const id = generateId();
      const duration = notification.duration ?? DEFAULT_DURATION;
      dispatch({ type: 'ADD', payload: { ...notification, id } });
      if (duration > 0) {
        setTimeout(() => removeNotification(id), duration);
      }
      return id;
    },
    [removeNotification]
  );

  const clearNotifications = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  const value = useMemo<NotificationContextValue>(
    () => ({ notifications, addNotification, removeNotification, clearNotifications }),
    [notifications, addNotification, removeNotification, clearNotifications]
  );

  return (
    <NotificationContext.Provider value={value}>
      <ToastPrimitives.Provider swipeDirection="right" duration={DEFAULT_DURATION}>
        {children}
        <AnimatePresence mode="popLayout">
          {notifications.map((notification) => {
            const Icon = icons[notification.type];
            return (
              <ToastPrimitives.Root
                key={notification.id}
                open
                onOpenChange={() => removeNotification(notification.id)}
                asChild
                forceMount
              >
                <motion.div
                  layout
                  initial={{ opacity: 0, x: 100, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 100, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className={cn(
                    'flex items-start gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-xl',
                    'bg-surface/80',
                    colors[notification.type]
                  )}
                >
                  <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', iconColors[notification.type])} />
                  <div className="flex-1 min-w-0">
                    <ToastPrimitives.Title className="text-sm font-semibold text-white">
                      {notification.title}
                    </ToastPrimitives.Title>
                    {notification.description && (
                      <ToastPrimitives.Description className="mt-1 text-sm text-secondary-400">
                        {notification.description}
                      </ToastPrimitives.Description>
                    )}
                  </div>
                  <ToastPrimitives.Close className="shrink-0 rounded-lg p-1 text-secondary-400 transition-colors hover:bg-white/5 hover:text-white">
                    <X className="h-4 w-4" />
                  </ToastPrimitives.Close>
                </motion.div>
              </ToastPrimitives.Root>
            );
          })}
        </AnimatePresence>
        <ToastViewport />
      </ToastPrimitives.Provider>
    </NotificationContext.Provider>
  );
}
