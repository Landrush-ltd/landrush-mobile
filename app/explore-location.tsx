import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, FontSize, FontFamily, BorderRadius, Shadow } from '../src/constants/theme';
import type { ThemeColors } from '../src/constants/theme';
import { useColors } from '../src/context/ThemeContext';
import { useListings } from '../src/hooks/useListings';

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
  'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
  'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa',
  'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
  'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

const STATE_COLORS = [
  '#2D6A4F', '#40916C', '#E88A2E', '#1565C0', '#7B1FA2',
  '#E47C18', '#C62828', '#00838F', '#558B2F', '#4527A0',
];

function getStateColor(state: string): string {
  let hash = 0;
  for (let i = 0; i < state.length; i++) hash = state.charCodeAt(i) + ((hash << 5) - hash);
  return STATE_COLORS[Math.abs(hash) % STATE_COLORS.length];
}

export default function ExploreLocationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [query, setQuery] = useState('');
  const { data: allListings = [] } = useListings();

  const countByState = useMemo(() => {
    const map: Record<string, number> = {};
    allListings.forEach((l) => {
      const s = l.state;
      map[s] = (map[s] ?? 0) + 1;
    });
    return map;
  }, [allListings]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return NIGERIAN_STATES.filter((s) => s.toLowerCase().includes(q));
  }, [query]);

  // States with listings bubble to the top
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => (countByState[b] ?? 0) - (countByState[a] ?? 0));
  }, [filtered, countByState]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)' as any)}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Explore location</Text>
          <Text style={styles.subtitle}>Find land across Nigeria's states</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search state…"
          placeholderTextColor={colors.textTertiary}
          autoCapitalize="none"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(item) => item}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        renderItem={({ item: state }) => {
          const count = countByState[state] ?? 0;
          const color = getStateColor(state);
          return (
            <TouchableOpacity
              style={[styles.card, { borderLeftColor: color, borderLeftWidth: 4 }]}
              activeOpacity={0.75}
              onPress={() =>
                router.push({ pathname: '/state-listings', params: { state } } as any)
              }
            >
              <View style={[styles.iconCircle, { backgroundColor: `${color}18` }]}>
                <Ionicons name="location-outline" size={20} color={color} />
              </View>
              <Text style={styles.stateName} numberOfLines={1}>{state}</Text>
              {count > 0 ? (
                <View style={[styles.badge, { backgroundColor: color }]}>
                  <Text style={styles.badgeText}>{count} listing{count > 1 ? 's' : ''}</Text>
                </View>
              ) : (
                <Text style={styles.noListings}>No listings yet</Text>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={40} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No states match "{query}"</Text>
          </View>
        }
      />
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.lg,
    },
    backBtn: {
      width: 38,
      height: 38,
      borderRadius: BorderRadius.md,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerText: { flex: 1 },
    title: {
      fontSize: FontSize.xl,
      fontFamily: FontFamily.extraBold,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    subtitle: {
      fontSize: FontSize.sm,
      color: colors.textSecondary,
      marginTop: 2,
    },
    searchWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      marginHorizontal: Spacing.lg,
      marginBottom: Spacing.lg,
      height: 46,
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: colors.borderLight,
      paddingHorizontal: Spacing.lg,
    },
    searchInput: {
      flex: 1,
      fontSize: FontSize.md,
      color: colors.textPrimary,
    },
    grid: {
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.xxxl,
    },
    row: {
      gap: Spacing.md,
      marginBottom: Spacing.md,
    },
    card: {
      flex: 1,
      backgroundColor: colors.white,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      gap: Spacing.sm,
      ...Shadow.sm,
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stateName: {
      fontSize: FontSize.md,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    badge: {
      alignSelf: 'flex-start',
      paddingHorizontal: Spacing.sm,
      paddingVertical: 3,
      borderRadius: BorderRadius.full,
    },
    badgeText: {
      fontSize: FontSize.xs,
      fontWeight: '700',
      color: '#fff',
    },
    noListings: {
      fontSize: FontSize.xs,
      color: colors.textTertiary,
    },
    empty: {
      alignItems: 'center',
      paddingTop: 60,
      gap: Spacing.md,
    },
    emptyText: {
      fontSize: FontSize.md,
      color: colors.textSecondary,
    },
  });
}
