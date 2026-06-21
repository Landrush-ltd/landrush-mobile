import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../constants/theme';
import { formatFullPrice } from '../utils/format';
import type { Listing } from '../types/listing';

interface ListingCardProps {
  listing: Listing;
  onPress: (listing: Listing) => void;
  variant?: 'horizontal' | 'vertical';
}

const categoryBadgeColors: Record<string, string> = {
  lease: Colors.lease,
  sale: Colors.sale,
  distress: Colors.distress,
};

const categoryLabels: Record<string, string> = {
  lease: 'Lease',
  sale: 'Buy',
  distress: 'Distress Sale',
};

const landTypeLabels: Record<string, string> = {
  lease: 'Agricultural',
  sale: 'Residential',
  distress: 'Commercial',
};

export function ListingCard({ listing, onPress, variant = 'horizontal' }: ListingCardProps) {
  const imageUri = listing.media[0]?.uri;
  const badgeColor = categoryBadgeColors[listing.category] || Colors.primary;

  if (variant === 'horizontal') {
    return (
      <TouchableOpacity
        style={styles.horizontalCard}
        onPress={() => onPress(listing)}
        activeOpacity={0.9}
      >
        <View style={styles.horizontalImageContainer}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.horizontalImage} />
          ) : (
            <View style={[styles.horizontalImage, styles.placeholderImage]}>
              <Ionicons name="image-outline" size={32} color={Colors.textTertiary} />
            </View>
          )}
          <View style={[styles.categoryBadge, { backgroundColor: badgeColor }]}>
            <Text style={styles.categoryText}>{categoryLabels[listing.category]}</Text>
          </View>
          {listing.agent.isVerified && (
            <View style={styles.verifiedDot}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
            </View>
          )}
          <View style={styles.priceOverlay}>
            <Text style={styles.priceOverlayText}>
              {'\u20A6'}{listing.price.toLocaleString()}
            </Text>
          </View>
        </View>
        <View style={styles.horizontalContent}>
          <Text style={styles.horizontalTitle} numberOfLines={1}>
            {listing.title}
          </Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={12} color={Colors.textTertiary} />
            <Text style={styles.locationText} numberOfLines={1}>
              {listing.location}
            </Text>
          </View>
          <Text style={styles.sizeText}>
            {listing.size} {listing.sizeUnit.charAt(0).toUpperCase() + listing.sizeUnit.slice(1)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.verticalCard}
      onPress={() => onPress(listing)}
      activeOpacity={0.9}
    >
      <View style={styles.verticalImageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.verticalImage} />
        ) : (
          <View style={[styles.verticalImage, styles.placeholderImage]}>
            <Ionicons name="image-outline" size={40} color={Colors.textTertiary} />
          </View>
        )}
        <View style={[styles.categoryBadge, { backgroundColor: badgeColor }]}>
          <Text style={styles.categoryText}>{landTypeLabels[listing.category]}</Text>
        </View>
        {listing.agent.isVerified && (
          <View style={styles.verifiedDotVertical}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
          </View>
        )}
        <View style={styles.priceOverlayVertical}>
          <Text style={styles.priceOverlayText}>
            {'\u20A6'}{listing.price.toLocaleString()}
          </Text>
        </View>
      </View>
      <View style={styles.verticalContent}>
        <View style={styles.titleSizeRow}>
          <Text style={styles.verticalTitle} numberOfLines={1}>
            {listing.title}
          </Text>
          <Text style={styles.verticalSize}>
            {listing.size} {listing.sizeUnit.charAt(0).toUpperCase() + listing.sizeUnit.slice(1)}
          </Text>
        </View>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={12} color={Colors.textTertiary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {listing.location}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  horizontalCard: {
    width: 180,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.md,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  horizontalImageContainer: {
    position: 'relative',
    height: 130,
  },
  horizontalImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  categoryText: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  verifiedDot: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: 10,
  },
  verifiedDotVertical: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: 12,
  },
  priceOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderTopRightRadius: BorderRadius.sm,
  },
  priceOverlayVertical: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderTopRightRadius: BorderRadius.sm,
  },
  priceOverlayText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  horizontalContent: {
    padding: Spacing.md,
    gap: 2,
  },
  horizontalTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationText: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    flex: 1,
  },
  sizeText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  verticalCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  verticalImageContainer: {
    position: 'relative',
    height: 180,
  },
  verticalImage: {
    width: '100%',
    height: '100%',
  },
  verticalContent: {
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  titleSizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verticalTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  verticalSize: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },
});
