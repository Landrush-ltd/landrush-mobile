import type { ListingCategory } from './listing';

export type AdminReviewStatus = 'pending' | 'approved' | 'rejected';
export type DocumentReviewStatus = 'pending' | 'verified' | 'rejected';

export interface AdminDocument {
  id: string;
  type: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  uri?: string;
  status: DocumentReviewStatus;
  reference?: string;
}

export interface AdminListingReview {
  id: string;
  listingId: string;
  title: string;
  category: ListingCategory;
  location: string;
  price: number;
  thumbnail: string;
  listerName: string;
  listerRole: 'landowner' | 'agent';
  submittedAt: string;
  status: AdminReviewStatus;
  documents: AdminDocument[];
  flags: string[];
  rejectionReason?: string;
}

export interface AdminReviewDecision {
  reviewId: string;
  decision: 'approved' | 'rejected';
  verifiedDocumentIds: string[];
  reason?: string;
}
