import React, {createContext, useContext, useMemo, useState, useCallback} from 'react';

export type Kind = 'reminder' | 'message' | 'alert';
export type NotificationItem = {
  id: number;
  kind: Kind;
  title: string;
  body?: string;
  time: string;
  read?: boolean;
};

type Ctx = {
  items: NotificationItem[];
  unreadCount: number;
  markAllRead: () => void;
  markRead: (id: number) => void;
  deleteItem: (id: number) => void;
  snooze: (id: number) => void;
  markUnread: (id: number) => void;
};

const NotificationsContext = createContext<Ctx | undefined>(undefined);

const initialItems: NotificationItem[] = [
  {id: 1, kind: 'reminder', title: 'Take Metformin', body: '500mg with breakfast', time: '8:00 AM', read: false},
  {id: 2, kind: 'message', title: 'Provider Message', body: 'Your lab results are available.', time: 'Yesterday', read: false},
  {id: 3, kind: 'alert', title: 'High BP Trend', body: 'Recent readings above normal.', time: '2d ago', read: false},
  {id: 4, kind: 'reminder', title: 'Doctor Appointment', body: 'Tomorrow 10:30 AM', time: 'Today', read: true},
];

export function NotificationsProvider({children}: {children: React.ReactNode}) {
  const [items, setItems] = useState<NotificationItem[]>(initialItems);

  const unreadCount = useMemo(() => items.filter(i => !i.read).length, [items]);

  const markAllRead = useCallback(() => {
    setItems(prev => prev.map(i => ({...i, read: true})));
  }, []);

  const markRead = useCallback((id: number) => {
    setItems(prev => prev.map(i => (i.id === id ? {...i, read: true} : i)));
  }, []);

  const markUnread = useCallback((id: number) => {
    setItems(prev => prev.map(i => (i.id === id ? {...i, read: false} : i)));
  }, []);

  const deleteItem = useCallback((id: number) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const snooze = useCallback((id: number) => {
    setItems(prev => {
      const target = prev.find(i => i.id === id);
      if (!target) return prev;
      const others = prev.filter(i => i.id !== id);
      const updated: NotificationItem = {
        ...target,
        time: 'Later today',
        read: false,
      };
      return [...others, updated];
    });
  }, []);

  const value = useMemo<Ctx>(() => ({items, unreadCount, markAllRead, markRead, deleteItem, snooze, markUnread}), [items, unreadCount, markAllRead, markRead, deleteItem, snooze, markUnread]);

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}
