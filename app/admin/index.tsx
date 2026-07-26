import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BorderRadius,
  FontFamily,
  FontSize,
  LetterSpacing,
  Shadow,
  Spacing,
} from '../../src/constants/theme';
import type { ThemeColors } from '../../src/constants/theme';
import { useColors } from '../../src/context/ThemeContext';
import { useAdminReviewDecision, useAdminReviews } from '../../src/hooks/useAdminReviews';
import { useAuthStore } from '../../src/store/auth';
import type { AdminListingReview, AdminReviewStatus } from '../../src/types/admin';
import { formatDate, formatFullPrice, getCategoryLabel } from '../../src/utils/format';

type Filter = 'all' | AdminReviewStatus;
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

const STATUS_CONFIG: Record<AdminReviewStatus, { label: string; color: string; icon: IoniconsName }> = {
  pending: { label: 'Needs review', color: '#E47C18', icon: 'time-outline' },
  approved: { label: 'Approved', color: '#2D6A4F', icon: 'checkmark-circle-outline' },
  rejected: { label: 'Rejected', color: '#C13515', icon: 'close-circle-outline' },
};

export default function AdminReviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { user } = useAuthStore();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const isWide = width >= 760;
  const isDemoMode = !process.env.EXPO_PUBLIC_API_URL;
  const hasAdminAccess = user?.role === 'admin';
  const { data: reviews = [], isLoading, isError, refetch } = useAdminReviews(hasAdminAccess);
  const decision = useAdminReviewDecision();

  const [filter, setFilter] = useState<Filter>('pending');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<AdminListingReview | null>(null);
  const [verifiedDocumentIds, setVerifiedDocumentIds] = useState<string[]>([]);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const counts = useMemo(
    () => ({
      all: reviews.length,
      pending: reviews.filter((review) => review.status === 'pending').length,
      approved: reviews.filter((review) => review.status === 'approved').length,
      rejected: reviews.filter((review) => review.status === 'rejected').length,
    }),
    [reviews],
  );

  const filteredReviews = useMemo(() => {
    const term = search.trim().toLowerCase();
    return reviews.filter((review) => {
      const matchesFilter = filter === 'all' || review.status === filter;
      const matchesSearch =
        !term ||
        review.title.toLowerCase().includes(term) ||
        review.location.toLowerCase().includes(term) ||
        review.listerName.toLowerCase().includes(term);
      return matchesFilter && matchesSearch;
    });
  }, [filter, reviews, search]);

  const openReview = (review: AdminListingReview) => {
    setSelected(review);
    setVerifiedDocumentIds(
      review.documents.filter((document) => document.status === 'verified').map((document) => document.id),
    );
    setRejectMode(false);
    setRejectionReason('');
  };

  const closeReview = () => {
    if (decision.isPending) return;
    setSelected(null);
    setRejectMode(false);
    setRejectionReason('');
  };

  const toggleDocument = (documentId: string) => {
    setVerifiedDocumentIds((current) =>
      current.includes(documentId)
        ? current.filter((id) => id !== documentId)
        : [...current, documentId],
    );
  };

  const approveSelected = () => {
    if (!selected) return;
    if (selected.documents.length === 0) {
      Alert.alert('Documents required', 'A listing cannot be approved without an ownership document.');
      return;
    }
    if (verifiedDocumentIds.length !== selected.documents.length) {
      Alert.alert('Verify all documents', 'Review and mark every uploaded document as verified before approval.');
      return;
    }
    decision.mutate(
      {
        reviewId: selected.id,
        decision: 'approved',
        verifiedDocumentIds,
      },
      {
        onSuccess: () => {
          setSelected(null);
          Alert.alert('Listing approved', 'The listing is now approved for publication.');
        },
        onError: (error) => Alert.alert('Approval failed', error.message),
      },
    );
  };

  const rejectSelected = () => {
    if (!selected || !rejectionReason.trim()) return;
    decision.mutate(
      {
        reviewId: selected.id,
        decision: 'rejected',
        verifiedDocumentIds,
        reason: rejectionReason.trim(),
      },
      {
        onSuccess: () => {
          setSelected(null);
          Alert.alert('Listing rejected', 'The lister will receive the reason and can submit corrections.');
        },
        onError: (error) => Alert.alert('Rejection failed', error.message),
      },
    );
  };

  if (!hasAdminAccess) {
    return (
      <View style={[styles.accessRoot, { paddingTop: insets.top + Spacing.xl }]}>
        <View style={styles.accessCard}>
          <View style={styles.accessIcon}>
            <Ionicons name="lock-closed" size={28} color={colors.primary} />
          </View>
          <Text style={styles.accessTitle}>Admin access required</Text>
          <Text style={styles.accessText}>
            Sign in with an administrator account to review documents and approve listings.
          </Text>
          {isDemoMode && (
            <Text style={styles.accessText}>
              Demo access: use admin@landrush.africa and any password.
            </Text>
          )}
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.primaryButtonText}>Go to admin sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <View style={styles.headerInner}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={21} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.headerEyebrow}>LANDRUSH OPERATIONS</Text>
            <Text style={styles.headerTitle}>Listing Review Console</Text>
            <Text style={styles.headerSubtitle}>Verify ownership documents before listings go live.</Text>
          </View>
          {isDemoMode && (
            <View style={styles.demoPill}>
              <Text style={styles.demoPillText}>DEMO</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, Spacing.xxl) + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statGrid}>
          <StatCard label="Awaiting review" value={counts.pending} icon="time-outline" accent={colors.warning} styles={styles} />
          <StatCard label="Approved" value={counts.approved} icon="checkmark-circle-outline" accent={colors.success} styles={styles} />
          <StatCard label="Rejected" value={counts.rejected} icon="close-circle-outline" accent={colors.error} styles={styles} />
        </View>

        <View style={styles.toolbar}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color={colors.textTertiary} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search listing, location, or lister"
              placeholderTextColor={colors.textTertiary}
              style={styles.searchInput}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={17} color={colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {FILTERS.map((item) => {
              const active = item.key === filter;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.filterButton, active && styles.filterButtonActive]}
                  onPress={() => setFilter(item.key)}
                >
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>{item.label}</Text>
                  <View style={[styles.filterCount, active && styles.filterCountActive]}>
                    <Text style={[styles.filterCountText, active && styles.filterCountTextActive]}>
                      {counts[item.key]}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {isLoading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.stateText}>Loading review queue…</Text>
          </View>
        ) : isError ? (
          <View style={styles.stateCard}>
            <Ionicons name="cloud-offline-outline" size={34} color={colors.error} />
            <Text style={styles.stateTitle}>Could not load reviews</Text>
            <Text style={styles.stateText}>Check your connection and try again.</Text>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => refetch()}>
              <Text style={styles.secondaryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredReviews.length === 0 ? (
          <View style={styles.stateCard}>
            <Ionicons name="checkmark-done-circle-outline" size={40} color={colors.success} />
            <Text style={styles.stateTitle}>Queue is clear</Text>
            <Text style={styles.stateText}>No listings match this filter.</Text>
          </View>
        ) : (
          <View style={styles.reviewList}>
            {filteredReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                isWide={isWide}
                colors={colors}
                styles={styles}
                onPress={() => openReview(review)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <Modal visible={selected !== null} animationType="slide" transparent onRequestClose={closeReview}>
        <View style={styles.modalOverlay}>
          <View style={[styles.reviewSheet, isWide && styles.reviewSheetWide]}>
            {selected && (
              <>
                <View style={styles.sheetHandle} />
                <View style={styles.sheetHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sheetEyebrow}>REVIEW #{selected.id.replace('review-', '')}</Text>
                    <Text style={styles.sheetTitle} numberOfLines={2}>{selected.title}</Text>
                  </View>
                  <TouchableOpacity style={styles.closeButton} onPress={closeReview}>
                    <Ionicons name="close" size={21} color={colors.textPrimary} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
                  <View style={styles.listingSummary}>
                    <Image source={{ uri: selected.thumbnail }} style={styles.summaryImage} />
                    <View style={styles.summaryCopy}>
                      <Text style={styles.summaryPrice}>{formatFullPrice(selected.price)}</Text>
                      <Text style={styles.summaryMeta}>{selected.location}</Text>
                      <Text style={styles.summaryMeta}>
                        {getCategoryLabel(selected.category)} · {selected.listerName}
                      </Text>
                    </View>
                  </View>

                  {selected.flags.length > 0 && (
                    <View style={styles.flagPanel}>
                      <View style={styles.flagHeader}>
                        <Ionicons name="warning-outline" size={17} color={colors.warning} />
                        <Text style={styles.flagTitle}>Review flags</Text>
                      </View>
                      {selected.flags.map((flag) => (
                        <Text key={flag} style={styles.flagText}>• {flag}</Text>
                      ))}
                    </View>
                  )}

                  <View style={styles.documentHeadingRow}>
                    <View>
                      <Text style={styles.documentHeading}>Uploaded documents</Text>
                      <Text style={styles.documentSubheading}>
                        Verify each file before approving this listing.
                      </Text>
                    </View>
                    <Text style={styles.documentProgress}>
                      {verifiedDocumentIds.length}/{selected.documents.length}
                    </Text>
                  </View>

                  <View style={styles.documentList}>
                    {selected.documents.map((document) => {
                      const verified = verifiedDocumentIds.includes(document.id);
                      return (
                        <View key={document.id} style={[styles.documentCard, verified && styles.documentCardVerified]}>
                          <View style={[styles.documentIcon, verified && styles.documentIconVerified]}>
                            <Ionicons
                              name={verified ? 'document-text' : 'document-text-outline'}
                              size={22}
                              color={verified ? colors.success : colors.primary}
                            />
                          </View>
                          <View style={styles.documentCopy}>
                            <Text style={styles.documentType}>{document.type}</Text>
                            <Text style={styles.documentFile} numberOfLines={1}>{document.fileName}</Text>
                            <Text style={styles.documentMeta}>
                              {document.fileSize} · {formatDate(document.uploadedAt)}
                            </Text>
                            {document.reference && (
                              <Text style={styles.documentReference}>Ref: {document.reference}</Text>
                            )}
                          </View>
                          <View style={styles.documentActions}>
                            <TouchableOpacity
                              style={styles.viewDocumentButton}
                              onPress={() =>
                                Alert.alert(
                                  'Secure document preview',
                                  isDemoMode
                                    ? 'This demo shows document metadata. The uploaded file will open here when the admin API provides its secure URL.'
                                    : 'The document preview is not available.',
                                )
                              }
                            >
                              <Ionicons name="eye-outline" size={16} color={colors.primary} />
                              <Text style={styles.viewDocumentText}>View</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.verifyButton, verified && styles.verifyButtonActive]}
                              onPress={() => toggleDocument(document.id)}
                            >
                              <Ionicons
                                name={verified ? 'checkmark-circle' : 'ellipse-outline'}
                                size={18}
                                color={verified ? '#FFFFFF' : colors.textSecondary}
                              />
                              <Text style={[styles.verifyText, verified && styles.verifyTextActive]}>
                                {verified ? 'Verified' : 'Verify'}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  </View>

                  {rejectMode && (
                    <View style={styles.rejectionPanel}>
                      <Text style={styles.rejectionLabel}>Reason for rejection</Text>
                      <TextInput
                        value={rejectionReason}
                        onChangeText={setRejectionReason}
                        placeholder="Explain what the lister must correct…"
                        placeholderTextColor={colors.textTertiary}
                        style={styles.rejectionInput}
                        multiline
                        textAlignVertical="top"
                      />
                    </View>
                  )}
                </ScrollView>

                <View style={[styles.sheetFooter, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
                  {rejectMode ? (
                    <>
                      <TouchableOpacity style={styles.cancelButton} onPress={() => setRejectMode(false)}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.rejectConfirmButton,
                          (!rejectionReason.trim() || decision.isPending) && styles.buttonDisabled,
                        ]}
                        onPress={rejectSelected}
                        disabled={!rejectionReason.trim() || decision.isPending}
                      >
                        <Text style={styles.rejectConfirmText}>
                          {decision.isPending ? 'Rejecting…' : 'Confirm rejection'}
                        </Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity style={styles.rejectButton} onPress={() => setRejectMode(true)}>
                        <Ionicons name="close-circle-outline" size={18} color={colors.error} />
                        <Text style={styles.rejectButtonText}>Reject</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.approveButton,
                          (selected.documents.length === 0 ||
                            verifiedDocumentIds.length !== selected.documents.length ||
                            decision.isPending) &&
                            styles.buttonDisabled,
                        ]}
                        onPress={approveSelected}
                        disabled={
                          selected.documents.length === 0 ||
                          verifiedDocumentIds.length !== selected.documents.length ||
                          decision.isPending
                        }
                      >
                        <Ionicons name="checkmark-circle" size={19} color={colors.textPrimary} />
                        <Text style={styles.approveButtonText}>
                          {decision.isPending ? 'Approving…' : 'Approve listing'}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
  styles,
}: {
  label: string;
  value: number;
  icon: IoniconsName;
  accent: string;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: `${accent}16` }]}>
        <Ionicons name={icon} size={19} color={accent} />
      </View>
      <View>
        <Text style={styles.statNumber}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

function ReviewCard({
  review,
  isWide,
  colors,
  styles,
  onPress,
}: {
  review: AdminListingReview;
  isWide: boolean;
  colors: ThemeColors;
  styles: ReturnType<typeof makeStyles>;
  onPress: () => void;
}) {
  const status = STATUS_CONFIG[review.status];
  const verifiedCount = review.documents.filter((document) => document.status === 'verified').length;

  return (
    <TouchableOpacity
      style={[styles.reviewCard, isWide && styles.reviewCardWide]}
      onPress={onPress}
      activeOpacity={0.84}
    >
      <Image source={{ uri: review.thumbnail }} style={[styles.reviewImage, isWide && styles.reviewImageWide]} />
      <View style={styles.reviewCopy}>
        <View style={styles.reviewTopRow}>
          <View style={[styles.statusPill, { backgroundColor: `${status.color}14` }]}>
            <Ionicons name={status.icon} size={13} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
          <Text style={styles.submittedText}>{formatDate(review.submittedAt)}</Text>
        </View>
        <Text style={styles.reviewTitle} numberOfLines={2}>{review.title}</Text>
        <Text style={styles.reviewLocation}>{review.location}</Text>
        <Text style={styles.reviewPrice}>{formatFullPrice(review.price)}</Text>
        <View style={styles.reviewDivider} />
        <View style={styles.reviewBottomRow}>
          <View style={styles.listerInfo}>
            <View style={styles.listerAvatar}>
              <Text style={styles.listerInitial}>{review.listerName.charAt(0)}</Text>
            </View>
            <View>
              <Text style={styles.listerName}>{review.listerName}</Text>
              <Text style={styles.listerRole}>{review.listerRole === 'agent' ? 'Agent' : 'Landowner'}</Text>
            </View>
          </View>
          <View style={styles.documentCount}>
            <Ionicons name="documents-outline" size={15} color={colors.primary} />
            <Text style={styles.documentCountText}>
              {verifiedCount}/{review.documents.length} verified
            </Text>
          </View>
        </View>
        {review.flags.length > 0 && (
          <View style={styles.flagChip}>
            <Ionicons name="warning-outline" size={13} color={colors.warning} />
            <Text style={styles.flagChipText}>
              {review.flags.length} review {review.flags.length === 1 ? 'flag' : 'flags'}
            </Text>
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
    </TouchableOpacity>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.surface },
    scroll: { flex: 1 },
    header: { backgroundColor: colors.primaryDark, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
    headerInner: {
      width: '100%', maxWidth: 980, alignSelf: 'center',
      flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md,
    },
    backButton: {
      width: 38, height: 38, borderRadius: 19,
      backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center',
    },
    headerCopy: { flex: 1 },
    headerEyebrow: { fontSize: 10, color: colors.lime, fontWeight: '800', letterSpacing: 1.2, marginBottom: 4 },
    headerTitle: {
      fontSize: FontSize.xxl, color: '#FFFFFF', fontFamily: FontFamily.extraBold,
      fontWeight: '800', letterSpacing: LetterSpacing.tight,
    },
    headerSubtitle: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.65)', marginTop: 4, lineHeight: 19 },
    demoPill: {
      paddingHorizontal: 9, paddingVertical: 5, borderRadius: BorderRadius.full,
      backgroundColor: colors.lime,
    },
    demoPillText: { fontSize: 9, color: colors.textPrimary, fontWeight: '900', letterSpacing: 0.8 },
    content: { width: '100%', maxWidth: 980, alignSelf: 'center', padding: Spacing.lg },
    statGrid: { flexDirection: 'row', gap: Spacing.sm, marginTop: -34, marginBottom: Spacing.lg },
    statCard: {
      flex: 1, minWidth: 0, backgroundColor: colors.white, borderRadius: BorderRadius.xl,
      padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
      borderWidth: 1, borderColor: colors.borderLight, ...Shadow.sm,
    },
    statIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    statNumber: {
      fontSize: FontSize.xl, fontFamily: FontFamily.extraBold, fontWeight: '800',
      color: colors.textPrimary, lineHeight: 22,
    },
    statLabel: { fontSize: 9, color: colors.textSecondary, fontWeight: '700' },
    toolbar: {
      backgroundColor: colors.white, borderRadius: BorderRadius.xl, padding: Spacing.md,
      borderWidth: 1, borderColor: colors.borderLight, marginBottom: Spacing.lg, gap: Spacing.md,
    },
    searchBox: {
      height: 46, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: colors.border,
      backgroundColor: colors.background, flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: Spacing.md, gap: Spacing.sm,
    },
    searchInput: { flex: 1, fontSize: FontSize.md, color: colors.textPrimary },
    filterRow: { gap: Spacing.sm },
    filterButton: {
      flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12,
      paddingVertical: 8, borderRadius: BorderRadius.full, backgroundColor: colors.surface,
    },
    filterButtonActive: { backgroundColor: colors.primaryDark },
    filterText: { fontSize: FontSize.sm, color: colors.textSecondary, fontWeight: '700' },
    filterTextActive: { color: '#FFFFFF' },
    filterCount: {
      minWidth: 20, height: 20, paddingHorizontal: 5, borderRadius: 10,
      alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white,
    },
    filterCountActive: { backgroundColor: colors.lime },
    filterCountText: { fontSize: 10, color: colors.textSecondary, fontWeight: '800' },
    filterCountTextActive: { color: colors.textPrimary },
    reviewList: { gap: Spacing.md },
    reviewCard: {
      backgroundColor: colors.white, borderRadius: BorderRadius.xl, padding: Spacing.md,
      borderWidth: 1, borderColor: colors.borderLight, flexDirection: 'row',
      alignItems: 'center', gap: Spacing.md, ...Shadow.xs,
    },
    reviewCardWide: { padding: Spacing.lg },
    reviewImage: { width: 86, height: 108, borderRadius: BorderRadius.lg, backgroundColor: colors.surface },
    reviewImageWide: { width: 132, height: 132 },
    reviewCopy: { flex: 1, minWidth: 0 },
    reviewTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
    statusPill: {
      flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8,
      paddingVertical: 4, borderRadius: BorderRadius.full,
    },
    statusText: { fontSize: 10, fontWeight: '800' },
    submittedText: { fontSize: 10, color: colors.textTertiary },
    reviewTitle: {
      fontSize: FontSize.lg, color: colors.textPrimary, fontFamily: FontFamily.bold,
      fontWeight: '700', marginTop: Spacing.sm, letterSpacing: LetterSpacing.snug,
    },
    reviewLocation: { fontSize: FontSize.xs, color: colors.textSecondary, marginTop: 3 },
    reviewPrice: { fontSize: FontSize.md, color: colors.textPrimary, fontWeight: '800', marginTop: 5 },
    reviewDivider: { height: 1, backgroundColor: colors.borderLight, marginVertical: Spacing.sm },
    reviewBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
    listerInfo: { flexDirection: 'row', alignItems: 'center', gap: 7, flex: 1 },
    listerAvatar: {
      width: 28, height: 28, borderRadius: 14, backgroundColor: `${colors.primary}18`,
      alignItems: 'center', justifyContent: 'center',
    },
    listerInitial: { fontSize: 11, fontWeight: '800', color: colors.primary },
    listerName: { fontSize: 11, fontWeight: '700', color: colors.textPrimary },
    listerRole: { fontSize: 9, color: colors.textTertiary, textTransform: 'capitalize' },
    documentCount: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    documentCountText: { fontSize: 10, color: colors.textSecondary, fontWeight: '600' },
    flagChip: {
      alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4,
      backgroundColor: `${colors.warning}12`, paddingHorizontal: 8, paddingVertical: 4,
      borderRadius: BorderRadius.full, marginTop: Spacing.sm,
    },
    flagChipText: { fontSize: 9, color: colors.warning, fontWeight: '800' },
    stateCard: {
      minHeight: 220, backgroundColor: colors.white, borderRadius: BorderRadius.xl,
      alignItems: 'center', justifyContent: 'center', padding: Spacing.xxl, gap: Spacing.sm,
      borderWidth: 1, borderColor: colors.borderLight,
    },
    stateTitle: { fontSize: FontSize.lg, fontWeight: '800', color: colors.textPrimary },
    stateText: { fontSize: FontSize.sm, color: colors.textSecondary, textAlign: 'center' },
    secondaryButton: {
      paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full,
      borderWidth: 1, borderColor: colors.primary, marginTop: Spacing.sm,
    },
    secondaryButtonText: { color: colors.primary, fontWeight: '700', fontSize: FontSize.sm },
    accessRoot: {
      flex: 1, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
      padding: Spacing.xl,
    },
    accessCard: {
      width: '100%', maxWidth: 440, backgroundColor: colors.white, borderRadius: BorderRadius.xxl,
      padding: Spacing.xxxl, alignItems: 'center', borderWidth: 1, borderColor: colors.borderLight,
    },
    accessIcon: {
      width: 62, height: 62, borderRadius: 20, backgroundColor: `${colors.primary}14`,
      alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg,
    },
    accessTitle: { fontSize: FontSize.xl, fontWeight: '800', color: colors.textPrimary },
    accessText: {
      fontSize: FontSize.md, color: colors.textSecondary, lineHeight: 22,
      textAlign: 'center', marginTop: Spacing.sm, marginBottom: Spacing.xl,
    },
    primaryButton: {
      width: '100%', height: 50, borderRadius: BorderRadius.xl, backgroundColor: colors.lime,
      alignItems: 'center', justifyContent: 'center',
    },
    primaryButtonText: { fontSize: FontSize.md, fontWeight: '800', color: colors.textPrimary },
    modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
    reviewSheet: {
      width: '100%', maxHeight: '94%', backgroundColor: colors.white,
      borderTopLeftRadius: BorderRadius.xxl, borderTopRightRadius: BorderRadius.xxl,
      overflow: 'hidden',
    },
    reviewSheetWide: {
      width: '86%', maxWidth: 820, alignSelf: 'center',
      borderTopLeftRadius: BorderRadius.xxl, borderTopRightRadius: BorderRadius.xxl,
    },
    sheetHandle: {
      width: 42, height: 4, borderRadius: 2, backgroundColor: colors.border,
      alignSelf: 'center', marginTop: Spacing.sm,
    },
    sheetHeader: {
      flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md,
      paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.md,
      borderBottomWidth: 1, borderBottomColor: colors.borderLight,
    },
    sheetEyebrow: { fontSize: 9, color: colors.primary, fontWeight: '900', letterSpacing: 1 },
    sheetTitle: {
      fontSize: FontSize.xl, color: colors.textPrimary, fontFamily: FontFamily.bold,
      fontWeight: '700', marginTop: 3,
    },
    closeButton: {
      width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface,
      alignItems: 'center', justifyContent: 'center',
    },
    sheetContent: { padding: Spacing.xl, paddingBottom: Spacing.xxl },
    listingSummary: {
      flexDirection: 'row', gap: Spacing.md, padding: Spacing.md,
      backgroundColor: colors.surface, borderRadius: BorderRadius.xl,
    },
    summaryImage: { width: 86, height: 76, borderRadius: BorderRadius.lg },
    summaryCopy: { flex: 1, justifyContent: 'center', gap: 3 },
    summaryPrice: { fontSize: FontSize.lg, color: colors.textPrimary, fontWeight: '800' },
    summaryMeta: { fontSize: FontSize.xs, color: colors.textSecondary },
    flagPanel: {
      padding: Spacing.md, backgroundColor: `${colors.warning}0F`,
      borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: `${colors.warning}30`,
      marginTop: Spacing.md,
    },
    flagHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
    flagTitle: { fontSize: FontSize.sm, color: colors.warning, fontWeight: '800' },
    flagText: { fontSize: FontSize.xs, color: colors.textSecondary, lineHeight: 18 },
    documentHeadingRow: {
      flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
      marginTop: Spacing.xl, marginBottom: Spacing.md,
    },
    documentHeading: { fontSize: FontSize.lg, color: colors.textPrimary, fontWeight: '800' },
    documentSubheading: { fontSize: FontSize.xs, color: colors.textSecondary, marginTop: 3 },
    documentProgress: { fontSize: FontSize.md, color: colors.primary, fontWeight: '900' },
    documentList: { gap: Spacing.sm },
    documentCard: {
      flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md,
      borderWidth: 1, borderColor: colors.border, borderRadius: BorderRadius.xl,
      backgroundColor: colors.white,
    },
    documentCardVerified: { borderColor: `${colors.success}60`, backgroundColor: `${colors.success}08` },
    documentIcon: {
      width: 42, height: 42, borderRadius: 13, backgroundColor: `${colors.primary}12`,
      alignItems: 'center', justifyContent: 'center',
    },
    documentIconVerified: { backgroundColor: `${colors.success}14` },
    documentCopy: { flex: 1, minWidth: 0 },
    documentType: { fontSize: FontSize.sm, color: colors.textPrimary, fontWeight: '800' },
    documentFile: { fontSize: FontSize.xs, color: colors.textSecondary, marginTop: 2 },
    documentMeta: { fontSize: 9, color: colors.textTertiary, marginTop: 3 },
    documentReference: { fontSize: 9, color: colors.primary, fontWeight: '700', marginTop: 2 },
    documentActions: { gap: 6, alignItems: 'stretch' },
    viewDocumentButton: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
      paddingHorizontal: 9, paddingVertical: 6, borderRadius: BorderRadius.md,
      borderWidth: 1, borderColor: colors.border,
    },
    viewDocumentText: { fontSize: 10, color: colors.primary, fontWeight: '700' },
    verifyButton: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
      paddingHorizontal: 9, paddingVertical: 7, borderRadius: BorderRadius.md,
      backgroundColor: colors.surface,
    },
    verifyButtonActive: { backgroundColor: colors.success },
    verifyText: { fontSize: 10, color: colors.textSecondary, fontWeight: '800' },
    verifyTextActive: { color: '#FFFFFF' },
    rejectionPanel: {
      marginTop: Spacing.lg, padding: Spacing.md, borderRadius: BorderRadius.xl,
      backgroundColor: `${colors.error}08`, borderWidth: 1, borderColor: `${colors.error}30`,
    },
    rejectionLabel: { fontSize: FontSize.sm, color: colors.error, fontWeight: '800', marginBottom: Spacing.sm },
    rejectionInput: {
      minHeight: 92, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: colors.border,
      backgroundColor: colors.white, padding: Spacing.md, fontSize: FontSize.md, color: colors.textPrimary,
    },
    sheetFooter: {
      flexDirection: 'row', gap: Spacing.md, paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: colors.borderLight,
      backgroundColor: colors.white,
    },
    rejectButton: {
      flex: 1, height: 50, borderRadius: BorderRadius.xl, borderWidth: 1.5,
      borderColor: `${colors.error}60`, flexDirection: 'row', alignItems: 'center',
      justifyContent: 'center', gap: 6,
    },
    rejectButtonText: { fontSize: FontSize.md, color: colors.error, fontWeight: '800' },
    approveButton: {
      flex: 2, height: 50, borderRadius: BorderRadius.xl, backgroundColor: colors.lime,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    },
    approveButtonText: { fontSize: FontSize.md, color: colors.textPrimary, fontWeight: '800' },
    cancelButton: {
      flex: 1, height: 50, borderRadius: BorderRadius.xl, borderWidth: 1,
      borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
    },
    cancelButtonText: { fontSize: FontSize.md, color: colors.textSecondary, fontWeight: '700' },
    rejectConfirmButton: {
      flex: 2, height: 50, borderRadius: BorderRadius.xl, backgroundColor: colors.error,
      alignItems: 'center', justifyContent: 'center',
    },
    rejectConfirmText: { fontSize: FontSize.md, color: '#FFFFFF', fontWeight: '800' },
    buttonDisabled: { opacity: 0.45 },
  });
}
