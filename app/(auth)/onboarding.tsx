import { useState, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  Animated, StatusBar, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, FontSize, BorderRadius, Shadow } from '../../src/constants/theme';
import type { ThemeColors } from '../../src/constants/theme';
import { useColors } from '../../src/context/ThemeContext';
import { useAuthStore } from '../../src/store/auth';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    title: 'Find land opportunities without the usual stress',
    description:
      'Explore land for lease, sale or distress sale through a marketplace designed for easier discovery and clearer access.',
  },
  {
    title: 'Know more before making a move',
    description:
      'View listing details, uploaded documents, map locations, and verification indicators before scheduling inspections.',
  },
  {
    title: 'Plan inspections around your schedule',
    description:
      'Coordinate inspection times directly with agents or landowners without unnecessary back-and-forth.',
  },
];

// ── Slide 1: landscape photo + map overlay ─────────────────────
function Slide1({ colors }: { colors: ThemeColors }) {
  const il = useMemo(() => makeIlStyles(colors), [colors]);
  return (
    <View style={il.root}>
      {/* White map-hint area */}
      <View style={il.mapArea}>
        {/* Dotted path dots */}
        {([[40, 62], [52, 50], [64, 38]] as [number, number][]).map(([l, t], i) => (
          <View key={i} style={[il.pathDot, { left: `${l}%` as any, top: `${t}%` as any }]} />
        ))}
        {/* Green destination pin */}
        <View style={[il.pinWrap, { top: '18%', left: '38%' }]}>
          <View style={il.pinBubble}>
            <Text style={il.pinText}>2.4 km</Text>
          </View>
          <Ionicons name="location" size={28} color={colors.lime} />
        </View>
        {/* Red origin pins */}
        <View style={[il.pinWrap, { bottom: '15%', left: '15%' }]}>
          <Ionicons name="location-sharp" size={22} color="#E31C5F" />
        </View>
        <View style={[il.pinWrap, { bottom: '20%', right: '18%' }]}>
          <Ionicons name="location-sharp" size={18} color="#555" />
        </View>
      </View>
      {/* Landscape photo */}
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1704230093402-c903d87735b4?w=800&auto=format&fit=crop' }}
        style={il.photo}
        resizeMode="cover"
      />
    </View>
  );
}

