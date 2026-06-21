import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../src/constants/theme';
import { SearchBar } from '../../src/components/SearchBar';
import { CategoryChip } from '../../src/components/CategoryChip';
import { mockListings } from '../../src/services/mockData';
import type { ListingCategory, Listing } from '../../src/types/listing';

const categories: { key: ListingCategory | null; label: string; color: string }[] = [
  { key: null,        label: 'All',          color: Colors.primary  },
  { key: 'lease',     label: 'Lease',        color: Colors.lease    },
  { key: 'sale',      label: 'Buy',          color: Colors.sale     },
  { key: 'distress',  label: 'Distress Sale', color: Colors.distress },
];

const CATEGORY_COLOR: Record<string, string> = {
  sale:     Colors.sale,
  lease:    Colors.lease,
  distress: Colors.distress,
};

const legendItems = [
  { color: Colors.sale,     label: 'Buy' },
  { color: Colors.lease,    label: 'Lease' },
  { color: Colors.distress, label: 'Distress' },
];

// Nigeria centroid
const INITIAL_REGION = {
  latitude: 9.082,
  longitude: 8.6753,
  latitudeDelta: 8,
  longitudeDelta: 8,
};

export default function MapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const [activeCategory, setActiveCategory] = useState<ListingCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const filteredListings = mockListings.filter((l) => {
    if (activeCategory && l.category !== activeCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return l.title.toLowerCase().includes(q) || l.location.toLowerCase().includes(q);
    }
    return true;
  });

  const handleMarkerPress = (listing: Listing) => {
    setSelectedListing(listing);
    mapRef.current?.animateToRegion(
      {
        latitude: listing.coordinates.latitude,
        longitude: listing.coordinates.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      },
      400,
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={INITIAL_REGION}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {filteredListings.map((listing) => (
          <Marker
            key={listing.id}
            coordinate={{
              latitude: listing.coordinates.latitude,
              longitude: listing.coordinates.longitude,
            }}
            onPress={() => handleMarkerPress(listing)}
          >
            <View
              style={[
                styles.marker,
                { backgroundColor: CATEGORY_COLOR[listing.category] },
                selectedListing?.id === listing.id && styles.markerSelected,
              ]}
            >
              <Text style={styles.markerText}>
                ₦{listing.price >= 1_000_000
                  ? `${(listing.price / 1_000_000).toFixed(1)}M`
                  : `${(listing.price / 1000).toFixed(0)}K`}
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Overlay controls */}
      <View style={[styles.topOverlay, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={styles.searchRow}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by location or landmark"
          />
          <TouchableOpacity
            style={styles.locationBtn}
            onPress={() =>
              mapRef.current?.animateToRegion(INITIAL_REGION, 600)
            }
          >
            <Ionicons name="locate" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.chipsRow}>
          {categories.map((cat) => (
            <CategoryChip
              key={cat.label}
              label={cat.label}
              isActive={activeCategory === cat.key}
              color={cat.color}
              onPress={() => {
                setActiveCategory(cat.key);
                setSelectedListing(null);
              }}
            />
          ))}
        </View>
      </View>

      {/* Legend */}
      <View style={[styles.legend, { bottom: selectedListing ? 210 : Spacing.xxl }]}>
        {legendItems.map((item) => (
          <View key={item.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={styles.legendLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* Bottom sheet on marker tap */}
      {selectedListing && (
        <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + Spacing.lg }]}>
          <TouchableOpacity
            style={styles.closeSheet}
            onPress={() => setSelectedListing(null)}
          >
            <Ionicons name="close" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.listingPreview}>
            <Image
              source={{ uri: selectedListing.media[0]?.uri }}
              style={styles.previewImage}
            />
            <View style={styles.previewContent}>
              <View
                style={[
                  styles.categoryPill,
                  { backgroundColor: `${CATEGORY_COLOR[selectedListing.category]}20` },
                ]}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    { color: CATEGORY_COLOR[selectedListing.category] },
                  ]}
                >
                  {selectedListing.category.charAt(0).toUpperCase() +
                    selectedListing.category.slice(1)}
                </Text>
              </View>
              <Text style={styles.previewTitle} numberOfLines={2}>
                {selectedListing.title}
              </Text>
              <View style={styles.previewRow}>
                <Ionicons name="location-outline" size={13} color={Colors.textTertiary} />
                <Text style={styles.previewLocation} numberOfLines={1}>
                  {selectedListing.location}
                </Text>
              </View>
              <Text style={styles.previewPrice}>
                ₦{selectedListing.price.toLocaleString()}
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
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  locationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    ...Shadow.md,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  marker: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.white,
    ...Shadow.sm,
  },
  markerSelected: {
    transform: [{ scale: 1.15 }],
    borderColor: Colors.textPrimary,
  },
  markerText: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    color: Colors.white,
  },
  legend: {
    position: 'absolute',
    right: Spacing.lg,
    flexDirection: 'row',
    gap: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    ...Shadow.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
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
    ...Shadow.lg,
  },
  closeSheet: {
    alignSelf: 'flex-end',
    padding: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  listingPreview: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  previewImage: {
    width: 90,
    height: 90,
    borderRadius: BorderRadius.md,
  },
  previewContent: {
    flex: 1,
    gap: 4,
    justifyContent: 'center',
  },
  categoryPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  categoryPillText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  previewTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  previewLocation: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    flex: 1,
  },
  previewPrice: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.primary,
  },
  viewDetailsButton: {
    backgroundColor: Colors.lime,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
