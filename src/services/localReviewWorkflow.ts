import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AdminListingReview, AdminReviewDecision } from '../types/admin';
import type { Listing } from '../types/listing';
import type { User } from '../types/user';
import { mockAdminReviews } from './mockAdminData';
import { mockListings } from './mockData';
import { addLocalNotification } from './localNotifications';

const REVIEWS_KEY = 'landrush_demo_admin_reviews_v1';
const LISTINGS_KEY = 'landrush_demo_owner_listings_v1';

async function readJson<T>(key: string, fallback: T): Promise<T> {
  const value = await AsyncStorage.getItem(key);
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export async function getLocalReviews(): Promise<AdminListingReview[]> {
  return readJson(REVIEWS_KEY, mockAdminReviews);
}

export async function getLocalOwnerListings(): Promise<Listing[]> {
  const persisted = await readJson<Listing[]>(LISTINGS_KEY, []);
  const seeded = mockListings.slice(0, 4).map((listing, index) => ({
    ...listing,
    reviewStatus: (index === 0 ? 'approved' : index === 1 ? 'pending' : index === 2 ? 'rejected' : 'pending') as Listing['reviewStatus'],
    rejectionReason: index === 2 ? 'The survey-plan reference could not be verified. Upload a clearer registered copy.' : undefined,
  }));
  const persistedIds = new Set(persisted.map((listing) => listing.id));
  return [...persisted, ...seeded.filter((listing) => !persistedIds.has(listing.id))];
}

export async function getLocalPublicListings(): Promise<Listing[]> {
  const persisted = await readJson<Listing[]>(LISTINGS_KEY, []);
  return [...persisted.filter((listing) => listing.reviewStatus === 'approved'), ...mockListings];
}

export async function deleteLocalOwnerListing(listingId: string): Promise<void> {
  const [listings, reviews] = await Promise.all([
    readJson<Listing[]>(LISTINGS_KEY, []),
    getLocalReviews(),
  ]);
  await AsyncStorage.multiSet([
    [LISTINGS_KEY, JSON.stringify(listings.filter((listing) => listing.id !== listingId))],
    [REVIEWS_KEY, JSON.stringify(reviews.filter((review) => review.listingId !== listingId))],
  ]);
}

export async function updateLocalOwnerListing(listingId: string, payload: LocalListingInput): Promise<Listing> {
  const [all, reviews] = await Promise.all([getLocalOwnerListings(), getLocalReviews()]);
  const current = all.find((listing) => listing.id === listingId);
  if (!current) throw new Error('Listing not found.');
  const updated: Listing = {
    ...current,
    ...payload,
    sizeUnit: normalizeSizeUnit(payload.sizeUnit),
    reviewStatus: 'pending',
    rejectionReason: undefined,
    updatedAt: new Date().toISOString(),
  };
  const persisted = await readJson<Listing[]>(LISTINGS_KEY, []);
  const existingReview = reviews.find((review) => review.listingId === listingId);
  const refreshedReview: AdminListingReview = existingReview
    ? {
        ...existingReview,
        title: updated.title,
        category: updated.category,
        location: `${updated.location}, ${updated.state}`,
        price: updated.price,
        status: 'pending',
        rejectionReason: undefined,
        submittedAt: updated.updatedAt,
        documents: existingReview.documents.map((document) => ({ ...document, status: 'pending' })),
      }
    : {
        id: `review-${Date.now()}`,
        listingId,
        title: updated.title,
        category: updated.category,
        location: `${updated.location}, ${updated.state}`,
        price: updated.price,
        thumbnail: updated.media[0]?.uri ?? '',
        listerName: updated.agent.name,
        listerRole: 'landowner',
        submittedAt: updated.updatedAt,
        status: 'pending',
        documents: [],
        flags: ['No ownership document was attached'],
      };
  await AsyncStorage.multiSet([
    [LISTINGS_KEY, JSON.stringify([updated, ...persisted.filter((listing) => listing.id !== listingId)])],
    [REVIEWS_KEY, JSON.stringify([
      refreshedReview,
      ...reviews.filter((review) => review.listingId !== listingId),
    ])],
  ]);
  await addLocalNotification({
    type: 'listing', audience: 'admin', listingId, actionRoute: '/admin',
    title: 'Listing resubmitted', subtitle: `${updated.title} is ready for another document review.`,
  });
  return updated;
}

export interface LocalListingInput {
  category: Listing['category'];
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
  documents?: { type: string; uri: string }[];
}

export async function submitLocalListing(payload: LocalListingInput, user: User | null): Promise<Listing> {
  const now = new Date().toISOString();
  const id = `listing-${Date.now()}`;
  const photoUris = payload.mediaUris?.length
    ? payload.mediaUris
    : ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format&fit=crop'];
  const listing: Listing = {
    id,
    title: payload.title,
    description: payload.description,
    category: payload.category,
    status: 'available',
    reviewStatus: 'pending',
    price: payload.price,
    priceUnit: payload.priceUnit,
    location: payload.location,
    state: payload.state,
    lga: payload.location,
    coordinates: { latitude: 6.5244, longitude: 3.3792 },
    size: payload.size,
    sizeUnit: normalizeSizeUnit(payload.sizeUnit),
    media: photoUris.map((uri, index) => ({ id: `${id}-media-${index}`, uri, type: 'image' })),
    agent: {
      id: user?.id ?? 'demo-owner',
      name: user ? `${user.firstName} ${user.lastName}`.trim() : 'Demo Landowner',
      avatar: user?.avatar ?? '',
      phone: user?.phone ?? '',
      isVerified: user?.isVerified ?? false,
      totalListings: 1,
      rating: 0,
    },
    features: [],
    leaseDuration: payload.leaseDuration,
    createdAt: now,
    updatedAt: now,
  };

  const documents = payload.documents ?? [];
  const review: AdminListingReview = {
    id: `review-${Date.now()}`,
    listingId: id,
    title: listing.title,
    category: listing.category,
    location: `${listing.location}, ${listing.state}`,
    price: listing.price,
    thumbnail: listing.media[0]?.uri ?? '',
    listerName: listing.agent.name,
    listerRole: user?.role === 'agent' ? 'agent' : 'landowner',
    submittedAt: now,
    status: 'pending',
    documents: documents.map((document, index) => ({
      id: `${id}-document-${index}`,
      type: document.type,
      fileName: fileNameFromUri(document.uri, `${document.type}.pdf`),
      fileSize: 'Uploaded file',
      uploadedAt: now,
      uri: document.uri,
      status: 'pending',
    })),
    flags: documents.length === 0 ? ['No ownership document was attached'] : [],
  };

  const [listings, reviews] = await Promise.all([
    readJson<Listing[]>(LISTINGS_KEY, []),
    getLocalReviews(),
  ]);
  await AsyncStorage.multiSet([
    [LISTINGS_KEY, JSON.stringify([listing, ...listings])],
    [REVIEWS_KEY, JSON.stringify([review, ...reviews])],
  ]);
  await Promise.all([
    addLocalNotification({
      type: 'listing', audience: 'admin', listingId: id, actionRoute: '/admin',
      title: 'New listing awaiting review', subtitle: `${listing.title} was submitted by ${listing.agent.name}.`,
    }),
    addLocalNotification({
      type: 'listing', audience: 'owner', listingId: id, actionRoute: '/my-listings',
      title: 'Listing submitted', subtitle: `${listing.title} is now in the verification queue.`,
    }),
  ]);
  return listing;
}

export async function decideLocalReview(payload: AdminReviewDecision): Promise<AdminListingReview> {
  const [reviews, listings] = await Promise.all([
    getLocalReviews(),
    readJson<Listing[]>(LISTINGS_KEY, []),
  ]);
  const current = reviews.find((review) => review.id === payload.reviewId);
  if (!current) throw new Error('Review not found');

  const updated: AdminListingReview = {
    ...current,
    status: payload.decision,
    rejectionReason: payload.reason,
    documents: current.documents.map((document) => ({
      ...document,
      status: payload.verifiedDocumentIds.includes(document.id)
        ? 'verified'
        : payload.decision === 'rejected'
          ? 'rejected'
          : document.status,
    })),
  };
  await AsyncStorage.multiSet([
    [REVIEWS_KEY, JSON.stringify(reviews.map((review) => review.id === updated.id ? updated : review))],
    [LISTINGS_KEY, JSON.stringify(listings.map((listing) => listing.id === updated.listingId
      ? {
          ...listing,
          reviewStatus: updated.status,
          rejectionReason: updated.rejectionReason,
          updatedAt: new Date().toISOString(),
        }
      : listing))],
  ]);
  await addLocalNotification({
    type: 'listing', audience: 'owner', listingId: updated.listingId,
    actionRoute: updated.status === 'approved' ? `/listing/${updated.listingId}` : '/my-listings',
    title: updated.status === 'approved' ? 'Listing approved' : 'Listing needs changes',
    subtitle: updated.status === 'approved'
      ? `${updated.title} is now live on Landrush.`
      : (updated.rejectionReason || `Review ${updated.title} and submit the requested corrections.`),
  });
  return updated;
}

function normalizeSizeUnit(value: string): Listing['sizeUnit'] {
  const normalized = value.toLowerCase();
  if (normalized.startsWith('plot')) return 'plots';
  if (normalized.startsWith('acre')) return 'acres';
  if (normalized.startsWith('hectare')) return 'hectares';
  return 'sqm';
}

function fileNameFromUri(uri: string, fallback: string) {
  const clean = uri.split('?')[0];
  return clean.split('/').pop() || fallback;
}
