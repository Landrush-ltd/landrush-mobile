import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../src/constants/theme';
import { ListingCard } from '../../src/components/ListingCard';
import { mockListings } from '../../src/services/mockData';
import type { Listing, ListingCategory } from '../../src/types/listing';

const HERO_BG = '#003828';

const CATEGORIES: { key: ListingCategory | null; label: string }[] = [
  { key: null,       label: 'All' },
  { key: 'sale',     label: 'Buy' },
  { key: 'lease',    label: 'Lease' },
  { key: 'distress', label: 'Distress' },
];

const SIZE_OPTIONS = ['Any', 'Under 1 Plot', '1–5 Plots', '5–10 Plots', '10+ Plots'];
const SORT_OPTIONS = ['Newest', 'Price: Low to High', 'Price: High to Low', 'Most Reviewed'];

const POPULAR_SEARCHES = [
  'Uyo GRA', 'Lekki', 'Abuja FCT', 'Ikot Ekpene', 'Port Harcourt', 'Ibadan',
];

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ListingCategory | null>(null);
  const [sizeFilter, setSizeFilter] = useState('Any');
  const [sortBy, setSortBy] = useState('Newest');
  const [showFilters, setShowFilters] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const results = useMemo(() => {
    if (!hasSearched && !query) return [];
    return mockListings.filter((l) => {
      const matchesQ =
        !query ||
        l.title.toLowerCase().includes(query.toLowerCase()) ||
        l.location.toLowerCase().includes(query.toLowerCase());
      const matchesCat = !category || l.category === category;
      return matchesQ && matchesCat;
    });
  }, [query, category, hasSearched]);

  const activeFilterCount = [
    category !== null,
    sizeFilter !== 'Any',
    sortBy !== 'Newest',
  ].filter(Boolean).length;

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <View style={styles.headerDecoA} />

        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Search Land</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Search input */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color={Colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={(t) => { setQuery(t); if (t) setHasSearched(true); }}
              placeholder="Location, landmark, area…"
              placeholderTextColor={Colors.textTertiary}
              returnKeyType="search"
              onSubmitEditing={() => setHasSearched(true)}
              autoFocus
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => { setQuery(''); setHasSearched(false); }}>
                <Ionicons name="close-circle" size={16} color={Colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="options-outline" size={18} color={activeFilterCount > 0 ? Colors.textPrimary : Colors.white} />
            {activeFilterCount > 0 && (
              <View style={styles.filterDot}>
                <Text style={styles.filterDotText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Category pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catRow}
        >
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={String(c.key)}
              style={[styles.catPill, category === c.key && styles.catPillActive]}
              onPress={() => { setCategory(c.key); setHasSearched(true); }}
            >
              <Text style={[styles.catPillText, category === c.key && styles.catPillTextActive]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Body */}
      {!hasSearched ? (
        <ScrollView style={styles.body} contentContainerStyle={styles.emptyBody}>
          <View style={styles.suggestSection}>
            <Text style={styles.suggestTitle}>Popular Searches</Text>
            <View style={styles.suggestWrap}>
              {POPULAR_SEARCHES.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={styles.suggestChip}
                  onPress={() => { setQuery(s); setHasSearched(true); }}
                >
                  <Ionicons name="search-outline" size={13} color={Colors.primary} />
                  <Text style={styles.suggestChipText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.suggestSection}>
            <Text style={styles.suggestTitle}>Browse by Type</Text>
            {CATEGORIES.filter((c) => c.key !== null).map((c) => (
              <TouchableOpacity
                key={String(c.key)}
                style={styles.browseRow}
                onPress={() => { setCategory(c.key); setHasSearched(true); }}
              >
                <View style={styles.browseIcon}>
                  <Ionicons
                    name={c.key === 'sale' ? 'home-outline' : c.key === 'lease' ? 'leaf-outline' : 'flash-outline'}
                    size={18}
                    color={Colors.primary}
                  />
                </View>
                <Text style={styles.browseLabel}>{c.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.body}>
          {/* Results header */}
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              {results.length} result{results.length !== 1 ? 's' : ''}
              {query ? ` for "${query}"` : ''}
            </Text>
            <TouchableOpacity style={styles.sortBtn} onPress={() => setShowFilters(true)}>
              <Ionicons name="swap-vertical-outline" size={14} color={Colors.primary} />
              <Text style={styles.sortBtnText}>{sortBy}</Text>
            </TouchableOpacity>
          </View>

          {results.length === 0 ? (
            <View style={styles.noResults}>
              <Ionicons name="search-outline" size={48} color={Colors.textTertiary} />
              <Text style={styles.noResultsTitle}>No listings found</Text>
              <Text style={styles.noResultsSub}>Try a different location or remove some filters</Text>
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={() => { setQuery(''); setCategory(null); setSizeFilter('Any'); setHasSearched(false); }}
              >
                <Text style={styles.clearBtnText}>Clear filters</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ListingCard
                  listing={item}
                  onPress={(l: Listing) => router.push(`/listing/${l.id}`)}
                  variant="vertical"
                />
              )}
              contentContainerStyle={styles.resultsList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      )}

      {/* Filter modal */}
      <Modal visible={showFilters} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.filterSheet}>
            <View style={styles.filterSheetHandle} />
            <View style={styles.filterSheetHeader}>
              <Text style={styles.filterSheetTitle}>Filters</Text>
              <TouchableOpacity
                onPress={() => { setCategory(null); setSizeFilter('Any'); setSortBy('Newest'); }}
              >
                <Text style={styles.filterResetText}>Reset</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.filterSectionTitle}>Category</Text>
              <View style={styles.filterPills}>
                {CATEGORIES.map((c) => (
                  <TouchableOpacity
                    key={String(c.key)}
                    style={[styles.filterPill, category === c.key && styles.filterPillActive]}
                    onPress={() => setCategory(c.key)}
                  >
                    <Text style={[styles.filterPillText, category === c.key && styles.filterPillTextActive]}>
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterSectionTitle}>Plot Size</Text>
              <View style={styles.filterPills}>
                {SIZE_OPTIONS.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.filterPill, sizeFilter === s && styles.filterPillActive]}
                    onPress={() => setSizeFilter(s)}
                  >
                    <Text style={[styles.filterPillText, sizeFilter === s && styles.filterPillTextActive]}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterSectionTitle}>Sort By</Text>
              {SORT_OPTIONS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={styles.sortOptionRow}
                  onPress={() => setSortBy(s)}
                >
                  <Text style={styles.sortOptionText}>{s}</Text>
                  {sortBy === s && (
                    <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}

              <View style={{ height: 20 }} />
            </ScrollView>

            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => { setShowFilters(false); setHasSearched(true); }}
            >
              <Text style={styles.applyBtnText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: HERO_BG,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    overflow: 'hidden',
  },
  headerDecoA: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(159,187,68,0.07)',
    top: -60,
    right: -40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.white,
  },
  searchRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    height: 46,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  filterBtn: {
    width: 46,
    height: 46,
    borderRadius: BorderRadius.xl,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterBtnActive: {
    backgroundColor: Colors.lime,
  },
  filterDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterDotText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.white,
  },
  catRow: {
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  catPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  catPillActive: {
    backgroundColor: Colors.lime,
    borderColor: Colors.lime,
  },
  catPillText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  catPillTextActive: {
    color: Colors.textPrimary,
  },
  body: {
    flex: 1,
  },
  emptyBody: {
    padding: Spacing.lg,
    gap: Spacing.xl,
  },
  suggestSection: {
    gap: Spacing.md,
  },
  suggestTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  suggestWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  suggestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  suggestChipText: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  browseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  browseIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: `${Colors.lime}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  browseLabel: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  resultsCount: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
  resultsList: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  noResults: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.xxl,
    paddingTop: 60,
  },
  noResultsTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  noResultsSub: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  clearBtn: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.lime,
  },
  clearBtnText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  filterSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  filterSheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  filterSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  filterSheetTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  filterResetText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.primary,
  },
  filterSectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
    marginTop: Spacing.xl,
  },
  filterPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  filterPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  filterPillActive: {
    borderColor: Colors.lime,
    backgroundColor: `${Colors.lime}18`,
  },
  filterPillText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterPillTextActive: {
    color: Colors.primary,
  },
  sortOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  sortOptionText: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  applyBtn: {
    backgroundColor: Colors.lime,
    height: 52,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  applyBtnText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
