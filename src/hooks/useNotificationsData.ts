import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/auth';

export interface AppNotification {
  id: string;
  type: 'inspection' | 'payment' | 'message' | 'listing' | 'system';
  title: string;
  subtitle: string;
  time: string;
  unread: boolean;
  listingId?: string;
  bookingId?: string;
}

export interface NotificationGroup {
  label: string;
  items: AppNotification[];
}

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
  const { token } = useAuthStore();
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      if (!apiEnabled) return MOCK_NOTIFICATIONS;
      const res = await api.get<AppNotification[]>('/notifications', token ?? undefined);
      return res.data;
    },
    placeholderData: MOCK_NOTIFICATIONS,
    refetchInterval: 60 * 1000,
  });
}

export function useMarkNotificationRead() {
  const { token } = useAuthStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) =>
      apiEnabled
        ? api.patch(`/notifications/${notificationId}/read`, {}, token ?? undefined)
        : Promise.resolve({ data: null, message: 'ok', success: true }),
    onMutate: async (notificationId) => {
      await qc.cancelQueries({ queryKey: ['notifications'] });
      const prev = qc.getQueryData<AppNotification[]>(['notifications']);
      qc.setQueryData<AppNotification[]>(['notifications'], (old) =>
        old?.map((n) => (n.id === notificationId ? { ...n, unread: false } : n)),
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(['notifications'], ctx.prev);
    },
  });
}

export function useMarkAllRead() {
  const { token } = useAuthStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiEnabled
        ? api.post('/notifications/read-all', {}, token ?? undefined)
        : Promise.resolve({ data: null, message: 'ok', success: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useUnreadCount() {
  const { data } = useNotificationsData();
  return data?.filter((n) => n.unread).length ?? 0;
}
