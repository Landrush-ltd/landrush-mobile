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
import { mockListings } from '../../src/services/mockData';
import type { Listing, ListingCategory } from '../../src/types/listing';

const categories: { key: ListingCategory | null; label: string; color: string }[] = [
  { key: null, label: 'All', color: Colors.primary },
  { key: 'lease', label: 'Lease', color: Colors.lease },
  { key: 'sale', label: 'Buy', color: Colors.sale },
  { key: 'distress', label: 'Distress Sale', color: Colors.distress },
];

export default function DiscoverScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    filteredListings,
    activeCategory,
    searchQuery,
    setListings,
    setActiveCategory,
    setSearchQuery,
  } = useListingsStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setListings(mockListings);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setListings(mockListings);
      setRefreshing(false);
    }, 1000);
  };

  const handleListingPress = (listing: Listing) => {
    router.push(`/listing/${listing.id}`);
  };

  const verifiedListings = filteredListings.filter((l) => l.agent.isVerified);
  const recommendedListings = filteredListings;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.primary}
        />
      }
    >
      <View style={[styles.topBar, { paddingTop: insets.top + Spacing.sm }]}>
        <View>
          <Text style={styles.title}>Home</Text>
          <Text style={styles.locationSubtitle}>Uyo, Nigeria</Text>
        </View>
        <View style={styles.topBarRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatarButton}>
            <Image
              source={{ uri: 'https://i.pravatar.cc/150?img=11' }}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>
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

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Verified Listings</Text>
        <TouchableOpacity style={styles.seeAllButton}>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
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
        contentContainerStyle={styles.horizontalList}
        scrollEnabled={true}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recommended Near you</Text>
        <TouchableOpacity style={styles.seeAllButton}>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.recommendedList}>
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
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  locationSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  categoriesContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
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
  seeAllButton: {
    padding: Spacing.xs,
  },
  horizontalList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  recommendedList: {
    paddingHorizontal: Spacing.lg,
  },
});
