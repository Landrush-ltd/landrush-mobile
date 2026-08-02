import type { AdminListingReview, AdminReviewDecision } from '../types/admin';
import type { Listing } from '../types/listing';
import type { CreateListingPayload } from '../hooks/useListings';
import type { AppNotification } from '../types/notification';
import { requireSupabase } from './supabase';

const LISTING_SELECT = `
  *,
  profile:profiles!listings_owner_id_fkey(*),
  media:listing_media(*)
`;

export async function fetchSupabaseListings(scope: 'public' | 'mine', id?: string): Promise<Listing[]> {
  const client = requireSupabase();
  let query = client.from('listings').select(LISTING_SELECT).order('created_at', { ascending: false });
  if (scope === 'public' && !id) query = query.eq('review_status', 'approved');
  if (scope === 'mine') {
    const { data: session } = await client.auth.getUser();
    if (!session.user) throw new Error('Sign in to view your listings.');
    query = query.eq('owner_id', session.user.id);
  }
  if (id) query = query.eq('id', id);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapListing);
}

export async function createSupabaseListing(payload: CreateListingPayload): Promise<Listing> {
  const client = requireSupabase();
  const { data: auth, error: authError } = await client.auth.getUser();
  if (authError || !auth.user) throw authError ?? new Error('Sign in to create a listing.');

  const { data: row, error } = await client.from('listings').insert({
    owner_id: auth.user.id,
    title: payload.title,
    description: payload.description,
    category: payload.category,
    review_status: 'pending',
    price: payload.price,
    price_unit: payload.priceUnit,
    location: payload.location,
    state: payload.state,
    lga: payload.location,
    size: payload.size,
    size_unit: normalizeSizeUnit(payload.sizeUnit),
    lease_duration: payload.leaseDuration,
  }).select('id').single();
  if (error) throw error;

  try {
    const mediaRows = await Promise.all(
      (payload.mediaUris ?? []).map(async (uri, index) => ({
        listing_id: row.id,
        storage_path: await uploadFile('listing-media', auth.user!.id, row.id, uri, `photo-${index}.jpg`),
        media_type: 'image',
        sort_order: index,
      })),
    );
    if (mediaRows.length) {
      const { error: mediaError } = await client.from('listing_media').insert(mediaRows);
      if (mediaError) throw mediaError;
    }

    const documentRows = await Promise.all(
      (payload.documents ?? []).map(async (document, index) => ({
        listing_id: row.id,
        document_type: document.type,
        storage_path: await uploadFile(
          'listing-documents',
          auth.user!.id,
          row.id,
          document.uri,
          fileName(document.uri, `document-${index}.pdf`),
        ),
        file_name: fileName(document.uri, `document-${index}.pdf`),
      })),
    );
    if (documentRows.length) {
      const { error: documentError } = await client.from('listing_documents').insert(documentRows);
      if (documentError) throw documentError;
    }
  } catch (uploadError) {
    await client.from('listings').delete().eq('id', row.id);
    throw uploadError;
  }

  return (await fetchSupabaseListings('mine', row.id))[0];
}

export async function updateSupabaseListing(id: string, payload: CreateListingPayload): Promise<Listing> {
  const client = requireSupabase();
  const { error } = await client.from('listings').update({
    title: payload.title,
    description: payload.description,
    category: payload.category,
    review_status: 'pending',
    rejection_reason: null,
    price: payload.price,
    price_unit: payload.priceUnit,
    location: payload.location,
    state: payload.state,
    lga: payload.location,
    size: payload.size,
    size_unit: normalizeSizeUnit(payload.sizeUnit),
    lease_duration: payload.leaseDuration,
    reviewed_at: null,
    reviewed_by: null,
    updated_at: new Date().toISOString(),
  }).eq('id', id);
  if (error) throw error;
  const updated = (await fetchSupabaseListings('mine', id))[0];
  if (!updated) throw new Error('Updated listing could not be loaded.');
  return updated;
}

