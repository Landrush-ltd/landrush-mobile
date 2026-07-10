import { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import Animated, {
  FadeInUp,
  FadeIn,
  ZoomIn,
  withTiming,
  Easing,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, FontSize, BorderRadius, Shadow, LetterSpacing, FontFamily } from '../../src/constants/theme';
import type { ThemeColors } from '../../src/constants/theme';
import { useColors } from '../../src/context/ThemeContext';
import { ListingCard } from '../../src/components/ListingCard';
import { AchievementBadge } from '../../src/components/AchievementBadge';
import { CardSkeleton, TextSkeleton } from '../../src/components/SkeletonLoader';
import { FirstTimeOverlay } from '../../src/components/FirstTimeOverlay';
import { TutorialOverlay } from '../../src/components/TutorialOverlay';
import { useTutorial } from '../../src/context/TutorialContext';
import { useListingsStore } from '../../src/store/listings';
import { useAuthStore } from '../../src/store/auth';
import { useListings } from '../../src/hooks/useListings';
import type { Listing, ListingCategory } from '../../src/types/listing';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface Category {
  key:   ListingCategory | null;
  label: string;
  icon:  IoniconsName;
}

const CATEGORIES: Category[] = [
  { key: null,       label: 'All',       icon: 'grid-outline'       },
  { key: 'sale',     label: 'Buy',       icon: 'pricetag-outline'   },
  { key: 'lease',    label: 'Lease',     icon: 'key-outline'        },
  { key: 'distress', label: 'Distress',  icon: 'flame-outline'      },
];

// Animated card wrapper with staggered entrance + tap feedback (scale 0.97)
function AnimatedCardWrapper({
  children,
  onPress,
  delay = 0,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  delay?: number;
}) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withTiming(0.97, { duration: 80, easing: Easing.out(Easing.ease) });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 80, easing: Easing.out(Easing.ease) });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInUp.delay(delay).springify().damping(12).mass(1).overshootClamping(true)}
      style={animatedStyle}
    >
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        activeOpacity={1}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

// Animated button for interactive elements (scale 1 → 0.95)
function AnimatedTapButton({
  children,
  onPress,
  style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
}) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 120, easing: Easing.out(Easing.ease) });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 120, easing: Easing.out(Easing.ease) });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        activeOpacity={1}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

function Initials({ name, size = 32, colors }: { name: string; size?: number; colors: ThemeColors }) {
  const parts = name.trim().split(' ');
  const text  = ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.38, fontWeight: '800', color: '#222' }}>{text}</Text>
    </View>
  );
}

