import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../src/constants/theme';
import { mockListings } from '../src/services/mockData';
import type { Listing } from '../src/types/listing';


const CATEGORY_COLOR: Record<string, string> = {
  sale:     Colors.primary,
  lease:    Colors.lease,
  distress: Colors.distress,
};

export default function SavedListingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [saved, setSaved] = useState<Listing[]>(mockListings.slice(0, 3));

  const handleUnsave = (id: string) =>
    setSaved((prev) => prev.filter((l) => l.id !== id));

  const Header = () => (
    <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
      <View style={styles.headerDecoA} />
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.title}>Saved Listings</Text>
          <Text style={styles.subtitle}>{saved.length} saved</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{saved.length}</Text>
        </View>
      </View>
    </View>
  );

  if (saved.length === 0) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="bookmark-outline" size={44} color={Colors.textTertiary} />
          </View>
          <Text style={styles.emptyTitle}>Nothing saved yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap the bookmark icon on any listing to save it here for later.
          </Text>
          <TouchableOpacity style={styles.discoverBtn} onPress={() => router.push('/(tabs)')}>
            <Text style={styles.discoverBtnText}>Discover Listings</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />

      <FlatList
        data={saved}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => router.push(`/listing/${item.id}`)}
          >
            <Image source={{ uri: item.media[0]?.uri }} style={styles.cardImage} />
            <View style={styles.cardBody}>
              <View style={styles.cardTop}>
                <View
                  style={[
                    styles.categoryPill,
                    { backgroundColor: `${CATEGORY_COLOR[item.category]}18` },
                  ]}
                >
                  <Text
                    style={[styles.categoryText, { color: CATEGORY_COLOR[item.category] }]}
                  >
                    {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.savedBtn}
                  onPress={() => handleUnsave(item.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="bookmark" size={18} color={Colors.primary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={13} color={Colors.textTertiary} />
                <Text style={styles.infoText} numberOfLines={1}>{item.location}</Text>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.price}>₦{item.price.toLocaleString()}</Text>
                <Text style={styles.size}>{item.size} {item.sizeUnit}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListFooterComponent={<View style={{ height: Spacing.huge }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerDecoA: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'transparent',
    top: -60,
    right: -40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.white,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  countBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  list: {
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  cardImage: {
    width: '100%',
    height: 160,
  },
  cardBody: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  categoryText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  savedBtn: {
    padding: 4,
  },
  cardTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  price: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.primary,
  },
  size: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxxl,
    gap: Spacing.md,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.chipInactive,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  discoverBtn: {
    backgroundColor: Colors.lime,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
  },
  discoverBtnText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
