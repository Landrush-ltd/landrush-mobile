import React, { useEffect, useState } from 'react';
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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../src/constants/theme';
import { SearchBar } from '../../src/components/SearchBar';
import { CategoryChip } from '../../src/components/CategoryChip';
import { ListingCard } from '../../src/components/ListingCard';
import { useListingsStore } from '../../src/store/listings';
import { useAuthStore } from '../../src/store/auth';
import { mockListings } from '../../src/services/mockData';
import type { Listing, ListingCategory } from '../../src/types/listing';

const HERO_BG = '#003828';

const CATEGORIES: { key: ListingCategory | null; label: string; color: string }[] = [
  { key: null,       label: 'All',          color: Colors.primary },
  { key: 'lease',    label: 'Lease',        color: Colors.lease },
  { key: 'sale',     label: 'Buy',          color: Colors.sale },
  { key: 'distress', label: 'Distress Sale', color: Colors.distress },
];

const STAT_ITEMS = [
  { value: '2,400+', label: 'Listings' },
  { value: '99%',    label: 'Verified' },
  { value: '36',     label: 'States' },
];

function getGreeting(firstName?: string) {
  const hour = new Date().getHours();
  const tod = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
  return firstName ? `Good ${tod}, ${firstName}` : 'Discover Land';
}

export default function DiscoverScreen() {
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const { user } = useAuthStore();
  const {
    filteredListings,
    activeCategory,
    searchQuery,
    setListings,
    setActiveCategory,
    setSearchQuery,
  } = useListingsStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { setListings(mockListings); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => { setListings(mockListings); setRefreshing(false); }, 1000);
  };

  const handleListingPress = (listing: Listing) => router.push(`/listing/${listing.id}`);

  const verifiedListings    = filteredListings.filter((l) => l.agent.isVerified);
  const recommendedListings = filteredListings;

  return (
    <ScrollView
      style={styles.root}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.lime} />
      }
    >
      {/* ── Hero banner ─────────────────────────────────────────── */}
      <View style={[styles.hero, { paddingTop: insets.top + Spacing.md }]}>
        {/* Background deco circles */}
        <View style={styles.heroDecoA} />
        <View style={styles.heroDecoB} />

        {/* Top bar: greeting + icons */}
        <View style={styles.heroTopBar}>
          <View>
            <Text style={styles.heroGreeting}>{getGreeting(user?.firstName)}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={12} color={Colors.lime} />
              <Text style={styles.locationText}>Uyo, Nigeria</Text>
            </View>
          </View>
          <View style={styles.heroIcons}>
            <TouchableOpacity style={styles.heroIconBtn} onPress={() => router.push('/notifications')}>
              <Ionicons name="notifications-outline" size={20} color={Colors.white} />
              {/* Unread dot */}
              <View style={styles.notifDot} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
              <Image
                source={{ uri: user?.avatar ?? 'https://i.pravatar.cc/150?img=11' }}
                style={styles.heroAvatar}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {STAT_ITEMS.map((s, i) => (
            <View key={i} style={styles.statItem}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Search bar inside hero */}
        <View style={styles.heroSearch}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by location, area, or landmark"
          />
        </View>
      </View>

      {/* ── Category chips ──────────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categories}
      >
        {CATEGORIES.map((cat) => (
          <CategoryChip
            key={cat.label}
            label={cat.label}
            isActive={activeCategory === cat.key}
            color={cat.color}
            onPress={() => setActiveCategory(cat.key)}
          />
        ))}
      </ScrollView>

      {/* ── Verified listings ───────────────────────────────────── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Verified Listings</Text>
        <TouchableOpacity style={styles.seeAll} onPress={() => router.push('/search')}>
          <Text style={styles.seeAllText}>See all</Text>
          <Ionicons name="chevron-forward" size={15} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={verifiedListings}
        renderItem={({ item }) => (
          <ListingCard listing={item} onPress={handleListingPress} variant="horizontal" />
        )}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hList}
      />

      {/* ── Near You banner ─────────────────────────────────────── */}
      <TouchableOpacity style={styles.nearBanner} onPress={() => router.push('/map' as any)}>
        <View>
          <Text style={styles.nearBannerTitle}>Explore on Map</Text>
          <Text style={styles.nearBannerSub}>See land listings near your location</Text>
        </View>
        <View style={styles.nearBannerIcon}>
          <Ionicons name="map-outline" size={22} color={Colors.primary} />
        </View>
      </TouchableOpacity>

      {/* ── Recommended ─────────────────────────────────────────── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recommended Near You</Text>
        <TouchableOpacity style={styles.seeAll} onPress={() => router.push('/search')}>
          <Text style={styles.seeAllText}>See all</Text>
          <Ionicons name="chevron-forward" size={15} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.vList}>
        {recommendedListings.map((item) => (
          <ListingCard
            key={item.id}
            listing={item}
            onPress={handleListingPress}
            variant="vertical"
          />
        ))}
      </View>

      <View style={{ height: Spacing.xxxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ── Hero ─────────────────────────────────────────────────────
  hero: {
    backgroundColor: HERO_BG,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl + 16,
    overflow: 'hidden',
  },
  heroDecoA: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(159,187,68,0.07)',
    top: -80,
    right: -60,
  },
  heroDecoB: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(159,187,68,0.05)',
    bottom: 20,
    left: -30,
  },
  heroTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  heroGreeting: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.white,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  locationText: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.6)',
  },
  heroIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  heroIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.lime,
    borderWidth: 1.5,
    borderColor: HERO_BG,
  },
  heroAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: Colors.lime,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.lime,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.55)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroSearch: {
    // SearchBar is white on dark — let it sit in the hero
  },

  // ── Categories ────────────────────────────────────────────────
  categories: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },

  // ── Sections ──────────────────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
  hList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },

  // ── Near you banner ───────────────────────────────────────────
  nearBanner: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xxl,
    backgroundColor: `${Colors.lime}18`,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${Colors.lime}40`,
  },
  nearBannerTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 2,
  },
  nearBannerSub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  nearBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${Colors.lime}28`,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Recommended list ──────────────────────────────────────────
  vList: {
    paddingHorizontal: Spacing.lg,
  },
});