export default function ExploreScreen() {
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { filteredListings, activeCategory, searchQuery, setListings, setActiveCategory, setSearchQuery } =
    useListingsStore();
  const { data: apiListings, isLoading: listingsLoading, refetch } = useListings();
  const [refreshing, setRefreshing] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);
  const [showFirstTime, setShowFirstTime] = useState(true);
  const { currentStepData, currentStep, isVisible, nextStep, skipTutorial } = useTutorial();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  // Check for achievement milestone (every 10 saved listings)
  useEffect(() => {
    const savedCount = filteredListings.filter(l => l.saved).length;
    if (savedCount > 0 && savedCount % 10 === 0) {
      setShowAchievement(true);
    }
  }, [filteredListings]);

  useEffect(() => {
    if (apiListings) setListings(apiListings);
  }, [apiListings]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handlePress  = (l: Listing) => router.push(`/listing/${l.id}`);
  const displayName  = user ? `${user.firstName} ${user.lastName}` : 'Guest';
  const firstName    = user?.firstName ?? 'there';
  const hour         = new Date().getHours();
  const greeting     = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const horizontal   = filteredListings.slice(0, 6);
  const vertical     = filteredListings.slice(6);

  return (
    <>
      {showFirstTime && (
        <FirstTimeOverlay
          event={{
            id: 'first-home-visit',
            title: 'Explore Listings',
            message: 'Tap any card to view details, long-press to preview, or swipe left/right to browse',
            icon: 'search',
            color: colors.primary,
          }}
          visible={showFirstTime}
          onDismiss={() => setShowFirstTime(false)}
        />
      )}
      {showAchievement && (
        <AchievementBadge
          label="Milestone! 🏆"
          description={`Saved 10 listings`}
          icon="star"
          color={colors.primary}
          onComplete={() => setShowAchievement(false)}
        />
      )}
      <ScrollView
        style={styles.root}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.lime} />}
      >
      {/* ── Top bar ─────────────────────────────────────── */}
      <Animated.View entering={FadeInUp.delay(0).springify()} style={[styles.topBar, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>{greeting} 👋</Text>
          <Text style={styles.appName} numberOfLines={1}>{firstName}</Text>
        </View>
        <View style={styles.topBarRight}>
          <AnimatedTapButton onPress={() => router.push('/notifications')}>
            <View style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
            </View>
          </AnimatedTapButton>
          <AnimatedTapButton onPress={() => router.push('/(tabs)/profile')}>
            <View>
              {user?.avatar
                ? <Image source={{ uri: user.avatar }} style={styles.avatar} />
                : <Initials name={displayName} size={34} colors={colors} />
              }
            </View>
          </AnimatedTapButton>
        </View>
      </Animated.View>

      {/* ── Search bar ──────────────────────────────────── */}
      <Animated.View entering={FadeInUp.delay(40).springify()} style={styles.searchWrap}>
        <AnimatedTapButton onPress={() => router.push('/search')}>
          <View style={styles.searchBar}>
            <View style={styles.searchIconCircle}>
              <Ionicons name="search" size={16} color={colors.white} />
            </View>
            <View style={styles.searchText}>
              <Text style={styles.searchPlaceholder}>{searchQuery || 'Search land — location, size, type'}</Text>
            </View>
            <AnimatedTapButton>
              <View style={styles.filterBtn}>
                <Ionicons name="options-outline" size={18} color={colors.textPrimary} />
              </View>
            </AnimatedTapButton>
          </View>
        </AnimatedTapButton>
      </Animated.View>

      {/* ── Category icons ──────────────────────────────── */}
      <Animated.View entering={FadeInUp.delay(80).springify()}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catRow}
        >
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat.key;
            return (
              <AnimatedTapButton
                key={cat.label}
                onPress={() => setActiveCategory(cat.key)}
                style={styles.catItem}
              >
                <View style={[styles.catIconBox, active && styles.catIconBoxActive]}>
                  <Ionicons name={cat.icon} size={22} color={active ? colors.white : colors.textSecondary} />
                </View>
                <Text style={[styles.catLabel, active && styles.catLabelActive]}>{cat.label}</Text>
                {active && <Animated.View entering={ZoomIn.springify()} style={styles.catUnderline} />}
              </AnimatedTapButton>
            );
          })}
        </ScrollView>
      </Animated.View>

      {/* ── Section: latest ─────────────────────────────── */}
      <Animated.View entering={FadeInUp.delay(120).springify()} style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>
          {activeCategory
            ? CATEGORIES.find((c) => c.key === activeCategory)?.label + ' listings'
            : 'Latest listings'}
        </Text>
        <TouchableOpacity onPress={() => router.push('/search')}>
          <Text style={styles.seeAll}>Show all</Text>
        </TouchableOpacity>
      </Animated.View>

      {listingsLoading ? (
        <View style={styles.hList}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={{ marginRight: Spacing.lg }}>
              <CardSkeleton />
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={horizontal}
          renderItem={({ item, index }) => (
            <AnimatedCardWrapper
              onPress={() => handlePress(item)}
              delay={index * 40}
            >
              <ListingCard listing={item} onPress={handlePress} variant="horizontal" />
            </AnimatedCardWrapper>
          )}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hList}
          scrollEnabled={true}
        />
      )}

      {/* ── Map explore banner ──────────────────────────── */}
      <Animated.View entering={FadeInUp.delay(160).springify()}>
        <AnimatedTapButton onPress={() => router.push('/explore-location' as any)}>
          <View style={styles.mapBanner}>
            <View style={styles.mapBannerLeft}>
              <Ionicons name="location-outline" size={26} color={colors.lime} />
              <View>
                <Text style={styles.mapBannerTitle}>Explore location</Text>
                <Text style={styles.mapBannerSub}>{filteredListings.length} listings visible</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </View>
        </AnimatedTapButton>
      </Animated.View>

      {/* ── Divider ─────────────────────────────────────── */}
      <View style={styles.divider} />

      {/* ── Section: recommended ────────────────────────── */}
      {listingsLoading ? (
        <>
          <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Recommended near you</Text>
          </Animated.View>
          <View style={styles.vList}>
            {[0, 1, 2].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </View>
        </>
      ) : vertical.length > 0 ? (
        <>
          <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Recommended near you</Text>
            <TouchableOpacity onPress={() => router.push('/search')}>
              <Text style={styles.seeAll}>Show all</Text>
            </TouchableOpacity>
          </Animated.View>
          <View style={styles.vList}>
            {vertical.map((item, index) => (
              <AnimatedCardWrapper
                key={item.id}
                onPress={() => handlePress(item)}
                delay={(horizontal.length + index) * 40}
              >
                <ListingCard listing={item} onPress={handlePress} variant="vertical" />
              </AnimatedCardWrapper>
            ))}
          </View>
        </>
      ) : null}

      <View style={{ height: 100 }} />
      </ScrollView>

      {/* Tutorial overlay */}
      <TutorialOverlay
        step={currentStepData}
        visible={isVisible}
        onNext={nextStep}
        onSkip={skipTutorial}
        currentStep={currentStep}
        totalSteps={9}
      />
    </>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.white },

    // Top bar
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.md,
      backgroundColor: colors.white,
    },
    greeting: { fontSize: FontSize.md, color: colors.textSecondary, fontWeight: '500' },
    appName: { fontSize: FontSize.xxl, fontFamily: FontFamily.extraBold, fontWeight: '800', color: colors.textPrimary, letterSpacing: LetterSpacing.tight, marginTop: 2 },
    topBarRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    avatar: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: colors.lime },

    // Search bar
    searchWrap: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.white,
      borderRadius: BorderRadius.full,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: Spacing.md,
      paddingLeft: Spacing.sm,
      paddingRight: Spacing.md,
      gap: Spacing.sm,
      ...Shadow.md,
    },
    searchIconCircle: {
      width: 34, height: 34, borderRadius: 17,
      backgroundColor: colors.textPrimary,
      alignItems: 'center', justifyContent: 'center',
    },
    searchText: { flex: 1 },
    searchPlaceholder: { fontSize: FontSize.sm, color: colors.textSecondary },
    filterBtn: {
      width: 34, height: 34, borderRadius: 17,
      borderWidth: 1, borderColor: colors.border,
      alignItems: 'center', justifyContent: 'center',
    },

    // Category row
    catRow: { paddingHorizontal: Spacing.lg, gap: Spacing.lg, paddingBottom: Spacing.sm },
    catItem: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
      minWidth: 80,
    },
    catIconBox: {
      width: 48, height: 48, borderRadius: BorderRadius.lg,
      backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border,
      alignItems: 'center', justifyContent: 'center',
    },
    catIconBoxActive: { backgroundColor: colors.lime, borderColor: colors.lime },
    catLabel: {
      fontSize: FontSize.sm,
      fontWeight: '600',
      color: colors.textSecondary,
      textAlign: 'center',
    },
    catLabelActive: { fontWeight: '700', color: colors.lime },
    catUnderline: { width: 24, height: 2.5, backgroundColor: colors.lime, borderRadius: 1.25, marginTop: 4 },

    // Section title
    sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, marginTop: Spacing.lg, marginBottom: Spacing.md },
    sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: colors.textPrimary },
    seeAll: { fontSize: FontSize.sm, fontWeight: '600', color: colors.primary },

    // Lists
    hList: { paddingHorizontal: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.sm },
    vList: { paddingHorizontal: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.md },

    // Map banner
    mapBanner: {
      marginHorizontal: Spacing.lg,
      marginVertical: Spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.white,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      borderWidth: 1,
      borderColor: colors.lime + '30',
      ...Shadow.sm,
    },
    mapBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
    mapBannerTitle: { fontSize: FontSize.md, fontWeight: '700', color: colors.textPrimary },
    mapBannerSub: { fontSize: FontSize.xs, color: colors.textSecondary, marginTop: 2 },

    // Divider
    divider: { height: 1, backgroundColor: colors.border, marginVertical: Spacing.xl, marginHorizontal: Spacing.lg },
  });
}
