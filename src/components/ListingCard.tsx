import { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../constants/theme';
import type { Listing } from '../types/listing';

interface ListingCardProps {
  listing: Listing;
  onPress: (listing: Listing) => void;
  variant?: 'horizontal' | 'vertical';
}

const CATEGORY_COLOR: Record<string, string> = {
  lease:    Colors.lease,
  sale:     Colors.sale,
  distress: Colors.distress,
};
const CATEGORY_LABEL: Record<string, string> = {
  lease:    'Lease',
  sale:     'Buy',
  distress: 'Distress',
};

function formatPrice(p: number) {
  if (p >= 1_000_000_000) return `₦${(p / 1_000_000_000).toFixed(1)}B`;
  if (p >= 1_000_000)     return `₦${(p / 1_000_000).toFixed(1)}M`;
  return `₦${(p / 1_000).toFixed(0)}K`;
}

export function ListingCard({ listing, onPress, variant = 'horizontal' }: ListingCardProps) {
  const [saved, setSaved] = useState(false);
  const imageUri = listing.media[0]?.uri;
  const price    = formatPrice(listing.price);

  // ── Airbnb-style horizontal card (info BELOW image, no overlay text) ──
  if (variant === 'horizontal') {
    return (
      <TouchableOpacity style={styles.hCard} onPress={() => onPress(listing)} activeOpacity={0.88}>
        {/* Photo */}
        <View style={styles.hPhotoWrap}>
          {imageUri
            ? <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            : <View style={[StyleSheet.absoluteFill, styles.photoPlaceholder]}>
                <Ionicons name="image-outline" size={28} color={Colors.textTertiary} />
              </View>
          }
          {/* Save heart — only overlay on photo */}
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={(e) => { e.stopPropagation?.(); setSaved((s) => !s); }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name={saved ? 'heart' : 'heart-outline'} size={18} color={saved ? '#E31C5F' : Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Info — clean white section below photo */}
        <View style={styles.hInfo}>
          <View style={styles.hTitleRow}>
            <Text style={styles.hTitle} numberOfLines={1}>{listing.location}</Text>
            <View style={[styles.catDot, { backgroundColor: CATEGORY_COLOR[listing.category] }]} />
          </View>
          <Text style={styles.hSubtitle} numberOfLines={1}>{listing.title}</Text>
          <View style={styles.hPriceRow}>
            <Text style={styles.hPrice}>{price}</Text>
            {listing.priceUnit && <Text style={styles.hPriceUnit}> / {listing.priceUnit}</Text>}
            {listing.agent.isVerified && (
              <View style={styles.hVerified}>
                <Ionicons name="checkmark-circle" size={11} color={Colors.lime} />
                <Text style={styles.hVerifiedText}>Verified</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // ── Airbnb-style vertical / full-width card ──
  return (
    <TouchableOpacity style={styles.vCard} onPress={() => onPress(listing)} activeOpacity={0.88}>
      {/* Photo */}
      <View style={styles.vPhotoWrap}>
        {imageUri
          ? <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          : <View style={[StyleSheet.absoluteFill, styles.photoPlaceholder]}>
              <Ionicons name="image-outline" size={40} color={Colors.textTertiary} />
            </View>
        }
        {/* Category pill — top left */}
        <View style={[styles.catPill, { backgroundColor: CATEGORY_COLOR[listing.category] }]}>
          <Text style={styles.catPillText}>{CATEGORY_LABEL[listing.category]}</Text>
        </View>
        {/* Save */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={(e) => { e.stopPropagation?.(); setSaved((s) => !s); }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name={saved ? 'heart' : 'heart-outline'} size={20} color={saved ? '#E31C5F' : Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={styles.vInfo}>
        <View style={styles.vTitleRow}>
          <Text style={styles.vLocation} numberOfLines={1}>{listing.location}</Text>
          {listing.agent.isVerified && (
            <View style={styles.starRow}>
              <Ionicons name="star" size={11} color="#222" />
              <Text style={styles.starText}>{listing.agent.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
        <Text style={styles.vTitle} numberOfLines={1}>{listing.title}</Text>
        <View style={styles.vMeta}>
          <Text style={styles.vSize}>{listing.size} {listing.sizeUnit}</Text>
        </View>
        <Text style={styles.vPrice}>
          <Text style={styles.vPriceBold}>{price}</Text>
          {listing.priceUnit ? <Text style={styles.vPriceUnit}> / {listing.priceUnit}</Text> : null}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  photoPlaceholder: {
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
  },
  catDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 3,
  },
  catPill: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  catPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.3,
  },

  // ── Horizontal card ──
  hCard: {
    width: 220,
    marginRight: Spacing.md,
    backgroundColor: Colors.white,
  },
  hPhotoWrap: {
    height: 160,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    marginBottom: Spacing.sm,
  },
  hInfo: {
    gap: 3,
    paddingHorizontal: 2,
  },
  hTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  hTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  hSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  hPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  hPrice: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  hPriceUnit: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  hVerified: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: 4,
  },
  hVerifiedText: {
    fontSize: 9,
    color: Colors.lime,
    fontWeight: '600',
  },

  // ── Vertical card ──
  vCard: {
    marginBottom: Spacing.xxl,
    backgroundColor: Colors.white,
  },
  vPhotoWrap: {
    height: 240,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    marginBottom: Spacing.sm,
  },
  vInfo: {
    gap: 3,
    paddingHorizontal: 2,
  },
  vTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vLocation: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  starText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  vTitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  vMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vSize: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  vPrice: {
    fontSize: FontSize.md,
    marginTop: 2,
  },
  vPriceBold: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  vPriceUnit: {
    fontWeight: '400',
    color: Colors.textSecondary,
  },
});
