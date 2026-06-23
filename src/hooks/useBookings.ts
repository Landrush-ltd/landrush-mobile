import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/auth';

export interface Booking {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  location: string;
  price: string;
  date: string;
  time: string;
  status: 'pending' | 'upcoming' | 'rescheduled' | 'past' | 'cancelled';
  agentName: string;
  agentAvatar: string;
}

const MOCK_BOOKINGS: Booking[] = [
  {
    id: '1',
    listingId: '1',
    listingTitle: '12 Acres of Farmland',
    listingImage: 'https://images.unsplash.com/photo-1704230093402-c903d87735b4?w=400&auto=format&fit=crop',
    location: 'Ikot Ekpene, Akwa Ibom',
    price: '₦4,500,000',
    date: 'Monday, 12 May 2026',
    time: '10:00 AM – 11:30 AM',
    status: 'pending',
    agentName: 'Adewale Properties',
    agentAvatar: 'https://i.pravatar.cc/150?img=52',
  },
  {
    id: '2',
    listingId: '4',
    listingTitle: '5 Plots Industrial Zone',
    listingImage: 'https://images.unsplash.com/photo-1685266326473-5b99c3d08a7e?w=400&auto=format&fit=crop',
    location: 'Ota, Ogun State',
    price: '₦2,800,000',
    date: 'Friday, 20 Jun 2026',
    time: '2:00 PM – 3:30 PM',
    status: 'rescheduled',
    agentName: 'Gideon Etim',
    agentAvatar: 'https://i.pravatar.cc/150?img=67',
  },
  {
    id: '3',
    listingId: '2',
    listingTitle: 'Residential Plot — Lekki Phase 2',
    listingImage: 'https://images.unsplash.com/photo-1684853693031-ab9e3f8c9d5e?w=400&auto=format&fit=crop',
    location: 'Lekki, Lagos',
    price: '₦45,000,000',
    date: 'Thursday, 15 May 2026',
    time: '11:00 AM – 12:00 PM',
    status: 'past',
    agentName: 'Chioma Okafor',
    agentAvatar: 'https://i.pravatar.cc/150?img=5',
  },
];

const apiEnabled = !!process.env.EXPO_PUBLIC_API_URL;

export function useBookings() {
  const { token } = useAuthStore();
  return useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      if (!apiEnabled) return MOCK_BOOKINGS;
      const res = await api.get<Booking[]>('/bookings', token ?? undefined);
      return res.data;
    },
    placeholderData: MOCK_BOOKINGS,
  });
}

export function useCreateBooking() {
  const { token } = useAuthStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      listingId: string;
      date: string;
      time: string;
      notes?: string;
    }) =>
      apiEnabled
        ? api.post<Booking>('/bookings', payload, token ?? undefined).then((r) => r.data)
        : Promise.resolve({ ...MOCK_BOOKINGS[0], id: Date.now().toString(), ...payload, status: 'pending' as const }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  });
}

export function useCancelBooking() {
  const { token } = useAuthStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) =>
      apiEnabled
        ? api.patch(`/bookings/${bookingId}`, { status: 'cancelled' }, token ?? undefined)
        : Promise.resolve({ data: null, message: 'cancelled', success: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  });
}
