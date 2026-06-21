import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants/theme';
import { ListingCard } from '../../src/components/ListingCard';
import { mockListings } from '../../src/services/mockData';
import type { ListingCategory, Listing } from '../../src/types/listing';

const priceRanges = [
  { label: '₦0 – ₦1M', min: 0, max: 1000000 },
  { label: '₦1M – ₦5M', min: 1000000, max: 5000000 },
  { label: '₦5M – ₦10M', min: 5000000, max: 10000000 },
  { label: '₦10M+', min: 10000000, max: Infinity },
];

const listingTypes: { key: ListingCategory; label: string }[] = [
  { key: 'lease', label: 'Lease' },
  { key: 'sale', label: 'Buy' },
  { key: 'distress', label: 'Distress Sale' },
];

const unitOptions = ['Plot', 'Acres', 'Hectares'];

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ListingCategory | null>(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);
  const [minSize, setMinSize] = useState('');
  const [maxSize, setMaxSize] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  const filteredListings = mockListings.filter((listing) => {
    if (selectedType && listing.category !== selectedType) return false;
    if (selectedPriceRange !== null) {
      const range = priceRanges[selectedPriceRange];
      if (listing.price < range.min || listing.price > range.max) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !listing.title.toLowerCase().includes(q) &&
        !listing.location.toLowerCase().includes(q) &&
        !listing.state.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const handleClearFilters = () => {
    setSelectedType(null);
    setSelectedPriceRange(null);
    setMinSize('');
    setMaxSize('');
    setSelectedUnit(null);
    setShowResults(false);
  };

  const handleShowResults = () => {
    setShowResults(true);
  };

  const handleListingPress = (listing: Listing) => {
    router.push(`/listing/${listing.id}`);
  };

  if (showResults) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.resultsHeader}>
          <TouchableOpacity onPress={() => setShowResults(false)}>
            <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.resultsSearchBar}>
            <Ionicons name="search-outline" size={18} color={Colors.textTertiary} />
            <Text style={styles.resultsSearchText}>{searchQuery || 'All listings'}</Text>
          </View>
        </View>
        <Text style={styles.resultsCount}>
          {filteredListings.length} Listings Found
        </Text>
        <FlatList
          data={filteredListings}
          renderItem={({ item }) => (
            <ListingCard listing={item} onPress={handleListingPress} variant="vertical" />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search" size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyText}>No listings match your filters</Text>
            </View>
          }
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Search</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color={Colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by location, area, or landmark"
            placeholderTextColor={Colors.textTertiary}
          />
        </View>

        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>Filter section</Text>
          <TouchableOpacity onPress={handleClearFilters}>
            <Text style={styles.clearText}>Clear filter</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.filterLabel}>Listing Type</Text>
        <View style={styles.chipRow}>
          {listingTypes.map((type) => (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.filterChip,
                selectedType === type.key && styles.filterChipActive,
              ]}
              onPress={() =>
                setSelectedType(selectedType === type.key ? null : type.key)
              }
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedType === type.key && styles.filterChipTextActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.filterLabel}>Price Range</Text>
        <View style={styles.chipRow}>
          {priceRanges.map((range, index) => (
            <TouchableOpacity
              key={range.label}
              style={[
                styles.filterChip,
                selectedPriceRange === index && styles.filterChipActive,
              ]}
              onPress={() =>
                setSelectedPriceRange(selectedPriceRange === index ? null : index)
              }
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedPriceRange === index && styles.filterChipTextActive,
                ]}
              >
                {range.label}
              </Text>
              {selectedPriceRange === index && (
                <Ionicons name="checkmark" size={14} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.filterLabel}>Land Size</Text>
        <View style={styles.sizeInputRow}>
          <TextInput
            style={styles.sizeInput}
            value={minSize}
            onChangeText={setMinSize}
            placeholder="Enter Min size"
            placeholderTextColor={Colors.textTertiary}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.sizeInput}
            value={maxSize}
            onChangeText={setMaxSize}
            placeholder="Enter Max size"
            placeholderTextColor={Colors.textTertiary}
            keyboardType="numeric"
          />
        </View>

        <Text style={styles.filterLabel}>Unit</Text>
        <View style={styles.chipRow}>
          {unitOptions.map((unit) => (
            <TouchableOpacity
              key={unit}
              style={[
                styles.filterChip,
                selectedUnit === unit && styles.filterChipActive,
              ]}
              onPress={() => setSelectedUnit(selectedUnit === unit ? null : unit)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedUnit === unit && styles.filterChipTextActive,
                ]}
              >
                {unit}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
        <TouchableOpacity style={styles.showResultsButton} onPress={handleShowResults}>
          <Text style={styles.showResultsText}>Show Results</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  filterTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  clearText: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: '600',
  },
  filterLabel: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.chipActive,
  },
  filterChipText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  sizeInputRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  sizeInput: {
    flex: 1,
    height: 48,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  showResultsButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  showResultsText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.white,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  resultsSearchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  resultsSearchText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  resultsCount: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  resultsList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.huge,
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textTertiary,
  },
});
