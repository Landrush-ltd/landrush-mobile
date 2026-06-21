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
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

const DAY_SHORT  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const UPCOMING_DATES = Array.from({ length: 14 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i + 1);
  return {
    key:      d.toISOString().slice(0, 10),
    dayLabel: i === 0 ? 'Tomorrow' : DAY_SHORT[d.getDay()],
    dayNum:   d.getDate(),
    month:    MONTH_SHORT[d.getMonth()],
  };
});

const MORNING_SLOTS   = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM'];
const AFTERNOON_SLOTS = ['12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];
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
  const [showSchedule, setShowSchedule] = useState(false);
  const [isSaved, setIsSaved]           = useState(false);
  const [selectedDate, setSelDate]      = useState('');
  const [selectedTime, setSelTime]      = useState('');
  const [notes, setNotes]               = useState('');

  const listing = mockListings.find((l) => l.id === id);

  if (!listing) {
    return (
      <View style={styles.notFound}>
        <Text>Listing not found</Text>
      </View>
    );
  }

  const handleBookInspection = () => {
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

          <Text style={styles.sectionTitle}>Listed By</Text>
          <View style={styles.agentCard}>
            <Image
              source={{ uri: listing.agent.avatar }}
              style={styles.agentAvatar}
            />
            <View style={styles.agentInfo}>
              <View style={styles.agentNameRow}>
                <Text style={styles.agentName}>{listing.agent.name}</Text>
                {listing.agent.isVerified && (
                  <Ionicons name="checkmark-circle" size={15} color={Colors.primary} />
                )}
              </View>
              <Text style={styles.agentRole}>Landowner · Member since 2024</Text>
              <View style={styles.agentRatingRow}>
                <Ionicons name="star" size={12} color="#F9A825" />
                <Text style={styles.agentRatingText}>{listing.agent.rating.toFixed(1)}</Text>
                <Text style={styles.agentRatingCount}>(42 reviews)</Text>
              </View>
            </View>
          </View>

          <View style={styles.contactRow}>
            <TouchableOpacity style={styles.contactBtn}>
              <Ionicons name="call-outline" size={18} color={Colors.primary} />
              <Text style={styles.contactBtnText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.contactBtn, styles.contactBtnPrimary]}
              onPress={() =>
                router.push({
                  pathname: '/chat/[conversationId]',
                  params: { conversationId: 'conv-1' },
                })
              }
            >
              <Ionicons name="chatbubble-outline" size={18} color={Colors.white} />
              <Text style={[styles.contactBtnText, { color: Colors.white }]}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing.md }]}>
        <TouchableOpacity
          style={[styles.saveButtonBottom, isSaved && styles.saveButtonBottomActive]}
          onPress={() => setIsSaved(!isSaved)}
        >
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={isSaved ? Colors.primary : Colors.textSecondary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bookInspectionButton}
          onPress={handleBookInspection}
        >
          <Text style={styles.bookInspectionText}>Book Inspection</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showSchedule} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView style={styles.scheduleModal} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.scheduleHeader}>
              <TouchableOpacity onPress={() => setShowSchedule(false)}>
                <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.scheduleTitle}>Schedule Inspection</Text>
              <View style={{ width: 24 }} />
            </View>
            <Text style={styles.scheduleSubtitle}>
              Pick a preferred date and time — the agent will confirm or suggest an alternative.
            </Text>

            {/* Date strip */}
            <Text style={styles.scheduleLabel}>Choose Date</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dateStrip}
            >
              {UPCOMING_DATES.map((d) => {
                const active = selectedDate === d.key;
                return (
                  <TouchableOpacity
                    key={d.key}
                    style={[styles.dateCell, active && styles.dateCellActive]}
                    onPress={() => setSelDate(d.key)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.dateDayLabel, active && styles.dateLabelActive]}>
                      {d.dayLabel}
                    </Text>
                    <Text style={[styles.dateDayNum, active && styles.dateLabelActive]}>
                      {d.dayNum}
                    </Text>
                    <Text style={[styles.dateMonth, active && styles.dateLabelActive]}>
                      {d.month}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Time slots */}
            <Text style={[styles.scheduleLabel, { marginTop: Spacing.xl }]}>Choose Time</Text>
            <Text style={styles.timeGroupLabel}>Morning</Text>
            <View style={styles.timeSlotRow}>
              {MORNING_SLOTS.map((t) => {
                const active = selectedTime === t;
                return (
                  <TouchableOpacity
                    key={t}
                    style={[styles.timeSlot, active && styles.timeSlotActive]}
                    onPress={() => setSelTime(t)}
                  >
                    <Text style={[styles.timeSlotText, active && styles.timeSlotTextActive]}>{t}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.timeGroupLabel}>Afternoon</Text>
            <View style={styles.timeSlotRow}>
              {AFTERNOON_SLOTS.map((t) => {
                const active = selectedTime === t;
                return (
                  <TouchableOpacity
                    key={t}
                    style={[styles.timeSlot, active && styles.timeSlotActive]}
                    onPress={() => setSelTime(t)}
                  >
                    <Text style={[styles.timeSlotText, active && styles.timeSlotTextActive]}>{t}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Notes */}
            <Text style={[styles.scheduleLabel, { marginTop: Spacing.xl }]}>
              Notes{' '}
              <Text style={{ fontWeight: '400', color: Colors.textTertiary }}>(Optional)</Text>
            </Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Access instructions, questions for the agent…"
              placeholderTextColor={Colors.textTertiary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[
                styles.doneButton,
                (!selectedDate || !selectedTime) && styles.doneButtonDisabled,
              ]}
              onPress={handleScheduleDone}
              disabled={!selectedDate || !selectedTime}
            >
              <Ionicons name="calendar-outline" size={18} color={Colors.textPrimary} />
              <Text style={styles.doneButtonText}>
                {selectedDate && selectedTime
                  ? `Request ${selectedTime} · ${selectedDate.slice(5)}`
                  : 'Select a date and time to continue'}
              </Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
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
  agentRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
  },
  agentRatingText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  agentRatingCount: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
  },
  contactRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 46,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.background,
  },
  contactBtnPrimary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  contactBtnText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.primary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  saveButtonBottom: {
    width: 48,
    height: 52,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  saveButtonBottomActive: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.lime}20`,
  },
  bookInspectionButton: {
    flex: 1,
    backgroundColor: Colors.lime,
    height: 52,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
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
  // Date strip
  dateStrip: {
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  dateCell: {
    width: 64,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    gap: 2,
  },
  dateCellActive: {
    backgroundColor: Colors.lime,
    borderColor: Colors.lime,
  },
  dateDayLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  dateDayNum: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  dateMonth: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  dateLabelActive: {
    color: Colors.textPrimary,
  },
  // Time slots
  timeGroupLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  timeSlotRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  timeSlot: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  timeSlotActive: {
    backgroundColor: Colors.lime,
    borderColor: Colors.lime,
  },
  timeSlotText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  timeSlotTextActive: {
    color: Colors.textPrimary,
  },
  // Notes input
  notesInput: {
    height: 88,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.lime,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  doneButtonDisabled: {
    opacity: 0.45,
  },
  doneButtonText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
