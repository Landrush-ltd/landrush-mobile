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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, FontSize, BorderRadius, Shadow } from '../../src/constants/theme';
import type { ThemeColors } from '../../src/constants/theme';
import { useColors } from '../../src/context/ThemeContext';
import { ListingCard } from '../../src/components/ListingCard';
import { useListingsStore } from '../../src/store/listings';
import { useAuthStore } from '../../src/store/auth';
import { mockListings } from '../../src/services/mockData';
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
  const [refreshing, setRefreshing] = useState(false);
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  useEffect(() => { setListings(mockListings); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => { setListings(mockListings); setRefreshing(false); }, 800);
  };

  const handlePress  = (l: Listing) => router.push(`/listing/${l.id}`);
  const displayName  = user ? `${user.firstName} ${user.lastName}` : 'Guest';
  const horizontal   = filteredListings.slice(0, 6);
  const vertical     = filteredListings.slice(6);

  return (
    <ScrollView
      style={styles.root}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.lime} />}
    >
      {/* ── Top bar ─────────────────────────────────────── */}
      <View style={[styles.topBar, { paddingTop: insets.top + Spacing.sm }]}>
        <View>
          <Text style={styles.appName}>Landrush</Text>
          <Text style={styles.appTagline}>Find your land in Nigeria</Text>
        </View>
        <View style={styles.topBarRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
            {user?.avatar
              ? <Image source={{ uri: user.avatar }} style={styles.avatar} />
              : <Initials name={displayName} size={34} colors={colors} />
            }
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Search bar ──────────────────────────────────── */}
      <View style={styles.searchWrap}>
        <TouchableOpacity style={styles.searchBar} onPress={() => router.push('/search')} activeOpacity={0.85}>
          <View style={styles.searchIconCircle}>
            <Ionicons name="search" size={16} color={colors.white} />
          </View>
          <View style={styles.searchText}>
            <Text style={styles.searchPlaceholder}>{searchQuery || 'Search land — location, size, type'}</Text>
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="options-outline" size={18} color={colors.textPrimary} />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      {/* ── Category icons ──────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catRow}
      >
        {CATEGORIES.map((cat) => {
          const active = activeCategory === cat.key;
          return (
            <TouchableOpacity
              key={cat.label}
              style={styles.catItem}
              onPress={() => setActiveCategory(cat.key)}
              activeOpacity={0.7}
            >
              <View style={[styles.catIconBox, active && styles.catIconBoxActive]}>
                <Ionicons name={cat.icon} size={22} color={active ? colors.white : colors.textSecondary} />
              </View>
              <Text style={[styles.catLabel, active && styles.catLabelActive]}>{cat.label}</Text>
              {active && <View style={styles.catUnderline} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Section: latest ─────────────────────────────── */}
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>
          {activeCategory
            ? CATEGORIES.find((c) => c.key === activeCategory)?.label + ' listings'
            : 'Latest listings'}
        </Text>
        <TouchableOpacity onPress={() => router.push('/search')}>
          <Text style={styles.seeAll}>Show all</Text>
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

      {/* ── Map explore banner ──────────────────────────── */}
      <TouchableOpacity style={styles.mapBanner} onPress={() => router.push('/map' as any)} activeOpacity={0.88}>
        <View style={styles.mapBannerLeft}>
          <Ionicons name="map-outline" size={26} color={colors.lime} />
          <View>
            <Text style={styles.mapBannerTitle}>Explore on Map</Text>
            <Text style={styles.mapBannerSub}>{filteredListings.length} listings visible</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      </TouchableOpacity>

      {/* ── Divider ─────────────────────────────────────── */}
      <View style={styles.divider} />

      {/* ── Section: recommended ────────────────────────── */}
      {vertical.length > 0 && (
        <>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Recommended near you</Text>
            <TouchableOpacity onPress={() => router.push('/search')}>
              <Text style={styles.seeAll}>Show all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.vList}>
            {vertical.map((item) => (
              <ListingCard key={item.id} listing={item} onPress={handlePress} variant="vertical" />
            ))}
          </View>
        </>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
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
    appName: { fontSize: FontSize.xxl, fontWeight: '800', color: colors.textPrimary },
    appTagline: { fontSize: FontSize.xs, color: colors.textSecondary, marginTop: 1 },
    topBarRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    avatar: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: colors.lime },

    // Search bar — Airbnb pill style
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
    catRow: { paddingHorizontal: Spacing.lg, gap: Spacing.xl, paddingBottom: Spacing.sm },
    catItem: { alignItems: 'center', gap: Spacing.xs, width: 60 },
    catIconBox: {
      width: 52, height: 52, borderRadius: 16,
      backgroundColor: colors.surface,
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 1.5, borderColor: colors.borderLight,
    },
    catIconBoxActive: {
      backgroundColor: colors.textPrimary,
      borderColor: colors.textPrimary,
    },
    catLabel: { fontSize: 10, color: colors.textSecondary, fontWeight: '500', textAlign: 'center' },
    catLabelActive: { color: colors.textPrimary, fontWeight: '700' },
    catUnderline: { width: 20, height: 2, borderRadius: 1, backgroundColor: colors.textPrimary, marginTop: -2 },

    // Sections
    sectionHead: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.xl,
      paddingBottom: Spacing.md,
    },
    sectionTitle: { fontSize: FontSize.xl, fontWeight: '700', color: colors.textPrimary },
    seeAll: { fontSize: FontSize.sm, fontWeight: '600', color: colors.textPrimary, textDecorationLine: 'underline' },

    hList: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },

    // Map banner
    mapBanner: {
      marginHorizontal: Spacing.lg,
      marginTop: Spacing.lg,
      marginBottom: Spacing.sm,
      padding: Spacing.lg,
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.white,
      ...Shadow.sm,
    },
    mapBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    mapBannerTitle: { fontSize: FontSize.md, fontWeight: '700', color: colors.textPrimary },
    mapBannerSub: { fontSize: FontSize.xs, color: colors.textSecondary, marginTop: 2 },

    divider: { height: 8, backgroundColor: colors.surface, marginTop: Spacing.lg },

    vList: { paddingHorizontal: Spacing.lg },
  });
}
