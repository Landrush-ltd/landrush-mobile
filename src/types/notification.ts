export interface AppNotification {
  id: string;
  type: 'inspection' | 'payment' | 'message' | 'listing' | 'system';
  title: string;
  subtitle: string;
  time: string;
  unread: boolean;
  listingId?: string;
  bookingId?: string;
  actionRoute?: string;
  audience?: 'admin' | 'owner' | 'all';
}

export interface NotificationGroup {
  label: string;
  items: AppNotification[];
}
