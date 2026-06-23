import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { mockConversations } from '../services/mockChatData';
import type { Conversation, ChatMessage } from '../types/chat';
import { useAuthStore } from '../store/auth';

const apiEnabled = !!process.env.EXPO_PUBLIC_API_URL;

export function useConversations() {
  const { token } = useAuthStore();
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      if (!apiEnabled) return mockConversations;
      const res = await api.get<Conversation[]>('/conversations', token ?? undefined);
      return res.data;
    },
    placeholderData: mockConversations,
  });
}

export function useConversation(id: string) {
  const { token } = useAuthStore();
  return useQuery({
    queryKey: ['conversations', id],
    queryFn: async () => {
      if (!apiEnabled) {
        const found = mockConversations.find((c) => c.id === id);
        if (!found) throw new Error('Conversation not found');
        return found;
      }
      const res = await api.get<Conversation>(`/conversations/${id}`, token ?? undefined);
      return res.data;
    },
    placeholderData: () => mockConversations.find((c) => c.id === id),
  });
}

export function useSendMessage() {
  const { token } = useAuthStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { conversationId: string; text: string }) => {
      if (!apiEnabled) {
        return {
          id: Date.now().toString(),
          conversationId: payload.conversationId,
          senderId: 'me',
          text: payload.text,
          createdAt: new Date().toISOString(),
          status: 'sent' as const,
          type: 'text' as const,
        } satisfies ChatMessage;
      }
      const res = await api.post<ChatMessage>(
        `/conversations/${payload.conversationId}/messages`,
        { text: payload.text },
        token ?? undefined,
      );
      return res.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['conversations', variables.conversationId] });
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useStartConversation() {
  const { token } = useAuthStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { agentId: string; listingId: string; initialMessage?: string }) => {
      if (!apiEnabled) {
        const existing = mockConversations.find((c) => c.listingId === payload.listingId);
        if (existing) return existing;
        return mockConversations[0];
      }
      const res = await api.post<Conversation>('/conversations', payload, token ?? undefined);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['conversations'] }),
  });
}
