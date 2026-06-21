import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../src/constants/theme';

interface Booking {
  id: string;
  listingTitle: string;
  listingImage: string;
  agentName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'rescheduled' | 'completed' | 'cancelled';
  location: string;
}

const mockBookings: Booking[] = [
  {
    id: '1',
    listingTitle: '12 Acres of Farmland',
    listingImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400',
    agentName: 'Adewale Properties',
    date: 'Monday, 12 May',
    time: '10:00 AM - 11:30 AM',
    status: 'confirmed',
    location: 'Ikot Ekpene, Akwa Ibom',
  },
  {
    id: '2',
    listingTitle: '5 Plots Industrial Zone',
    listingImage: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400',
    agentName: 'Gideon Etim',
    date: 'Friday, 20 Jun',
    time: '2:00 PM - 3:30 PM',
    status: 'rescheduled',
    location: 'Ota, Ogun State',
  },
];

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#FFF3E0', text: '#E65100' },
  confirmed: { bg: '#E8F5E9', text: '#2E7D32' },
  rescheduled: { bg: '#FFF8E1', text: '#F57F17' },
  completed: { bg: '#E3F2FD', text: '#1565C0' },
  cancelled: { bg: '#FFEBEE', text: '#C62828' },
};

export default function BookingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const upcomingBookings = mockBookings.filter(
    (b) => b.status !== 'completed' && b.status !== 'cancelled',
  );
  const pastBookings = mockBookings.filter(
    (b) => b.status === 'completed' || b.status === 'cancelled',
  );
  const bookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Bookings</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Upcoming inspections
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
            Past inspections
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {bookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Pending Bookings</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'upcoming'
                ? 'Your upcoming inspection bookings will appear here'
                : 'Your past inspections will appear here'}
            </Text>
          </View>
        ) : (
          bookings.map((booking) => {
            const statusStyle = statusColors[booking.status];
            return (
              <TouchableOpacity key={booking.id} style={styles.bookingCard}>
                <View style={styles.bookingHeader}>
                  <View style={styles.dateContainer}>
                    <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
                    <Text style={styles.dateText}>{booking.date}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.bookingBody}>
                  <Image source={{ uri: booking.listingImage }} style={styles.bookingImage} />
                  <View style={styles.bookingInfo}>
                    <Text style={styles.bookingTitle} numberOfLines={1}>
                      {booking.listingTitle}
                    </Text>
                    <Text style={styles.bookingAgent}>{booking.agentName}</Text>
                    <View style={styles.timeRow}>
                      <Ionicons name="time-outline" size={14} color={Colors.textTertiary} />
                      <Text style={styles.timeText}>{booking.time}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.bookingFooter}>
                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={14} color={Colors.textTertiary} />
                    <Text style={styles.locationText}>{booking.location}</Text>
                  </View>
                </View>
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
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.chipInactive,
  },
  activeTab: {
    backgroundColor: Colors.chipActive,
  },
  tabText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  bookingCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  dateText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  bookingBody: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  bookingImage: {
    width: 70,
    height: 70,
    borderRadius: BorderRadius.md,
  },
  bookingInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 3,
  },
  bookingTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  bookingAgent: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  timeText: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
  },
  bookingFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  locationText: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.huge * 2,
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xxl,
  },
});
