import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../src/constants/theme';
import { SearchBar } from '../../src/components/SearchBar';
import { CategoryChip } from '../../src/components/CategoryChip';
import { mockListings } from '../../src/services/mockData';
import type { ListingCategory, Listing } from '../../src/types/listing';

const categories: { key: ListingCategory | null; label: string; color: string }[] = [
  { key: null, label: 'All', color: Colors.primary },
  { key: 'lease', label: 'Lease', color: Colors.lease },
  { key: 'sale', label: 'Buy', color: Colors.sale },
  { key: 'distress', label: 'Distress Sale', color: Colors.distress },
];

const legendItems = [
  { color: Colors.sale, label: 'Buy' },
  { color: Colors.lease, label: 'Lease' },
  { color: Colors.distress, label: 'Distress sale' },
];

export default function MapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState<ListingCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const filteredListings = activeCategory
    ? mockListings.filter((l) => l.category === activeCategory)
    : mockListings;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Text style={styles.title}>Map</Text>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by location, area, or landmark"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((cat) => (
          <CategoryChip
            key={cat.label}
            label={cat.label}
            isActive={activeCategory === cat.key}
            color={cat.color}
            onPress={() => setActiveCategory(cat.key)}
          />
        ))}
      </ScrollView>

      <View style={styles.mapPlaceholder}>
        <Ionicons name="map" size={64} color={Colors.textTertiary} />
        <Text style={styles.mapPlaceholderText}>
          Map view with {filteredListings.length} listings
        </Text>
        <Text style={styles.mapSubtext}>
          Google Maps will render here with color-coded pins
        </Text>

        <View style={styles.legend}>
          {legendItems.map((item) => (
            <View key={item.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {selectedListing && (
        <View style={styles.bottomSheet}>
          <View style={styles.bottomSheetHandle} />
          <View style={styles.listingPreview}>
            <Image
              source={{ uri: selectedListing.media[0]?.uri }}
              style={styles.previewImage}
            />
            <View style={styles.previewContent}>
              <Text style={styles.previewTitle}>{selectedListing.title}</Text>
              <Text style={styles.previewLocation}>{selectedListing.location}</Text>
              <Text style={styles.previewPrice}>
                {'\u20A6'}{selectedListing.price.toLocaleString()}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.viewDetailsButton}
            onPress={() => router.push(`/listing/${selectedListing.id}`)}
          >
            <Text style={styles.viewDetailsText}>View Details</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  categoriesContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8E5DD',
    margin: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  mapPlaceholderText: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  mapSubtext: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
  },
  legend: {
    flexDirection: 'row',
    gap: Spacing.xl,
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    ...Shadow.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    paddingBottom: 40,
    ...Shadow.lg,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  listingPreview: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  previewImage: {
    width: 100,
    height: 80,
    borderRadius: BorderRadius.md,
  },
  previewContent: {
    flex: 1,
    justifyContent: 'center',
  },
  previewTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  previewLocation: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  previewPrice: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 4,
  },
  viewDetailsButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.white,
  },
});
