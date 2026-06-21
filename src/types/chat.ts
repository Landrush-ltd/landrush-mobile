export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image';
  imageUri?: string;
}

export interface Conversation {
  id: string;
  agentId: string;
  agentName: string;
  agentAvatar: string;
  agentOnline: boolean;
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  listingImageUri: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  messages: ChatMessage[];
}
