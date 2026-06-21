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
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../src/constants/theme';
import { SearchBar } from '../../src/components/SearchBar';
import { ListingCard } from '../../src/components/ListingCard';
import { useListingsStore } from '../../src/store/listings';
import { useAuthStore } from '../../src/store/auth';
import { mockListings } from '../../src/services/mockData';
import type { Listing, ListingCategory } from '../../src/types/listing';

const HERO_BG = '#003828';

type FilterKey = ListingCategory | null;
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: null,       label: 'All'          },
  { key: 'sale',     label: 'Buy'          },
  { key: 'lease',    label: 'Lease'        },
  { key: 'distress', label: 'Distress Sale' },
];

function getGreeting(name?: string) {
  const h  = new Date().getHours();
  const tod = h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening';
  return name ? `Good ${tod}, ${name.split(' ')[0]}` : 'Good Day';
}

function Initials({ name, size = 38 }: { name: string; size?: number }) {
  const parts   = name.trim().split(' ');
  const initials = (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
  return (
    <View
      style={{
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: Colors.lime,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: Colors.lime,
      }}
    >
      <Text style={{ fontSize: size * 0.35, fontWeight: '800', color: Colors.textPrimary }}>
        {initials.toUpperCase()}
      </Text>
    </View>
  );
}

export default function DiscoverScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { filteredListings, activeCategory, searchQuery, setListings, setActiveCategory, setSearchQuery } =
    useListingsStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { setListings(mockListings); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => { setListings(mockListings); setRefreshing(false); }, 900);
  };

  const handlePress = (l: Listing) => router.push(`/listing/${l.id}`);

  const featuredListing = filteredListings[0];
  const horizontal      = filteredListings.slice(1, 6);
  const vertical        = filteredListings.slice(6);

  const displayName = user ? `${user.firstName} ${user.lastName}` : '';

  return (
    <ScrollView
      style={styles.root}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.lime} />
      }
    >
      {/* ── Hero ───────────────────────────────────────────────── */}
      <View style={{ backgroundColor: HERO_BG }}>
        <View style={[styles.hero, { paddingTop: insets.top + Spacing.md }]}>
          {/* Deco */}
          <View style={styles.decoA} />
          <View style={styles.decoB} />

          {/* Top bar */}
          <View style={styles.topBar}>
            <View>
              <Text style={styles.greeting}>{getGreeting(displayName)}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={11} color={Colors.lime} />
                <Text style={styles.locationText}>Nigeria</Text>
              </View>
            </View>
            <View style={styles.topBarRight}>
              <TouchableOpacity
                style={styles.notifBtn}
                onPress={() => router.push('/notifications')}
              >
                <Ionicons name="notifications-outline" size={20} color={Colors.white} />
                <View style={styles.notifDot} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
                {user?.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.avatar} />
                ) : (
                  <Initials name={displayName || 'Landrush User'} size={38} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats strip */}
          <View style={styles.statsStrip}>
            {[
              { icon: 'layers-outline' as const,   value: '2,400+', label: 'Listings'  },
              { icon: 'shield-outline' as const,    value: '99%',    label: 'Verified'  },
              { icon: 'location-outline' as const,  value: '36',     label: 'States'    },
            ].map((s) => (
              <View key={s.label} style={styles.statItem}>
                <Ionicons name={s.icon} size={14} color={Colors.lime} />
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Search */}
          <View style={styles.searchWrap}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by location, area, or landmark"
            />
          </View>
        </View>

        {/* Hero → body transition */}
        <LinearGradient
          colors={[HERO_BG, Colors.background]}
          style={styles.heroFade}
        />
      </View>

      {/* ── Filter chips ────────────────────────────────────────── */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map((f) => {
            const active = activeCategory === f.key;
            return (
              <TouchableOpacity
                key={f.label}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setActiveCategory(f.key)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Featured listing ─────────────────────────────────────── */}
      {featuredListing && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>FEATURED</Text>
            <Text style={styles.sectionTitle}>Top Pick</Text>
          </View>
          <TouchableOpacity
            style={styles.featuredCard}
            onPress={() => handlePress(featuredListing)}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: featuredListing.media[0]?.uri }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.82)']}
              style={StyleSheet.absoluteFill}
            />
            {/* Category */}
            <View style={[styles.fcBadge, { backgroundColor: Colors.lease }]}>
              <Text style={styles.fcBadgeText}>
                {featuredListing.category === 'sale' ? 'Buy'
                  : featuredListing.category === 'distress' ? 'Distress'
                  : 'Lease'}
              </Text>
            </View>
            <View style={styles.fcBody}>
              {featuredListing.agent.isVerified && (
                <View style={styles.fcVerified}>
                  <Ionicons name="checkmark-circle" size={12} color={Colors.lime} />
                  <Text style={styles.fcVerifiedText}>Verified Listing</Text>
                </View>
              )}
              <Text style={styles.fcTitle} numberOfLines={2}>{featuredListing.title}</Text>
              <View style={styles.fcMeta}>
                <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.7)" />
                <Text style={styles.fcLocation}>{featuredListing.location}</Text>
              </View>
              <View style={styles.fcBottom}>
                <Text style={styles.fcPrice}>
                  ₦{featuredListing.price >= 1_000_000
                    ? `${(featuredListing.price / 1_000_000).toFixed(1)}M`
                    : `${(featuredListing.price / 1_000).toFixed(0)}K`}
                </Text>
                <View style={styles.fcChip}>
                  <Ionicons name="expand-outline" size={11} color={Colors.textPrimary} />
                  <Text style={styles.fcChipText}>{featuredListing.size} {featuredListing.sizeUnit}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Map banner ───────────────────────────────────────────── */}
      <TouchableOpacity
        style={styles.mapBanner}
        onPress={() => router.push('/map' as any)}
        activeOpacity={0.88}
      >
        <LinearGradient
          colors={[`${Colors.primary}18`, `${Colors.lime}18`]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
        <View style={styles.mapBannerLeft}>
          <Text style={styles.mapBannerTitle}>Explore on Map</Text>
          <Text style={styles.mapBannerSub}>See all {filteredListings.length} listings near you</Text>
        </View>
        <View style={styles.mapBannerIcon}>
          <Ionicons name="map" size={22} color={Colors.primary} />
        </View>
      </TouchableOpacity>

      {/* ── More Listings ────────────────────────────────────────── */}
      {horizontal.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionLabel}>BROWSE</Text>
              <Text style={styles.sectionTitle}>Latest Listings</Text>
            </View>
            <TouchableOpacity style={styles.seeAll} onPress={() => router.push('/search')}>
              <Text style={styles.seeAllText}>See all</Text>
              <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={horizontal}
            renderItem={({ item }) => <ListingCard listing={item} onPress={handlePress} variant="horizontal" />}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hList}
          />
        </View>
      )}

      {/* ── Recommended ─────────────────────────────────────────── */}
      {vertical.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionLabel}>RECOMMENDED</Text>
              <Text style={styles.sectionTitle}>Near You</Text>
            </View>
            <TouchableOpacity style={styles.seeAll} onPress={() => router.push('/search')}>
              <Text style={styles.seeAllText}>See all</Text>
              <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.vList}>
            {vertical.map((item) => (
              <ListingCard key={item.id} listing={item} onPress={handlePress} variant="vertical" />
            ))}
          </View>
        </View>
      )}

      <View style={{ height: Spacing.xxxl * 2 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ── Hero
  hero: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    overflow: 'hidden',
  },
  decoA: {
    position: 'absolute', width: 260, height: 260, borderRadius: 130,
    backgroundColor: 'rgba(159,187,68,0.07)', top: -90, right: -70,
  },
  decoB: {
    position: 'absolute', width: 130, height: 130, borderRadius: 65,
    backgroundColor: 'rgba(159,187,68,0.04)', bottom: 10, left: -40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  greeting: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.white,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  locationText: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.55)',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  notifBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute', top: 8, right: 8,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.lime,
    borderWidth: 1.5, borderColor: HERO_BG,
  },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    borderWidth: 2, borderColor: Colors.lime,
  },
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  statValue: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.white,
    marginTop: 1,
  },
  statLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.45)',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  searchWrap: {},
  heroFade: {
    height: 28,
  },

  // ── Filters
  filterSection: {
    paddingTop: Spacing.sm,
  },
  filterRow: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  filterChipActive: {
    backgroundColor: Colors.textPrimary,
    borderColor: Colors.textPrimary,
  },
  filterChipText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.white,
  },

  // ── Sections
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.lime,
    letterSpacing: 1.8,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingBottom: 2,
  },
  seeAllText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
  },

  // ── Featured card
  featuredCard: {
    marginHorizontal: Spacing.lg,
    height: 230,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadow.lg,
  },
  fcBadge: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  fcBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.4,
  },
  fcBody: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    gap: 5,
  },
  fcVerified: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fcVerifiedText: {
    fontSize: 10,
    color: Colors.lime,
    fontWeight: '600',
  },
  fcTitle: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.white,
    lineHeight: 22,
  },
  fcMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  fcLocation: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.65)',
  },
  fcBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  fcPrice: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.white,
  },
  fcChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.lime,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  fcChipText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textPrimary,
  },

  // ── Map banner
  mapBanner: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${Colors.lime}30`,
  },
  mapBannerLeft: {
    gap: 3,
  },
  mapBannerTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.primary,
  },
  mapBannerSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  mapBannerIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: `${Colors.lime}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Lists
  hList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  vList: {
    paddingHorizontal: Spacing.lg,
  },
});
