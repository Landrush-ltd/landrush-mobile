import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../src/constants/theme';
import { mockListings } from '../src/services/mockData';


type ListingStatus = 'live' | 'pending' | 'rejected' | 'draft';

interface MyListing {
  id: string;
  title: string;
  image: string;
  location: string;
  price: number;
  size: string;
  status: ListingStatus;
}

const STATUS_CONFIG: Record<ListingStatus, { label: string; color: string; bg: string }> = {
  live:     { label: 'Live',    color: Colors.success, bg: '#E8F5E9' },
  pending:  { label: 'Pending', color: '#E65100',      bg: '#FFF3E0' },
  rejected: { label: 'Rejected', color: Colors.error,  bg: '#FFEBEE' },
  draft:    { label: 'Draft',   color: Colors.textTertiary, bg: Colors.chipInactive },
};

const myListings: MyListing[] = mockListings.slice(0, 4).map((l, i) => ({
  id: l.id,
  title: l.title,
  image: l.media[0]?.uri ?? '',
  location: l.location,
  price: l.price,
  size: `${l.size} ${l.sizeUnit}`,
  status: (['live', 'pending', 'live', 'draft'] as ListingStatus[])[i],
}));

export default function MyListingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [listings, setListings] = useState<MyListing[]>(myListings);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setListings((prev) => prev.filter((l) => l.id !== deleteTarget));
    setDeleteTarget(null);
  };

  return (
    <View style={styles.container}>
      {/* Dark header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={styles.headerDecoA} />
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.title}>My Listings</Text>
            <Text style={styles.subtitle}>{listings.length} listing{listings.length !== 1 ? 's' : ''}</Text>
          </View>
          <TouchableOpacity style={styles.addIconBtn} onPress={() => router.push('/(tabs)/create')}>
            <Ionicons name="add" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {listings.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="home-outline" size={44} color={Colors.textTertiary} />
          </View>
          <Text style={styles.emptyTitle}>No Listings Yet</Text>
          <Text style={styles.emptySubtitle}>
            Your published listings will appear here. Start by adding your first listing.
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/(tabs)/create')}
          >
            <Ionicons name="add" size={18} color={Colors.textPrimary} />
            <Text style={styles.addButtonText}>Add Listing</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {listings.map((item) => {
            const status = STATUS_CONFIG[item.status];
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => router.push(`/listing/${item.id}`)}
              >
                <Image source={{ uri: item.image }} style={styles.cardImage} />
                <View style={styles.cardBody}>
                  <View style={styles.cardTop}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                      <Text style={[styles.statusText, { color: status.color }]}>
                        {status.label}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={13} color={Colors.textTertiary} />
                    <Text style={styles.infoText} numberOfLines={1}>{item.location}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="expand-outline" size={13} color={Colors.textTertiary} />
                    <Text style={styles.infoText}>{item.size}</Text>
                  </View>
                  <Text style={styles.cardPrice}>
                    ₦{item.price.toLocaleString()}
                  </Text>
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => router.push(`/listing/${item.id}`)}
                    >
                      <Ionicons name="create-outline" size={15} color={Colors.primary} />
                      <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => setDeleteTarget(item.id)}
                    >
                      <Ionicons name="trash-outline" size={15} color={Colors.error} />
                      <Text style={styles.deleteBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={styles.addListingCard}
            onPress={() => router.push('/(tabs)/create')}
          >
            <Ionicons name="add-circle-outline" size={28} color={Colors.lime} />
            <Text style={styles.addListingText}>Add New Listing</Text>
          </TouchableOpacity>

          <View style={{ height: Spacing.xxxl }} />
        </ScrollView>
      )}

      {/* Delete confirmation modal */}
      <Modal visible={!!deleteTarget} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Delete Listing?</Text>
            <Text style={styles.modalSubtitle}>
              This will permanently remove the listing. This action cannot be undone.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setDeleteTarget(null)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalDelete} onPress={confirmDelete}>
                <Text style={styles.modalDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerDecoA: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'transparent',
    top: -60,
    right: -40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.white,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  list: {
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  cardImage: {
    width: 100,
    height: 120,
  },
  cardBody: {
    flex: 1,
    padding: Spacing.md,
    gap: 4,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: 2,
  },
  cardTitle: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    flexShrink: 0,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  infoText: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    flex: 1,
  },
  cardPrice: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  editBtnText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: '600',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  deleteBtnText: {
    fontSize: FontSize.xs,
    color: Colors.error,
    fontWeight: '600',
  },
  addListingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.xl,
    borderWidth: 1.5,
    borderColor: Colors.lime,
    borderStyle: 'dashed',
    marginTop: Spacing.sm,
  },
  addListingText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.primary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxxl,
    gap: Spacing.md,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.chipInactive,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.lime,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
  },
  addButtonText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xxl,
    width: '100%',
    gap: Spacing.lg,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  modalDelete: {
    flex: 1,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.error,
    alignItems: 'center',
  },
  modalDeleteText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.white,
  },
});
