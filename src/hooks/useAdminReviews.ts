import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { decideLocalReview, getLocalReviews } from '../services/localReviewWorkflow';
import { useAuthStore } from '../store/auth';
import type { AdminListingReview, AdminReviewDecision } from '../types/admin';

const apiEnabled = !!process.env.EXPO_PUBLIC_API_URL;
const queryKey = ['admin', 'listing-reviews'] as const;

export function useAdminReviews(enabled = true) {
  const { token } = useAuthStore();
  return useQuery({
    queryKey,
    enabled,
    queryFn: async () => {
      if (!apiEnabled) return getLocalReviews();
      const response = await api.get<AdminListingReview[]>('/admin/listing-reviews', token ?? undefined);
      return response.data;
    },
  });
}

export function useAdminReviewDecision() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AdminReviewDecision) => {
      if (!apiEnabled) {
        await new Promise((resolve) => setTimeout(resolve, 350));
        return decideLocalReview(payload);
      }
      const response = await api.patch<AdminListingReview>(
        `/admin/listing-reviews/${payload.reviewId}`,
        payload as unknown as Record<string, unknown>,
        token ?? undefined,
      );
      return response.data;
    },
    onSuccess: (result, payload) => {
      queryClient.invalidateQueries({ queryKey: ['listings', 'mine'] });
      queryClient.setQueryData<AdminListingReview[]>(queryKey, (reviews = []) =>
        reviews.map((review) =>
          review.id === payload.reviewId
            ? {
                ...review,
                status: payload.decision,
                rejectionReason: payload.reason,
                documents: review.documents.map((document) => ({
                  ...document,
                  status: payload.verifiedDocumentIds.includes(document.id)
                    ? 'verified'
                    : payload.decision === 'rejected'
                      ? 'rejected'
                      : document.status,
                })),
              }
            : review,
        ),
      );
    },
  });
}
