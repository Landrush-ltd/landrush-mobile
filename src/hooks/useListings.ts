import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { mockListings } from '../services/mockData';
import type { Listing, ListingCategory } from '../types/listing';
import { useAuthStore } from '../store/auth';

export interface CreateListingPayload {
  category: ListingCategory;
  title: string;
  description: string;
  state: string;
  location: string;
  size: number;
  sizeUnit: string;
  price: number;
  priceUnit: string;
  leaseDuration?: string;
  mediaUris?: string[];
}

const apiEnabled = !!process.env.EXPO_PUBLIC_API_URL;

export function useListings() {
  const { token } = useAuthStore();
  return useQuery({
    queryKey: ['listings'],
    queryFn: async () => {
      if (!apiEnabled) return mockListings;
      const res = await api.get<Listing[]>('/listings', token ?? undefined);
      return res.data;
    },
    placeholderData: mockListings,
    staleTime: 2 * 60 * 1000,
  });
}

export function useListing(id: string) {
  const { token } = useAuthStore();
  return useQuery({
    queryKey: ['listings', id],
    queryFn: async () => {
      if (!apiEnabled) {
        const found = mockListings.find((l) => l.id === id);
        if (!found) throw new Error('Listing not found');
        return found;
      }
      const res = await api.get<Listing>(`/listings/${id}`, token ?? undefined);
      return res.data;
    },
    placeholderData: () => mockListings.find((l) => l.id === id),
  });
}

export function useSavedListings() {
  const { token } = useAuthStore();
  return useQuery({
    queryKey: ['listings', 'saved'],
    queryFn: async () => {
      if (!apiEnabled) return mockListings.slice(0, 3);
      const res = await api.get<Listing[]>('/listings/saved', token ?? undefined);
      return res.data;
    },
    placeholderData: mockListings.slice(0, 3),
  });
}

export function useMyListings() {
  const { token } = useAuthStore();
  return useQuery({
    queryKey: ['listings', 'mine'],
    queryFn: async () => {
      if (!apiEnabled) return mockListings.slice(0, 4);
      const res = await api.get<Listing[]>('/listings/mine', token ?? undefined);
      return res.data;
    },
    placeholderData: mockListings.slice(0, 4),
  });
}

export function useSaveListing() {
  const { token } = useAuthStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (listingId: string) =>
      apiEnabled
        ? api.post('/listings/saved', { listingId }, token ?? undefined)
        : Promise.resolve({ data: null, message: 'saved', success: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['listings', 'saved'] }),
  });
}

export function useUnsaveListing() {
  const { token } = useAuthStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (listingId: string) =>
      apiEnabled
        ? api.delete(`/listings/saved/${listingId}`, token ?? undefined)
        : Promise.resolve({ data: null, message: 'removed', success: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['listings', 'saved'] }),
  });
}

export function useCreateListing() {
  const { token } = useAuthStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateListingPayload) => {
      if (!apiEnabled) {
        await new Promise((r) => setTimeout(r, 1200));
        return { id: `new-${Date.now()}`, ...payload, status: 'available' };
      }
      const res = await api.post<Listing>('/listings', payload as unknown as Record<string, unknown>, token ?? undefined);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['listings'] });
      qc.invalidateQueries({ queryKey: ['listings', 'mine'] });
    },
  });
}
