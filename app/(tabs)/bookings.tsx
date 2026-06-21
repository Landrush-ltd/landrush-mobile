import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../src/constants/theme';

type BookingStatus = 'pending' | 'upcoming' | 'past' | 'rescheduled' | 'cancelled';
type FilterTab = 'pending' | 'upcoming' | 'past';

interface Booking {
  id: string;
  listingTitle: string;
  listingImage: string;
  location: string;
  price: string;
  date: string;
  time: string;
  status: BookingStatus;
  agentName: string;
}

const mockBookings: Booking[] = [
  {
    id: '1',
    listingTitle: '12 Acres of Farmland',
    listingImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400',
    location: 'Ikot Ekpene, Akwa Ibom',
    price: '₦4,500,000',
    date: 'Monday, 12 May',
    time: '10:00 AM – 11:30 AM',
    status: 'pending',
    agentName: 'Adewale Properties',
  },
  {
    id: '2',
    listingTitle: '5 Plots Industrial Zone',
    listingImage: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400',
    location: 'Ota, Ogun State',
    price: '₦2,800,000',
    date: 'Friday, 20 Jun',
    time: '2:00 PM – 3:30 PM',
    status: 'rescheduled',
    agentName: 'Gideon Etim',
  },
  {
    id: '3',
    listingTitle: '8 Plots Corner Piece',
    listingImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400',
    location: 'Lekki, Lagos',
    price: '₦7,200,000',
    date: 'Wed, 2 Jul',
    time: '9:00 AM – 10:00 AM',
    status: 'upcoming',
    agentName: 'Prime Realty',
  },
];

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
];

const STATUS_CHIP: Record<string, { label: string; color: string; bg: string }> = {
  pending:     { label: 'Pending Inspection', color: '#E65100', bg: '#FFF3E0' },
  upcoming:    { label: 'Awaiting response ✓', color: Colors.primary, bg: `${Colors.lime}20` },
  rescheduled: { label: 'Reschedule requests', color: Colors.textSecondary, bg: Colors.border },
  past:        { label: 'Completed', color: Colors.info, bg: '#E3F2FD' },
  cancelled:   { label: 'Cancelled', color: Colors.error, bg: '#FFEBEE' },
};

export default function BookingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<FilterTab>('pending');

  const filtered = mockBookings.filter((b) => {
    if (activeTab === 'pending') return b.status === 'pending' || b.status === 'rescheduled';
    if (activeTab === 'upcoming') return b.status === 'upcoming';
    return b.status === 'past' || b.status === 'cancelled';
  });

  const handleAccept = (id: string) =>
    Alert.alert('Booking Accepted', 'The inspection has been confirmed.');

  const handleReschedule = (id: string) =>
    Alert.alert('Reschedule', 'Reschedule flow coming soon.');

  const handleCancel = (id: string) =>
    Alert.alert('Cancel Booking Inspection?', 'This action cannot be undone.', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: () => {} },
    ]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Bookings</Text>
        <TouchableOpacity style={styles.avatarButton}>
          <Ionicons name="person-circle-outline" size={36} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.filterTab, activeTab === tab.key && styles.filterTabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[styles.filterTabText, activeTab === tab.key && styles.filterTabTextActive]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="calendar-outline" size={48} color={Colors.textTertiary} />
            </View>
            <Text style={styles.emptyTitle}>No {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Bookings</Text>
            <Text style={styles.emptySubtitle}>
              Your {activeTab} inspection bookings will appear here
            </Text>
            <TouchableOpacity style={styles.discoverButton} onPress={() => router.push('/(tabs)')}>
              <Text style={styles.discoverButtonText}>Discover Listings</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filtered.map((booking) => {
            const chip = STATUS_CHIP[booking.status] ?? STATUS_CHIP.pending;
            return (
              <TouchableOpacity key={booking.id} style={styles.card} activeOpacity={0.9}>
                {/* Card body: image + info */}
                <View style={styles.cardBody}>
                  <Image source={{ uri: booking.listingImage }} style={styles.cardImage} />
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {booking.listingTitle}
                    </Text>
                    <View style={styles.infoRow}>
                      <Ionicons name="location-outline" size={13} color={Colors.textTertiary} />
                      <Text style={styles.infoText}>{booking.location}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Ionicons name="calendar-outline" size={13} color={Colors.textTertiary} />
                      <Text style={styles.infoText}>{booking.date}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Ionicons name="time-outline" size={13} color={Colors.textTertiary} />
                      <Text style={styles.infoText}>{booking.time}</Text>
                    </View>
                  </View>
                </View>

                {/* Status chip */}
                <View style={[styles.statusChip, { backgroundColor: chip.bg, borderColor: chip.color }]}>
                  <Text style={[styles.statusChipText, { color: chip.color }]}>{chip.label}</Text>
                </View>

                {/* Action buttons — only on pending/rescheduled */}
                {(booking.status === 'pending' || booking.status === 'rescheduled') && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.acceptButton}
                      onPress={() => handleAccept(booking.id)}
                    >
                      <Text style={styles.acceptButtonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.recommendButton}
                      onPress={() => handleReschedule(booking.id)}
                    >
                      <Text style={styles.recommendButtonText}>Reschedule</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => handleCancel(booking.id)}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: Spacing.xxxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  filterTab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.chipInactive,
  },
  filterTabActive: {
    backgroundColor: Colors.lime,
  },
  filterTabText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  filterTabTextActive: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.md,
    ...Shadow.sm,
  },
  cardBody: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    flex: 1,
  },
  statusChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  statusChipText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  acceptButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.lime,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  recommendButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  recommendButtonText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.error,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.error,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.huge * 2,
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
    paddingHorizontal: Spacing.xxl,
  },
  discoverButton: {
    marginTop: Spacing.md,
    backgroundColor: Colors.lime,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.full,
  },
  discoverButtonText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
