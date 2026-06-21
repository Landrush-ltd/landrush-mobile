import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Modal,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../src/constants/theme';
import { mockListings } from '../../src/services/mockData';

const { width } = Dimensions.get('window');

export default function ListingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [showPaywall, setShowPaywall] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const listing = mockListings.find((l) => l.id === id);

  if (!listing) {
    return (
      <View style={styles.notFound}>
        <Text>Listing not found</Text>
      </View>
    );
  }

  const handleBookInspection = () => {
    setShowPaywall(true);
  };

  const handlePayAccess = () => {
    setShowPaywall(false);
    setShowSchedule(true);
  };

  const handleScheduleDone = () => {
    setShowSchedule(false);
    Alert.alert(
      'Inspection Request Sent',
      "Your preferred date and time have been sent to the lister. You'll be notified once it's confirmed.",
      [{ text: 'Go to Home', onPress: () => router.replace('/(tabs)') }],
    );
  };

  const tags = [
    listing.category === 'lease' ? 'Lease' : listing.category === 'sale' ? 'Sale' : 'Distress',
    `${listing.size} ${listing.sizeUnit}`,
    'Agricultural Land',
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: listing.media[0]?.uri }}
            style={styles.heroImage}
          />
          <View style={[styles.headerOverlay, { paddingTop: insets.top + Spacing.sm }]}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="share-outline" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          <TouchableOpacity
            style={[styles.saveButton, isSaved && styles.saveButtonActive]}
            onPress={() => setIsSaved(!isSaved)}
          >
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={16}
              color={isSaved ? Colors.primary : Colors.textSecondary}
            />
            <Text style={[styles.saveText, isSaved && styles.saveTextActive]}>
              {isSaved ? 'Saved' : 'Save'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.listingTitle}>{listing.title}</Text>
          <Text style={styles.listingPrice}>
            {'\u20A6'}{listing.price.toLocaleString()}
          </Text>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.locationText}>{listing.location}</Text>
          </View>

          <View style={styles.tagsRow}>
            {tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          {listing.agent.isVerified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>Document Verified</Text>
              <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
            </View>
          )}

          <Text style={styles.description}>{listing.description}</Text>

          {listing.media.length > 1 && (
            <>
              <Text style={styles.sectionTitle}>
                Photos & Videos ({listing.media.length})
              </Text>
              <FlatList
                data={listing.media}
                renderItem={({ item }) => (
                  <Image source={{ uri: item.uri }} style={styles.thumbnailImage} />
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbnailList}
              />
            </>
          )}

          <Text style={styles.sectionTitle}>Other Details</Text>
          <View style={styles.agentCard}>
            <Image
              source={{ uri: listing.agent.avatar }}
              style={styles.agentAvatar}
            />
            <View style={styles.agentInfo}>
              <View style={styles.agentNameRow}>
                <Text style={styles.agentName}>{listing.agent.name}</Text>
                {listing.agent.isVerified && (
                  <Ionicons name="checkmark-circle" size={16} color={Colors.info} />
                )}
              </View>
              <Text style={styles.agentRole}>
                Landowner || Member since June 2026
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.viewContactButton}>
            <Text style={styles.viewContactText}>View Contact</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing.md }]}>
        <TouchableOpacity
          style={styles.bookInspectionButton}
          onPress={handleBookInspection}
        >
          <Text style={styles.bookInspectionText}>Book Inspection</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showPaywall} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.paywallModal}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowPaywall(false)}
            >
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>

            <View style={styles.paywallIcon}>
              <Ionicons name="lock-open-outline" size={48} color={Colors.primary} />
            </View>

            <Text style={styles.paywallTitle}>Unlock inspection access</Text>
            <Text style={styles.paywallDescription}>
              A one-time access fee gives you access to inspection bookings and
              helps maintain a trusted marketplace for serious participants.
            </Text>

            <View style={styles.paywallFeatures}>
              <View style={styles.paywallFeatureRow}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                <Text style={styles.paywallFeatureText}>Book inspections</Text>
              </View>
              <View style={styles.paywallFeatureRow}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                <Text style={styles.paywallFeatureText}>
                  Connect with agents and landowners
                </Text>
              </View>
              <View style={styles.paywallFeatureRow}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                <Text style={styles.paywallFeatureText}>
                  Access future inspection requests
                </Text>
              </View>
            </View>

            <View style={styles.feeContainer}>
              <Text style={styles.feeLabel}>Fee</Text>
              <View style={styles.feeRight}>
                <Text style={styles.feeTag}>One-time payment</Text>
              </View>
            </View>
            <Text style={styles.feeAmount}>{'\u20A6'}5000</Text>

            <TouchableOpacity
              style={styles.payButton}
              onPress={handlePayAccess}
            >
              <Text style={styles.payButtonText}>Pay Access Fee</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showSchedule} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.scheduleModal}>
            <View style={styles.scheduleHeader}>
              <TouchableOpacity onPress={() => setShowSchedule(false)}>
                <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.scheduleTitle}>Schedule Inspection</Text>
              <View style={{ width: 24 }} />
            </View>

            <Text style={styles.scheduleSubtitle}>
              Choose a preferred date and time for your inspection request
            </Text>

            <Text style={styles.scheduleLabel}>Choose Date</Text>
            <View style={styles.calendarPlaceholder}>
              <Ionicons name="calendar-outline" size={48} color={Colors.textTertiary} />
              <Text style={styles.placeholderText}>Calendar will appear here</Text>
            </View>

            <Text style={styles.scheduleLabel}>Choose Time</Text>
            <View style={styles.timePlaceholder}>
              <Text style={styles.timeText}>09 : 00 AM</Text>
            </View>

            <Text style={styles.scheduleLabel}>Additional Notes (Optional)</Text>
            <View style={styles.notesInput}>
              <Text style={styles.notesPlaceholder}>Write here</Text>
            </View>

            <TouchableOpacity
              style={styles.doneButton}
              onPress={handleScheduleDone}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    height: 280,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: 100,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  saveButtonActive: {
    backgroundColor: `${Colors.lime}25`,
    borderColor: Colors.primary,
  },
  saveText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  saveTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  listingTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  listingPrice: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  locationText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  tagText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
    alignSelf: 'flex-start',
    marginBottom: Spacing.lg,
  },
  verifiedText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
  description: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  thumbnailList: {
    gap: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  thumbnailImage: {
    width: 100,
    height: 80,
    borderRadius: BorderRadius.md,
  },
  agentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  agentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  agentInfo: {
    flex: 1,
  },
  agentNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  agentName: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  agentRole: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  viewContactButton: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  viewContactText: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  bookInspectionButton: {
    backgroundColor: Colors.lime,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  bookInspectionText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  paywallModal: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    padding: Spacing.xxl,
    paddingBottom: 40,
  },
  modalClose: {
    alignSelf: 'flex-end',
    padding: Spacing.sm,
  },
  paywallIcon: {
    alignSelf: 'center',
    marginBottom: Spacing.xl,
  },
  paywallTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  paywallDescription: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xxl,
  },
  paywallFeatures: {
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  paywallFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  paywallFeatureText: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  feeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  feeLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  feeRight: {},
  feeTag: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: '600',
    backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  feeAmount: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.xxl,
  },
  payButton: {
    backgroundColor: Colors.lime,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  payButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  scheduleModal: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    padding: Spacing.xxl,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  scheduleTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  scheduleSubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxl,
  },
  scheduleLabel: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  calendarPlaceholder: {
    height: 200,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  placeholderText: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
  },
  timePlaceholder: {
    height: 60,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },
  timeText: {
    fontSize: FontSize.xxl,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  notesInput: {
    height: 80,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
  notesPlaceholder: {
    fontSize: FontSize.md,
    color: Colors.textTertiary,
  },
  doneButton: {
    backgroundColor: Colors.lime,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
