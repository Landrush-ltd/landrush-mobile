export type ListingCategory = 'lease' | 'sale' | 'distress';

export type ListingStatus = 'available' | 'taken' | 'closed';

export interface ListingCoordinates {
  latitude: number;
  longitude: number;
}

export interface ListingMedia {
  id: string;
  uri: string;
  type: 'image' | 'video';
}

export interface ListingAgent {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  isVerified: boolean;
  totalListings: number;
  rating: number;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: ListingCategory;
  status: ListingStatus;
  price: number;
  priceUnit: string;
  location: string;
  state: string;
  lga: string;
  coordinates: ListingCoordinates;
  size: number;
  sizeUnit: 'plots' | 'acres' | 'hectares' | 'sqm';
  media: ListingMedia[];
  agent: ListingAgent;
  features: string[];
  leaseDuration?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListingFilter {
  category?: ListingCategory;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  state?: string;
  minSize?: number;
  maxSize?: number;
  sizeUnit?: string;
}

export interface InspectionBooking {
  id: string;
  listingId: string;
  userId: string;
  preferredDate: string;
  preferredTime: string;
  status: 'pending' | 'confirmed' | 'rescheduled' | 'cancelled';
  message?: string;
  createdAt: string;
}
