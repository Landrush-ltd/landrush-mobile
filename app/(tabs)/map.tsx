import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';

// react-native-maps is not supported on web
const IS_WEB = Platform.OS === 'web';
let MapView: any = null;
let Marker: any = null;
let PROVIDER_GOOGLE: any = null;
if (!IS_WEB) {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
  PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
}
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, FontSize, BorderRadius, Shadow } from '../../src/constants/theme';
import type { ThemeColors } from '../../src/constants/theme';
import { useColors } from '../../src/context/ThemeContext';
import { SearchBar } from '../../src/components/SearchBar';
import { CategoryChip } from '../../src/components/CategoryChip';
import { mockListings } from '../../src/services/mockData';
import type { ListingCategory, Listing } from '../../src/types/listing';

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
  const mapRef = useRef<any>(null);
  const [activeCategory, setActiveCategory] = useState<ListingCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const categories: { key: ListingCategory | null; label: string; color: string }[] = [
    { key: null,        label: 'All',          color: colors.primary  },
    { key: 'lease',     label: 'Lease',        color: colors.lease    },
    { key: 'sale',      label: 'Buy',          color: colors.sale     },
    { key: 'distress',  label: 'Distress Sale', color: colors.distress },
  ];

  const CATEGORY_COLOR: Record<string, string> = {
    sale:     colors.sale,
    lease:    colors.lease,
    distress: colors.distress,
  };

  const legendItems = [
    { color: colors.sale,     label: 'Buy' },
    { color: colors.lease,    label: 'Lease' },
    { color: colors.distress, label: 'Distress' },
  ];

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

  if (IS_WEB) {
    return (
      <View style={styles.webFallback}>
        <Ionicons name="map-outline" size={48} color={colors.textTertiary} />
        <Text style={styles.webFallbackTitle}>Map View</Text>
        <Text style={styles.webFallbackSub}>Map is available on the iOS and Android app.</Text>
      </View>
    );
  }

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
            <Ionicons name="locate" size={20} color={colors.primary} />
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
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{filteredListings.length} listed</Text>
          </View>
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
            <Ionicons name="close" size={20} color={colors.textSecondary} />
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
                <Ionicons name="location-outline" size={13} color={colors.textTertiary} />
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

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    webFallback: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      backgroundColor: colors.background,
    },
    webFallbackTitle: {
      fontSize: FontSize.xl,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    webFallbackSub: {
      fontSize: FontSize.md,
      color: colors.textSecondary,
      textAlign: 'center',
      paddingHorizontal: 40,
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
      backgroundColor: colors.white,
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
      borderColor: colors.white,
      ...Shadow.sm,
    },
    markerSelected: {
      transform: [{ scale: 1.15 }],
      borderColor: colors.textPrimary,
    },
    markerText: {
      fontSize: FontSize.xs,
      fontWeight: '800',
      color: colors.white,
    },
    countBadge: {
      backgroundColor: colors.white,
      paddingHorizontal: Spacing.md,
      paddingVertical: 6,
      borderRadius: BorderRadius.full,
      ...Shadow.sm,
      justifyContent: 'center',
    },
    countBadgeText: {
      fontSize: FontSize.xs,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    legend: {
      position: 'absolute',
      right: Spacing.lg,
      flexDirection: 'row',
      gap: Spacing.md,
      backgroundColor: colors.white,
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
      color: colors.textSecondary,
      fontWeight: '500',
    },
    bottomSheet: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.white,
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
      color: colors.textPrimary,
    },
    previewRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    previewLocation: {
      fontSize: FontSize.sm,
      color: colors.textTertiary,
      flex: 1,
    },
    previewPrice: {
      fontSize: FontSize.lg,
      fontWeight: '700',
      color: colors.primary,
    },
    viewDetailsButton: {
      backgroundColor: colors.lime,
      paddingVertical: Spacing.lg,
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
    },
    viewDetailsText: {
      fontSize: FontSize.lg,
      fontWeight: '700',
      color: colors.textPrimary,
    },
  });
}
