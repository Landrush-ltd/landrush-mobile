import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/auth';
import { supabaseEnabled } from '../services/supabase';
import { fetchSupabaseNotifications, markSupabaseNotificationRead } from '../services/supabaseData';
import { getLocalNotifications, markLocalNotificationRead } from '../services/localNotifications';
import type { AppNotification, NotificationGroup } from '../types/notification';

export type { AppNotification, NotificationGroup } from '../types/notification';

const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: '1',
    type: 'inspection',
    title: 'Inspection Confirmed',
    subtitle: 'Your inspection for 12 Acres of Farmland has been confirmed for Monday, 12 May at 10:00 AM.',
    time: '2m ago',
    unread: true,
    listingId: '1',
  },
  {
    id: '2',
    type: 'payment',
    title: 'Payment Successful',
    subtitle: 'Your inspection fee of ₦5,000 for Residential Plot in Lekki was received.',
    time: '1h ago',
    unread: true,
  },
  {
    id: '3',
    type: 'listing',
    title: 'New Listing in Your Area',
    subtitle: '2 new land listings were added in Lagos State matching your preferences.',
    time: '3h ago',
    unread: false,
  },
  {
    id: '4',
    type: 'message',
    title: 'New Message from Chioma Okafor',
    subtitle: 'Sure, Saturday works for me. Shall we say 10am?',
    time: 'Yesterday',
    unread: false,
  },
  {
    id: '5',
    type: 'system',
    title: 'Identity Verification Complete',
    subtitle: 'Your NIN verification was successful. Your profile is now verified.',
    time: '2 days ago',
    unread: false,
  },
];

const apiEnabled = !!process.env.EXPO_PUBLIC_API_URL;

export function useNotificationsData() {
  const { token, user } = useAuthStore();
  return useQuery({
    queryKey: ['notifications', user?.role ?? 'guest'],
    queryFn: async () => {
      if (supabaseEnabled) return fetchSupabaseNotifications();
      if (!apiEnabled) {
        const lifecycle = await getLocalNotifications(user?.role);
        return user?.role === 'admin' ? lifecycle : [...lifecycle, ...MOCK_NOTIFICATIONS];
      }
      const res = await api.get<AppNotification[]>('/notifications', token ?? undefined);
      return res.data;
    },
    placeholderData: MOCK_NOTIFICATIONS,
    refetchInterval: 60 * 1000,
  });
}

export function useMarkNotificationRead() {
  const { token, user } = useAuthStore();
  const qc = useQueryClient();
  const key = ['notifications', user?.role ?? 'guest'];
  return useMutation<void, Error, string, { prev?: AppNotification[] }>({
    mutationFn: async (notificationId: string) => {
      if (supabaseEnabled) await markSupabaseNotificationRead(notificationId);
      else if (apiEnabled) await api.patch(`/notifications/${notificationId}/read`, {}, token ?? undefined);
      else await markLocalNotificationRead(notificationId);
    },
    onMutate: async (notificationId) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<AppNotification[]>(key);
      qc.setQueryData<AppNotification[]>(key, (old) =>
        old?.map((n) => (n.id === notificationId ? { ...n, unread: false } : n)),
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
    },
  });
}

export function useMarkAllRead() {
  const { token } = useAuthStore();
  const qc = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      if (supabaseEnabled) await markSupabaseNotificationRead();
      else if (apiEnabled) await api.post('/notifications/read-all', {}, token ?? undefined);
      else await markLocalNotificationRead();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useUnreadCount() {
  const { data } = useNotificationsData();
  return data?.filter((n) => n.unread).length ?? 0;
}