export async function fetchSupabaseAdminReviews(): Promise<AdminListingReview[]> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('listings')
    .select(`${LISTING_SELECT}, documents:listing_documents(*)`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    id: row.id,
    listingId: row.id,
    title: row.title,
    category: row.category,
    location: `${row.location}, ${row.state}`,
    price: Number(row.price),
    thumbnail: publicMediaUrl(row.media?.[0]?.storage_path),
    listerName: `${row.profile?.first_name ?? ''} ${row.profile?.last_name ?? ''}`.trim() || 'Landrush user',
    listerRole: row.profile?.role === 'agent' ? 'agent' : 'landowner',
    submittedAt: row.created_at,
    status: row.review_status,
    rejectionReason: row.rejection_reason ?? undefined,
    flags: row.documents?.length ? [] : ['No ownership document was attached'],
    documents: (row.documents ?? []).map((document: any) => ({
      id: document.id,
      type: document.document_type,
      fileName: document.file_name,
      fileSize: document.file_size ? formatBytes(document.file_size) : 'Uploaded file',
      uploadedAt: document.created_at,
      uri: document.storage_path,
      status: document.status,
      reference: document.reference ?? undefined,
    })),
  }));
}

export async function decideSupabaseReview(payload: AdminReviewDecision): Promise<AdminListingReview> {
  const client = requireSupabase();
  const { error } = await client.rpc('review_listing', {
    p_listing_id: payload.reviewId,
    p_decision: payload.decision,
    p_reason: payload.reason ?? null,
  });
  if (error) throw error;
  const reviews = await fetchSupabaseAdminReviews();
  const updated = reviews.find((review) => review.id === payload.reviewId);
  if (!updated) throw new Error('Updated review could not be loaded.');
  return updated;
}

export async function createDocumentSignedUrl(path: string): Promise<string> {
  const { data, error } = await requireSupabase().storage.from('listing-documents').createSignedUrl(path, 300);
  if (error) throw error;
  return data.signedUrl;
}

export async function fetchSupabaseNotifications(): Promise<AppNotification[]> {
  const { data, error } = await requireSupabase()
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    subtitle: row.body,
    time: relativeTime(row.created_at),
    unread: !row.read_at,
    listingId: row.listing_id ?? undefined,
    actionRoute: row.action_route ?? undefined,
  }));
}

export async function markSupabaseNotificationRead(id?: string): Promise<void> {
  let query = requireSupabase().from('notifications').update({ read_at: new Date().toISOString() });
  if (id) query = query.eq('id', id);
  else query = query.is('read_at', null);
  const { error } = await query;
  if (error) throw error;
}

function mapListing(row: any): Listing {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    status: 'available',
    reviewStatus: row.review_status,
    rejectionReason: row.rejection_reason ?? undefined,
    price: Number(row.price),
    priceUnit: row.price_unit,
    location: row.location,
    state: row.state,
    lga: row.lga,
    coordinates: { latitude: row.latitude ?? 0, longitude: row.longitude ?? 0 },
    size: Number(row.size),
    sizeUnit: row.size_unit,
    media: (row.media ?? []).sort((a: any, b: any) => a.sort_order - b.sort_order).map((media: any) => ({
      id: media.id,
      uri: publicMediaUrl(media.storage_path),
      type: media.media_type,
    })),
    agent: {
      id: row.owner_id,
      name: `${row.profile?.first_name ?? ''} ${row.profile?.last_name ?? ''}`.trim() || 'Landrush user',
      avatar: row.profile?.avatar_url ?? '',
      phone: row.profile?.phone ?? '',
      isVerified: row.profile?.is_verified ?? false,
      totalListings: 0,
      rating: 0,
    },
    features: row.features ?? [],
    leaseDuration: row.lease_duration ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function uploadFile(bucket: string, userId: string, listingId: string, uri: string, fallback: string) {
  const response = await fetch(uri);
  if (!response.ok) throw new Error(`Could not read ${fallback}.`);
  const bytes = await response.arrayBuffer();
  const name = `${Date.now()}-${fileName(uri, fallback).replace(/[^a-zA-Z0-9._-]/g, '-')}`;
  const path = `${userId}/${listingId}/${name}`;
  const { error } = await requireSupabase().storage.from(bucket).upload(path, bytes, {
    contentType: response.headers.get('content-type') ?? 'application/octet-stream',
    upsert: false,
  });
  if (error) throw error;
  return path;
}

function publicMediaUrl(path?: string) {
  if (!path) return '';
  return requireSupabase().storage.from('listing-media').getPublicUrl(path).data.publicUrl;
}

function normalizeSizeUnit(value: string): Listing['sizeUnit'] {
  const unit = value.toLowerCase();
  if (unit.startsWith('plot')) return 'plots';
  if (unit.startsWith('acre')) return 'acres';
  if (unit.startsWith('hectare')) return 'hectares';
  return 'sqm';
}

function fileName(uri: string, fallback: string) {
  return uri.split('?')[0].split('/').pop() || fallback;
}

function formatBytes(value: number) {
  if (value < 1024 * 1024) return `${Math.ceil(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function relativeTime(value: string) {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
