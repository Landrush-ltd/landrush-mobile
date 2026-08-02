import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppNotification } from '../types/notification';

const KEY = 'landrush_demo_notifications_v1';

async function read(): Promise<AppNotification[]> {
  const value = await AsyncStorage.getItem(KEY);
  if (!value) return [];
  try { return JSON.parse(value) as AppNotification[]; } catch { return []; }
}

export async function getLocalNotifications(role?: string) {
  const items = await read();
  return items.filter((item) => item.audience === 'all' || item.audience === (role === 'admin' ? 'admin' : 'owner'));
}

export async function addLocalNotification(notification: Omit<AppNotification, 'id' | 'time' | 'unread'>) {
  const items = await read();
  const item: AppNotification = {
    ...notification,
    id: `notification-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    time: 'Just now',
    unread: true,
  };
  await AsyncStorage.setItem(KEY, JSON.stringify([item, ...items].slice(0, 100)));
  return item;
}

export async function markLocalNotificationRead(id?: string) {
  const items = await read();
  await AsyncStorage.setItem(KEY, JSON.stringify(items.map((item) => !id || item.id === id ? { ...item, unread: false } : item)));
}