// ── Slide 2: stacked property cards + verification chips ────────
function Slide2({ colors }: { colors: ThemeColors }) {
  const il = useMemo(() => makeIlStyles(colors), [colors]);
  const PHOTOS = [
    // Aerial — Inikorogha Community, Edo State, Nigeria
    'https://images.unsplash.com/photo-1684853693031-ab9e3f8c9d5e?w=500&auto=format&fit=crop',
    // Aerial — Rayfield Gardens Estate, Ibadan, Nigeria (land parcels)
    'https://images.unsplash.com/photo-1685266326195-76ad098af5d8?w=500&auto=format&fit=crop',
    // Aerial — Residential with trees, Ibadan, Nigeria
    'https://images.unsplash.com/photo-1685266326473-5b99c3d08a7e?w=500&auto=format&fit=crop',
  ];
  const BADGES = ['Accessible Location', 'Documents Uploaded', 'Verified Owner'];

  const CARD_W = width * 0.42;
  const offsets: [number, string, number][] = [
    [-24, '-6deg', 1],
    [0,   '-1deg', 2],
    [22,  '4deg',  3],
  ];

  return (
    <View style={{ flex: 1, position: 'relative' }}>
      {/* Three stacked portrait cards */}
      {PHOTOS.map((uri, i) => {
        const [dx, rot, z] = offsets[i];
        return (
          <View
            key={i}
            style={[
              il.card,
              {
                width: CARD_W,
                left: 16 + dx,
                zIndex: z,
                transform: [{ rotate: rot }],
              },
            ]}
          >
            <Image source={{ uri }} style={{ flex: 1 }} resizeMode="cover" />
          </View>
        );
      })}

      {/* Verification badge chips — right side */}
      <View style={il.chipsCol}>
        {BADGES.map((label) => (
          <View key={label} style={il.chip}>
            <Ionicons name="checkmark-circle" size={13} color={colors.lime} />
            <Text style={il.chipText}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Slide 3: calendar / schedule UI ────────────────────────────
function Slide3({ colors }: { colors: ThemeColors }) {
  const il = useMemo(() => makeIlStyles(colors), [colors]);
  return (
    <View style={il.calWrap}>
      <View style={il.calCard}>
        {/* MON section */}
        <View style={il.calHeaderRow}>
          <Text style={il.calDay}>MON</Text>
          <Text style={il.calDate}>12 MAY</Text>
        </View>
        <View style={il.calEvent}>
          <View style={il.calBar} />
          <View style={{ flex: 1 }}>
            <Text style={il.calTitle}>Inspection with Admedia Properties</Text>
            <Text style={il.calTime}>10:00 AM – 11:30 AM</Text>
          </View>
        </View>

        <View style={il.calDivider} />

        {/* FRI section */}
        <View style={il.calHeaderRow}>
          <Text style={il.calDay}>FRI</Text>
          <Text style={il.calDate}>20 JUN</Text>
        </View>
        <View style={il.calEvent}>
          <View style={il.calBar} />
          <View style={{ flex: 1 }}>
            <Text style={il.calTitle}>Rescheduled Land Visit</Text>
            <Text style={il.calTime}>2:30 PM – 5:30 PM</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ── Main screen ────────────────────────────────────────────────
export default function OnboardingScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { setOnboardingComplete } = useAuthStore();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [idx, setIdx] = useState(0);
  const anim = useRef(new Animated.Value(1)).current;

  const goTo = (next: number) => {
    Animated.timing(anim, { toValue: 0, duration: 140, useNativeDriver: true }).start(() => {
      setIdx(next);
      Animated.timing(anim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  };

  const finish  = () => { setOnboardingComplete(); router.replace('/(auth)/login'); };
  const next    = () => (idx < SLIDES.length - 1 ? goTo(idx + 1) : finish());
  const slide   = SLIDES[idx];
  const SLIDES_IL = [<Slide1 colors={colors} />, <Slide2 colors={colors} />, <Slide3 colors={colors} />];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      {/* ── Top nav ────────────────────── */}
      <View style={[styles.nav, { paddingTop: insets.top + Spacing.md }]}>
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => i !== idx && goTo(i)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <View style={[styles.dot, i === idx ? styles.dotActive : styles.dotGray]} />
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity onPress={finish} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* ── Text content ───────────────── */}
      <Animated.View style={[styles.content, { opacity: anim }]}>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.desc}>{slide.description}</Text>
        <TouchableOpacity style={styles.cta} onPress={next} activeOpacity={0.88}>
          <Text style={styles.ctaText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={15} color={colors.textPrimary} />
        </TouchableOpacity>
      </Animated.View>

      {/* ── Illustration ───────────────── */}
      <Animated.View style={[styles.illustration, { opacity: anim }]}>
        {SLIDES_IL[idx]}
      </Animated.View>
    </View>
  );
}

// ── Main styles ─────────────────────────────────────────────────
function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.white },
    nav: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.xl,
      paddingBottom: Spacing.sm,
    },
    dotsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dot: { height: 6, borderRadius: 3 },
    dotActive: { width: 22, backgroundColor: colors.lime },
    dotGray:   { width: 6,  backgroundColor: colors.border },
    skip: { fontSize: FontSize.sm, color: colors.textTertiary, fontWeight: '500' },
    content: {
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.xl,
    },
    title: {
      fontSize: 27,
      fontWeight: '800',
      color: colors.textPrimary,
      lineHeight: 35,
      marginBottom: Spacing.md,
      letterSpacing: -0.3,
    },
    desc: {
      fontSize: FontSize.md,
      color: colors.textSecondary,
      lineHeight: 23,
      marginBottom: Spacing.xl,
    },
    cta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      alignSelf: 'flex-start',
      backgroundColor: colors.lime,
      paddingHorizontal: Spacing.xl,
      paddingVertical: 13,
      borderRadius: BorderRadius.full,
    },
    ctaText: { fontSize: FontSize.md, fontWeight: '700', color: colors.textPrimary },
    illustration: {
      flex: 1,
      marginHorizontal: Spacing.xl,
      marginBottom: Spacing.xl,
      borderRadius: 24,
      overflow: 'hidden',
      backgroundColor: colors.surface,
    },
  });
}

// ── Illustration sub-styles ─────────────────────────────────────
function makeIlStyles(colors: ThemeColors) {
  return StyleSheet.create({
    // Slide 1
    root:    { flex: 1 },
    mapArea: { height: '40%', backgroundColor: colors.surface, position: 'relative' },
    pathDot: {
      position: 'absolute',
      width: 7,
      height: 7,
      borderRadius: 3.5,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderStyle: 'dashed',
    },
    pinWrap:   { position: 'absolute', alignItems: 'center' },
    pinBubble: {
      backgroundColor: colors.white,
      borderRadius: BorderRadius.md,
      paddingHorizontal: 8,
      paddingVertical: 3,
      marginBottom: 2,
      ...Shadow.sm,
    },
    pinText: { fontSize: 10, fontWeight: '700', color: colors.textPrimary },
    photo:   { flex: 1, width: '100%' },

    // Slide 2 cards
    card: {
      position: 'absolute',
      top: 12,
      bottom: 12,
      borderRadius: 20,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOpacity: 0.18,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    chipsCol: {
      position: 'absolute',
      right: 12,
      top: '20%',
      gap: 12,
      alignItems: 'flex-start',
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: colors.white,
      borderRadius: BorderRadius.full,
      paddingHorizontal: 10,
      paddingVertical: 6,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 4,
    },
    chipText: { fontSize: 11, fontWeight: '700', color: colors.textPrimary },

    // Slide 3 calendar
    calWrap: { flex: 1, padding: Spacing.lg, justifyContent: 'center' },
    calCard: {
      backgroundColor: colors.white,
      borderRadius: 20,
      padding: Spacing.lg,
      ...Shadow.md,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    calHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    calDay:     { fontSize: FontSize.sm, fontWeight: '700', color: colors.textTertiary, letterSpacing: 0.6 },
    calDate:    { fontSize: FontSize.xs, color: colors.textTertiary, fontWeight: '500' },
    calEvent:   { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.lg },
    calBar:     { width: 4, borderRadius: 2, backgroundColor: colors.lime, alignSelf: 'stretch', minHeight: 36 },
    calTitle:   { fontSize: FontSize.sm, fontWeight: '700', color: colors.textPrimary, marginBottom: 3 },
    calTime:    { fontSize: FontSize.xs, color: colors.textSecondary },
    calDivider: { height: 1, backgroundColor: colors.borderLight, marginBottom: Spacing.lg },
  });
}
