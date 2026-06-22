import React, { useState, useMemo } from 'react';
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

const DAY_SHORT   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
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
import { Spacing, FontSize, FontFamily, BorderRadius, Shadow, LetterSpacing } from '../../src/constants/theme';
import type { ThemeColors } from '../../src/constants/theme';
import { useColors } from '../../src/context/ThemeContext';
import { mockListings } from '../../src/services/mockData';

const { width } = Dimensions.get('window');
const HERO_HEIGHT = 340;

const CATEGORY_LABEL: Record<string, string> = {
  lease: 'For Lease', sale: 'For Sale', distress: 'Distress Sale',
};
const CATEGORY_COLOR: Record<string, string> = {
  lease: '#E88A2E', sale: '#2D6A4F', distress: '#C62828',
};

function formatPrice(p: number) {
  if (p >= 1_000_000_000) return `₦${(p / 1_000_000_000).toFixed(1)}B`;
  if (p >= 1_000_000)     return `₦${(p / 1_000_000).toFixed(1)}M`;
  return `₦${(p / 1_000).toFixed(0)}K`;
}

export default function ListingDetailScreen() {
  const router = useRouter();
  const { id }  = useLocalSearchParams<{ id: string }>();
  const insets  = useSafeAreaInsets();
  const colors  = useColors();
  const styles  = useMemo(() => makeStyles(colors), [colors]);

  const [showSchedule, setShowSchedule] = useState(false);
  const [isSaved, setIsSaved]           = useState(false);
  const [selectedDate, setSelDate]      = useState('');
  const [selectedTime, setSelTime]      = useState('');
  const [notes, setNotes]               = useState('');
  const [activePhoto, setActivePhoto]   = useState(0);

  const listing = mockListings.find((l) => l.id === id);

  if (!listing) {
    return (
      <View style={styles.notFound}>
        <Text style={{ color: colors.textPrimary }}>Listing not found</Text>
      </View>
    );
  }

  const catColor = CATEGORY_COLOR[listing.category] ?? colors.primary;
  const price    = formatPrice(listing.price);

  const handleScheduleDone = () => {
    setShowSchedule(false);
    Alert.alert(
      'Inspection Request Sent',
      "Your preferred date and time have been sent to the lister. You'll be notified once it's confirmed.",
      [{ text: 'Go to Home', onPress: () => router.replace('/(tabs)') }],
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces>
        {/* ── Hero ──────────────────────────────────────────────── */}
        <View style={styles.heroWrap}>
          {listing.media.length > 1 ? (
            <FlatList
              data={listing.media}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) =>
                setActivePhoto(Math.round(e.nativeEvent.contentOffset.x / width))
              }
              renderItem={({ item }) => (
                <Image source={{ uri: item.uri }} style={styles.heroImage} resizeMode="cover" />
              )}
              keyExtractor={(item) => item.id}
              style={{ width, height: HERO_HEIGHT }}
            />
          ) : (
            <Image
              source={{ uri: listing.media[0]?.uri }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          )}

          {/* Overlay nav */}
          <View style={[styles.heroNav, { paddingTop: insets.top + Spacing.md }]}>
            <TouchableOpacity style={styles.heroBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color="#1A1A1A" />
            </TouchableOpacity>
            <View style={styles.heroNavRight}>
              <TouchableOpacity style={styles.heroBtn}>
                <Ionicons name="share-outline" size={20} color="#1A1A1A" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.heroBtn, isSaved && styles.heroBtnSaved]}
                onPress={() => setIsSaved(!isSaved)}
              >
                <Ionicons
                  name={isSaved ? 'heart' : 'heart-outline'}
                  size={20}
                  color={isSaved ? '#FF385C' : '#1A1A1A'}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Category + location overlay bottom */}
          <View style={styles.heroBottom}>
            <View style={[styles.catPill, { backgroundColor: catColor }]}>
              <Text style={styles.catPillText}>{CATEGORY_LABEL[listing.category]}</Text>
            </View>
            {listing.media.length > 1 && (
              <View style={styles.dotRow}>
                {listing.media.map((_, i) => (
                  <View key={i} style={[styles.dot, i === activePhoto && styles.dotActive]} />
                ))}
              </View>
            )}
          </View>
        </View>

        {/* ── White card (overlaps hero) ─────────────────────── */}
        <View style={styles.card}>
          {/* Title + price */}
          <Text style={styles.title}>{listing.title}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{price}</Text>
            {listing.priceUnit && (
              <Text style={styles.priceUnit}> /{listing.priceUnit}</Text>
            )}
          </View>

          {/* Location + size */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={15} color={colors.textSecondary} />
              <Text style={styles.metaText}>{listing.location}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Ionicons name="expand-outline" size={15} color={colors.textSecondary} />
              <Text style={styles.metaText}>{listing.size} {listing.sizeUnit}</Text>
            </View>
          </View>

          {/* Trust badges */}
          <View style={styles.badgeRow}>
            {listing.agent.isVerified && (
              <View style={styles.badge}>
                <Ionicons name="shield-checkmark" size={14} color={colors.success} />
                <Text style={styles.badgeText}>Documents verified</Text>
              </View>
            )}
            <View style={[styles.badge, styles.badgeGray]}>
              <Ionicons name="star" size={13} color={colors.textPrimary} />
              <Text style={[styles.badgeText, { color: colors.textPrimary }]}>
                {listing.agent.rating.toFixed(1)} rating
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Description */}
          <Text style={styles.sectionLabel}>About this listing</Text>
          <Text style={styles.description}>{listing.description}</Text>

          {/* Photo thumbnails */}
          {listing.media.length > 1 && (
            <>
              <Text style={[styles.sectionLabel, { marginTop: Spacing.xl }]}>
                Photos ({listing.media.length})
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: Spacing.sm }}
                style={{ marginBottom: Spacing.xl }}
              >
                {listing.media.map((m) => (
                  <Image
                    key={m.id}
                    source={{ uri: m.uri }}
                    style={styles.thumb}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            </>
          )}

          <View style={styles.divider} />

          {/* Agent card */}
          <Text style={styles.sectionLabel}>Listed by</Text>
          <View style={styles.agentCard}>
            <Image source={{ uri: listing.agent.avatar }} style={styles.agentAvatar} />
            <View style={styles.agentInfo}>
              <View style={styles.agentNameRow}>
                <Text style={styles.agentName}>{listing.agent.name}</Text>
                {listing.agent.isVerified && (
                  <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                )}
              </View>
              <Text style={styles.agentRole}>Landowner · Member since 2024</Text>
              <View style={styles.agentRating}>
                <Ionicons name="star" size={12} color="#F9A825" />
                <Text style={styles.agentRatingText}>{listing.agent.rating.toFixed(1)}</Text>
                <Text style={styles.agentRatingCount}>(42 reviews)</Text>
              </View>
            </View>
          </View>

          {/* Contact row */}
          <View style={styles.contactRow}>
            <TouchableOpacity style={styles.contactBtnOutline}>
              <Ionicons name="call-outline" size={18} color={colors.primary} />
              <Text style={styles.contactBtnOutlineText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contactBtnFill}
              onPress={() =>
                router.push({
                  pathname: '/chat/[conversationId]',
                  params: { conversationId: 'conv-1' },
                })
              }
            >
              <Ionicons name="chatbubble-outline" size={18} color={colors.white} />
              <Text style={styles.contactBtnFillText}>Message</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* ── Bottom bar ─────────────────────────────────────────── */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing.sm }]}>
        <View>
          <Text style={styles.bottomPrice}>{price}</Text>
          {listing.priceUnit && (
            <Text style={styles.bottomPriceUnit}>/{listing.priceUnit}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => setShowSchedule(true)}
        >
          <Text style={styles.bookBtnText}>Book Inspection</Text>
        </TouchableOpacity>
      </View>

      {/* ── Schedule modal ─────────────────────────────────────── */}
      <Modal visible={showSchedule} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView style={styles.scheduleModal} showsVerticalScrollIndicator={false}>
            <View style={styles.scheduleHandle} />
            <View style={styles.scheduleHeader}>
              <TouchableOpacity onPress={() => setShowSchedule(false)}>
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.scheduleTitle}>Schedule Inspection</Text>
              <View style={{ width: 22 }} />
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
              <Text style={{ fontWeight: '400', color: colors.textTertiary }}>(Optional)</Text>
            </Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Access instructions, questions for the agent…"
              placeholderTextColor={colors.textTertiary}
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
              <Ionicons name="calendar-outline" size={18} color={colors.textPrimary} />
              <Text style={styles.doneButtonText}>
                {selectedDate && selectedTime
                  ? `Request ${selectedTime} · ${selectedDate.slice(5)}`
                  : 'Select a date and time to continue'}
              </Text>
            </TouchableOpacity>

            <View style={{ height: 60 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.white },
    notFound:  { flex: 1, alignItems: 'center', justifyContent: 'center' },

    // ── Hero ──
    heroWrap: { height: HERO_HEIGHT, backgroundColor: colors.surface },
    heroImage: { width, height: HERO_HEIGHT },
    heroNav: {
      position: 'absolute', top: 0, left: 0, right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.lg,
    },
    heroNavRight: { flexDirection: 'row', gap: Spacing.sm },
    heroBtn: {
      width: 42, height: 42, borderRadius: 21,
      backgroundColor: 'rgba(255,255,255,0.9)',
      alignItems: 'center', justifyContent: 'center',
      ...Shadow.sm,
    },
    heroBtnSaved: { backgroundColor: 'rgba(255,255,255,1)' },
    heroBottom: {
      position: 'absolute', bottom: Spacing.lg,
      left: Spacing.lg, right: Spacing.lg,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    catPill: {
      paddingHorizontal: 12, paddingVertical: 6,
      borderRadius: BorderRadius.full,
    },
    catPillText: { fontSize: 12, fontFamily: FontFamily.bold, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.3 },
    dotRow: { flexDirection: 'row', gap: 5 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.55)' },
    dotActive: { backgroundColor: '#FFFFFF', width: 18 },

    // ── White card ──
    card: {
      backgroundColor: colors.white,
      borderTopLeftRadius: 28, borderTopRightRadius: 28,
      marginTop: -24,
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.xxl,
    },

    title: {
      fontSize: FontSize.xxxl,
      fontFamily: FontFamily.extraBold,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: LetterSpacing.tight,
      lineHeight: 36,
      marginBottom: Spacing.md,
    },
    priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: Spacing.lg },
    price: {
      fontSize: FontSize.xxxl,
      fontFamily: FontFamily.extraBold,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: LetterSpacing.tight,
    },
    priceUnit: { fontSize: FontSize.md, color: colors.textSecondary, fontWeight: '500' },

    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      marginBottom: Spacing.lg,
    },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    metaDivider: { width: 1, height: 14, backgroundColor: colors.border },
    metaText: { fontSize: FontSize.sm, color: colors.textSecondary, fontWeight: '500' },

    badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
    badge: {
      flexDirection: 'row', alignItems: 'center', gap: 5,
      backgroundColor: `${colors.success}14`,
      paddingHorizontal: 11, paddingVertical: 6,
      borderRadius: BorderRadius.full,
    },
    badgeGray: { backgroundColor: colors.surface },
    badgeText: { fontSize: 12, fontWeight: '700', color: colors.success },

    divider: { height: 1, backgroundColor: colors.borderLight, marginVertical: Spacing.xl },

    sectionLabel: {
      fontSize: FontSize.lg,
      fontFamily: FontFamily.bold,
      fontWeight: '700',
      color: colors.textPrimary,
      letterSpacing: LetterSpacing.snug,
      marginBottom: Spacing.md,
    },
    description: {
      fontSize: FontSize.md,
      color: colors.textSecondary,
      lineHeight: 24,
    },
    thumb: {
      width: 110, height: 82,
      borderRadius: BorderRadius.lg,
      backgroundColor: colors.surface,
    },

    // Agent
    agentCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.lg,
      padding: Spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: colors.borderLight,
      marginBottom: Spacing.xl,
    },
    agentAvatar: { width: 56, height: 56, borderRadius: 28 },
    agentInfo: { flex: 1, gap: 3 },
    agentNameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
    agentName: {
      fontSize: FontSize.lg,
      fontFamily: FontFamily.bold,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    agentRole: { fontSize: FontSize.sm, color: colors.textSecondary },
    agentRating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    agentRatingText: { fontSize: FontSize.sm, fontWeight: '700', color: colors.textPrimary },
    agentRatingCount: { fontSize: FontSize.xs, color: colors.textTertiary },

    // Contact
    contactRow: { flexDirection: 'row', gap: Spacing.md },
    contactBtnOutline: {
      flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: Spacing.sm, height: 50,
      borderRadius: BorderRadius.xl,
      borderWidth: 1.5, borderColor: colors.primary,
    },
    contactBtnOutlineText: {
      fontSize: FontSize.md, fontFamily: FontFamily.bold, fontWeight: '700', color: colors.primary,
    },
    contactBtnFill: {
      flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: Spacing.sm, height: 50,
      borderRadius: BorderRadius.xl,
      backgroundColor: colors.primary,
    },
    contactBtnFillText: {
      fontSize: FontSize.md, fontFamily: FontFamily.bold, fontWeight: '700', color: colors.white,
    },

    // Bottom bar
    bottomBar: {
      position: 'absolute', bottom: 0, left: 0, right: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: Spacing.lg,
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.lg,
      backgroundColor: colors.white,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
      ...Shadow.md,
    },
    bottomPrice: {
      fontSize: FontSize.xl,
      fontFamily: FontFamily.extraBold,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: LetterSpacing.snug,
    },
    bottomPriceUnit: { fontSize: FontSize.xs, color: colors.textSecondary, fontWeight: '500' },
    bookBtn: {
      flex: 1,
      backgroundColor: colors.lime,
      height: 52,
      borderRadius: BorderRadius.xl,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bookBtnText: {
      fontSize: FontSize.lg,
      fontFamily: FontFamily.bold,
      fontWeight: '700',
      color: colors.textPrimary,
    },

    // Schedule modal
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'flex-end',
    },
    scheduleModal: {
      backgroundColor: colors.white,
      borderTopLeftRadius: BorderRadius.xxl,
      borderTopRightRadius: BorderRadius.xxl,
      padding: Spacing.xxl,
      maxHeight: '92%',
    },
    scheduleHandle: {
      width: 36, height: 4, borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: 'center',
      marginBottom: Spacing.lg,
    },
    scheduleHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    scheduleTitle: {
      fontSize: FontSize.xl,
      fontFamily: FontFamily.bold,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    scheduleSubtitle: {
      fontSize: FontSize.md,
      color: colors.textSecondary,
      lineHeight: 22,
      marginBottom: Spacing.xxl,
    },
    scheduleLabel: {
      fontSize: FontSize.md,
      fontFamily: FontFamily.semiBold,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: Spacing.md,
    },
    dateStrip: { gap: Spacing.sm, paddingBottom: Spacing.sm },
    dateCell: {
      width: 64, alignItems: 'center',
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.xl,
      borderWidth: 1.5, borderColor: colors.border,
      backgroundColor: colors.white, gap: 2,
    },
    dateCellActive: { backgroundColor: colors.lime, borderColor: colors.lime },
    dateDayLabel: { fontSize: 10, fontWeight: '600', color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.4 },
    dateDayNum: { fontSize: FontSize.xl, fontFamily: FontFamily.extraBold, fontWeight: '800', color: colors.textPrimary },
    dateMonth: { fontSize: 10, color: colors.textTertiary, fontWeight: '500' },
    dateLabelActive: { color: colors.textPrimary },
    timeGroupLabel: {
      fontSize: FontSize.sm, fontWeight: '600', color: colors.textSecondary,
      marginBottom: Spacing.sm, marginTop: Spacing.sm,
    },
    timeSlotRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.sm },
    timeSlot: {
      paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
      borderRadius: BorderRadius.xl,
      borderWidth: 1.5, borderColor: colors.border,
      backgroundColor: colors.white,
    },
    timeSlotActive: { backgroundColor: colors.lime, borderColor: colors.lime },
    timeSlotText: { fontSize: FontSize.sm, fontWeight: '600', color: colors.textSecondary },
    timeSlotTextActive: { color: colors.textPrimary },
    notesInput: {
      height: 88, borderRadius: BorderRadius.xl,
      borderWidth: 1, borderColor: colors.border,
      padding: Spacing.lg, marginBottom: Spacing.lg,
      fontSize: FontSize.md, color: colors.textPrimary,
      backgroundColor: colors.background,
    },
    doneButton: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: Spacing.sm, backgroundColor: colors.lime,
      paddingVertical: Spacing.lg, borderRadius: BorderRadius.xl,
    },
    doneButtonDisabled: { opacity: 0.45 },
    doneButtonText: {
      fontSize: FontSize.md, fontFamily: FontFamily.bold, fontWeight: '700', color: colors.textPrimary,
    },
  });
}
