import type { Conversation } from '../types/chat';

export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    agentId: 'agent-1',
    agentName: 'Chukwu Okafor',
    agentAvatar: 'https://i.pravatar.cc/150?img=52',
    agentOnline: true,
    listingId: '1',
    listingTitle: '3 Plots of Land — Uyo GRA',
    listingPrice: 8500000,
    listingImageUri: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400',
    lastMessage: 'Sure, Saturday works for me. Shall we say 10am?',
    lastMessageAt: '2026-06-21T09:41:00Z',
    unreadCount: 2,
    messages: [
      {
        id: 'm1',
        conversationId: 'conv-1',
        senderId: 'me',
        text: 'Good morning! I came across your listing for the 3 plots in Uyo GRA. Is the land still available?',
        createdAt: '2026-06-20T08:10:00Z',
        status: 'read',
        type: 'text',
      },
      {
        id: 'm2',
        conversationId: 'conv-1',
        senderId: 'agent-1',
        text: 'Good morning! Yes, it is still available. Are you looking to buy or lease?',
        createdAt: '2026-06-20T08:18:00Z',
        status: 'read',
        type: 'text',
      },
      {
        id: 'm3',
        conversationId: 'conv-1',
        senderId: 'me',
        text: 'I\'m looking to buy outright. I noticed the listing says ₦8.5M — is there any flexibility on the price for all 3 plots?',
        createdAt: '2026-06-20T08:25:00Z',
        status: 'read',
        type: 'text',
      },
      {
        id: 'm4',
        conversationId: 'conv-1',
        senderId: 'agent-1',
        text: 'We can discuss. I\'d recommend scheduling an inspection first so you can see the land in person. The location is really prime.',
        createdAt: '2026-06-20T09:00:00Z',
        status: 'read',
        type: 'text',
      },
      {
        id: 'm5',
        conversationId: 'conv-1',
        senderId: 'me',
        text: 'That works for me. Can we meet this weekend?',
        createdAt: '2026-06-21T09:30:00Z',
        status: 'read',
        type: 'text',
      },
      {
        id: 'm6',
        conversationId: 'conv-1',
        senderId: 'agent-1',
        text: 'Sure, Saturday works for me. Shall we say 10am?',
        createdAt: '2026-06-21T09:41:00Z',
        status: 'delivered',
        type: 'text',
      },
    ],
  },
  {
    id: 'conv-2',
    agentId: 'agent-2',
    agentName: 'Adaeze Nwosu',
    agentAvatar: 'https://i.pravatar.cc/150?img=49',
    agentOnline: false,
    listingId: '2',
    listingTitle: 'Commercial Plot — Ikot Ekpene Road',
    listingPrice: 12000000,
    listingImageUri: 'https://images.unsplash.com/photo-1592595896616-c37162298647?w=400',
    lastMessage: 'The C of O is registered in Lagos under the family name.',
    lastMessageAt: '2026-06-20T16:05:00Z',
    unreadCount: 0,
    messages: [
      {
        id: 'm7',
        conversationId: 'conv-2',
        senderId: 'me',
        text: 'Hello, what documents are available for the commercial plot?',
        createdAt: '2026-06-20T14:00:00Z',
        status: 'read',
        type: 'text',
      },
      {
        id: 'm8',
        conversationId: 'conv-2',
        senderId: 'agent-2',
        text: 'We have a Certificate of Occupancy (C of O) and a survey plan. Both are fully stamped.',
        createdAt: '2026-06-20T14:45:00Z',
        status: 'read',
        type: 'text',
      },
      {
        id: 'm9',
        conversationId: 'conv-2',
        senderId: 'me',
        text: 'Okay, who is the C of O registered under?',
        createdAt: '2026-06-20T15:10:00Z',
        status: 'read',
        type: 'text',
      },
      {
        id: 'm10',
        conversationId: 'conv-2',
        senderId: 'agent-2',
        text: 'The C of O is registered in Lagos under the family name.',
        createdAt: '2026-06-20T16:05:00Z',
        status: 'read',
        type: 'text',
      },
    ],
  },
  {
    id: 'conv-3',
    agentId: 'agent-3',
    agentName: 'Emeka Eze',
    agentAvatar: 'https://i.pravatar.cc/150?img=67',
    agentOnline: true,
    listingId: '3',
    listingTitle: '1 Acre Farmland — Nsit Ubium',
    listingPrice: 3200000,
    listingImageUri: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400',
    lastMessage: 'Hi! Happy to help. What would you like to know?',
    lastMessageAt: '2026-06-19T11:22:00Z',
    unreadCount: 0,
    messages: [
      {
        id: 'm11',
        conversationId: 'conv-3',
        senderId: 'me',
        text: 'I have questions about the farmland listing.',
        createdAt: '2026-06-19T11:20:00Z',
        status: 'read',
        type: 'text',
      },
      {
        id: 'm12',
        conversationId: 'conv-3',
        senderId: 'agent-3',
        text: 'Hi! Happy to help. What would you like to know?',
        createdAt: '2026-06-19T11:22:00Z',
        status: 'read',
        type: 'text',
      },
    ],
  },
];

export function getConversationByAgent(agentId: string, listingId?: string): Conversation | undefined {
  if (listingId) return mockConversations.find((c) => c.listingId === listingId);
  return mockConversations.find((c) => c.agentId === agentId);
}

export function formatMessageTime(iso: string): string {
  const date = new Date(iso);
  const now  = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (days === 1) return 'Yesterday';
  if (days < 7)  return date.toLocaleDateString([], { weekday: 'short' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
