import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, FontSize, FontFamily, BorderRadius } from '../src/constants/theme';
import type { ThemeColors } from '../src/constants/theme';
import { useColors } from '../src/context/ThemeContext';
import { useListings } from '../src/hooks/useListings';
import { ListingCard } from '../src/components/ListingCard';

export default function StateListingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { state } = useLocalSearchParams<{ state: string }>();
  const { data: allListings = [], isLoading } = useListings();

  const listings = useMemo(
    () => allListings.filter((l) => l.state === state),
    [allListings, state],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>{state} State</Text>
          <Text style={styles.subtitle}>
            {isLoading ? 'Loading…' : `${listings.length} listing${listings.length !== 1 ? 's' : ''} available`}
          </Text>
        </View>
      </View>

      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ListingCard
            listing={item}
            onPress={() => router.push(`/listing/${item.id}` as any)}
          />
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="map-outline" size={44} color={colors.textTertiary} />
              </View>
              <Text style={styles.emptyTitle}>No listings in {state}</Text>
              <Text style={styles.emptySubtitle}>
                Be the first to list land here or check back later.
              </Text>
              <TouchableOpacity
                style={styles.browseBtn}
                onPress={() => router.back()}
              >
                <Text style={styles.browseBtnText}>Browse other states</Text>
              </TouchableOpacity>
            </View>
          ) : null
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
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
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
    list: {
      padding: Spacing.lg,
      gap: Spacing.lg,
    },
    empty: {
      alignItems: 'center',
      paddingTop: 80,
      paddingHorizontal: Spacing.xxl,
      gap: Spacing.md,
    },
    emptyIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.sm,
    },
    emptyTitle: {
      fontSize: FontSize.lg,
      fontWeight: '700',
      color: colors.textPrimary,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: FontSize.md,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    browseBtn: {
      marginTop: Spacing.md,
      paddingHorizontal: Spacing.xxl,
      paddingVertical: Spacing.md,
      backgroundColor: colors.primary,
      borderRadius: BorderRadius.xl,
    },
    browseBtnText: {
      fontSize: FontSize.md,
      fontWeight: '700',
      color: '#fff',
    },
  });
}
