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
  type ImageSourcePropType,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, FontSize, BorderRadius, Shadow, LetterSpacing, FontFamily } from '../../src/constants/theme';
import type { ThemeColors } from '../../src/constants/theme';
import { useColors } from '../../src/context/ThemeContext';
import { ListingCard } from '../../src/components/ListingCard';
import { useListingsStore } from '../../src/store/listings';
import { useAuthStore } from '../../src/store/auth';
import { useListings } from '../../src/hooks/useListings';
import type { Listing, ListingCategory } from '../../src/types/listing';
import { useUnreadCount } from '../../src/hooks/useNotificationsData';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface Category {
  key:   ListingCategory | null;
  label: string;
  icon?: IoniconsName;
  image?: ImageSourcePropType;
}

const CATEGORIES: Category[] = [
  { key: null,       label: 'All',       icon: 'grid-outline'       },
  { key: 'sale',     label: 'Buy',       image: require('../../assets/categories/buy-brand.png') },
  { key: 'lease',    label: 'Lease',     image: require('../../assets/categories/lease-brand.png') },
  { key: 'distress', label: 'Distress Sale', image: require('../../assets/categories/distress-sale-brand.png') },
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
  const { data: apiListings, isLoading: listingsLoading, refetch } = useListings();
  const [refreshing, setRefreshing] = useState(false);
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const unreadCount = useUnreadCount();

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
  const firstName    = user?.firstName ?? '';
  const greeting     = user ? `WELCOME BACK, ${firstName.toUpperCase()}` : 'LANDRUSH MARKETPLACE';
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
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.appName} numberOfLines={1}>Find land with confidence</Text>
        </View>
        <View style={styles.topBarRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
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
            <Ionicons name="search" size={16} color={colors.fixedWhite} />
          </View>
          <View style={styles.searchText}>
            <Text style={styles.searchPlaceholder}>{searchQuery || 'Search by location, size, or listing type'}</Text>
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
              <View style={[
                styles.catIconBox,
                cat.image != null && styles.catImageBox,
                active && (cat.image != null ? styles.catImageBoxActive : styles.catIconBoxActive),
              ]}>
                {cat.image ? (
                  <Image source={cat.image} style={styles.catImage} resizeMode="cover" />
                ) : (
                  <Ionicons name={cat.icon!} size={22} color={active ? colors.white : colors.textSecondary} />
                )}
              </View>
              <Text style={[styles.catLabel, active && styles.catLabelActive]}>{cat.label}</Text>
              {active && <View style={styles.catUnderline} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.trustRow}>
        <View style={styles.trustItem}>
          <Ionicons name="shield-checkmark-outline" size={15} color={colors.success} />
          <Text style={styles.trustText}>Verified agents</Text>
        </View>
        <View style={styles.trustDivider} />
        <View style={styles.trustItem}>
          <Ionicons name="document-text-outline" size={15} color={colors.primary} />
          <Text style={styles.trustText}>Document visibility</Text>
        </View>
      </View>

      {/* ── Section: latest ─────────────────────────────── */}
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>
          {activeCategory
            ? CATEGORIES.find((c) => c.key === activeCategory)?.label + ' listings'
            : 'New to the market'}
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
      <TouchableOpacity style={styles.mapBanner} onPress={() => router.push('/explore-location' as any)} activeOpacity={0.88}>
        <View style={styles.mapBannerLeft}>
          <Ionicons name="location-outline" size={26} color={colors.lime} />
          <View>
            <Text style={styles.mapBannerTitle}>Explore by location</Text>
            <Text style={styles.mapBannerSub}>Compare {filteredListings.length} available opportunities</Text>
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
            <Text style={styles.sectionTitle}>Selected for you</Text>
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
    greeting: { fontSize: 10, color: colors.primary, fontWeight: '800', letterSpacing: 1.1 },
    appName: { fontSize: FontSize.xl, fontFamily: FontFamily.extraBold, fontWeight: '800', color: colors.textPrimary, letterSpacing: LetterSpacing.tight, marginTop: 4 },
    topBarRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', position: 'relative' },
    notificationBadge: {
      position: 'absolute', top: -3, right: -4, minWidth: 17, height: 17,
      paddingHorizontal: 4, borderRadius: 9, alignItems: 'center', justifyContent: 'center',
      backgroundColor: colors.primary, borderWidth: 2, borderColor: colors.white,
    },
    notificationBadgeText: { color: colors.fixedWhite, fontSize: 9, fontWeight: '800' },
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
    catRow: { paddingHorizontal: Spacing.lg, gap: Spacing.lg, paddingBottom: Spacing.md },
    catItem: { alignItems: 'center', gap: 6, width: 72 },
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
    catImageBox: {
      overflow: 'hidden',
      backgroundColor: colors.white,
      borderColor: 'transparent',
    },
    catImageBoxActive: {
      borderColor: colors.textPrimary,
    },
    catImage: {
      width: '100%',
      height: '100%',
    },
    catLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '600', textAlign: 'center' },
    catLabelActive: { color: colors.textPrimary, fontWeight: '700' },
    catUnderline: { width: 20, height: 2, borderRadius: 1, backgroundColor: colors.textPrimary, marginTop: -2 },
    trustRow: {
      marginHorizontal: Spacing.lg,
      marginTop: Spacing.sm,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.lg,
      backgroundColor: colors.surface,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.md,
    },
    trustItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    trustText: { fontSize: 10, color: colors.textSecondary, fontWeight: '700' },
    trustDivider: { width: 1, height: 18, backgroundColor: colors.border },

    // Sections
    sectionHead: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.xl,
      paddingBottom: Spacing.md,
    },
    sectionTitle: { fontSize: FontSize.xl, fontFamily: FontFamily.extraBold, fontWeight: '800', color: colors.textPrimary, letterSpacing: LetterSpacing.snug },
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
      borderColor: colors.borderLight,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.white,
      ...Shadow.sm,
    },
    mapBannerLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    mapBannerTitle: { fontSize: FontSize.md, fontWeight: '700', color: colors.textPrimary },
    mapBannerSub: { fontSize: FontSize.xs, color: colors.textSecondary, marginTop: 2 },

    divider: { height: 8, backgroundColor: colors.surface, marginTop: Spacing.lg },

    vList: { paddingHorizontal: Spacing.lg },
  });
}
