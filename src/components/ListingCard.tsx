import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
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

export function ListingCard({ listing, onPress, variant = 'horizontal' }: ListingCardProps) {
  const [saved, setSaved] = useState(false);
  const imageUri = listing.media[0]?.uri;
  const badgeColor = CATEGORY_COLOR[listing.category] ?? Colors.primary;

  const priceLabel = listing.price >= 1_000_000
    ? `₦${(listing.price / 1_000_000).toFixed(1)}M`
    : `₦${(listing.price / 1_000).toFixed(0)}K`;

  const SaveBtn = () => (
    <TouchableOpacity
      style={styles.saveIcon}
      onPress={(e) => { e.stopPropagation?.(); setSaved((s) => !s); }}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Ionicons
        name={saved ? 'bookmark' : 'bookmark-outline'}
        size={16}
        color={saved ? Colors.lime : Colors.white}
      />
    </TouchableOpacity>
  );

  if (variant === 'horizontal') {
    return (
      <TouchableOpacity style={styles.hCard} onPress={() => onPress(listing)} activeOpacity={0.92}>
        <View style={styles.hImageWrap}>
          {imageUri
            ? <Image source={{ uri: imageUri }} style={styles.hImage} />
            : <View style={[styles.hImage, styles.imgPlaceholder]}>
                <Ionicons name="image-outline" size={28} color={Colors.textTertiary} />
              </View>
          }
          {/* Gradient-like overlay at bottom */}
          <View style={styles.hOverlay} />

          {/* Category badge */}
          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            <Text style={styles.badgeText}>{CATEGORY_LABEL[listing.category]}</Text>
          </View>

          {/* Save icon */}
          <SaveBtn />

          {/* Price */}
          <Text style={styles.hPrice}>{priceLabel}</Text>

          {/* Verified tick */}
          {listing.agent.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={13} color={Colors.lime} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>

        <View style={styles.hBody}>
          <Text style={styles.hTitle} numberOfLines={2}>{listing.title}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={11} color={Colors.textTertiary} />
            <Text style={styles.metaText} numberOfLines={1}>{listing.location}</Text>
          </View>
          <View style={styles.hFooter}>
            <View style={styles.sizeChip}>
              <Ionicons name="expand-outline" size={11} color={Colors.primary} />
              <Text style={styles.sizeChipText}>
                {listing.size} {listing.sizeUnit}
              </Text>
            </View>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={11} color="#F9A825" />
              <Text style={styles.ratingText}>{listing.agent.rating.toFixed(1)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Vertical / full-width card
  return (
    <TouchableOpacity style={styles.vCard} onPress={() => onPress(listing)} activeOpacity={0.92}>
      <View style={styles.vImageWrap}>
        {imageUri
          ? <Image source={{ uri: imageUri }} style={styles.vImage} />
          : <View style={[styles.vImage, styles.imgPlaceholder]}>
              <Ionicons name="image-outline" size={40} color={Colors.textTertiary} />
            </View>
        }
        <View style={styles.vOverlay} />

        {/* Category badge */}
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>{CATEGORY_LABEL[listing.category]}</Text>
        </View>

        {/* Save icon */}
        <SaveBtn />

        {/* Price pill */}
        <View style={styles.vPricePill}>
          <Text style={styles.vPriceText}>{priceLabel}</Text>
          {listing.priceUnit ? (
            <Text style={styles.vPriceUnit}> / {listing.priceUnit}</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.vBody}>
        <View style={styles.vTitleRow}>
          <Text style={styles.vTitle} numberOfLines={1}>{listing.title}</Text>
          {listing.agent.isVerified && (
            <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
          )}
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={12} color={Colors.textTertiary} />
          <Text style={styles.metaText} numberOfLines={1}>{listing.location}</Text>
        </View>

        <View style={styles.vFooter}>
          <View style={styles.sizeChip}>
            <Ionicons name="expand-outline" size={11} color={Colors.primary} />
            <Text style={styles.sizeChipText}>
              {listing.size} {listing.sizeUnit}
            </Text>
          </View>

          <View style={styles.agentRow}>
            <Image source={{ uri: listing.agent.avatar }} style={styles.agentAvatar} />
            <Text style={styles.agentName} numberOfLines={1}>{listing.agent.name}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={11} color="#F9A825" />
              <Text style={styles.ratingText}>{listing.agent.rating.toFixed(1)}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  imgPlaceholder: {
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Horizontal card ──────────────────────────────────────────
  hCard: {
    width: 210,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    marginRight: Spacing.md,
    overflow: 'hidden',
    ...Shadow.md,
  },
  hImageWrap: {
    height: 140,
    position: 'relative',
  },
  hImage: {
    width: '100%',
    height: '100%',
  },
  hOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  hPrice: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.sm,
    fontSize: FontSize.md,
    fontWeight: '800',
    color: Colors.white,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  hBody: {
    padding: Spacing.md,
    gap: 4,
  },
  hTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  hFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },

  // ── Vertical card ─────────────────────────────────────────────
  vCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    ...Shadow.md,
  },
  vImageWrap: {
    height: 200,
    position: 'relative',
  },
  vImage: {
    width: '100%',
    height: '100%',
  },
  vOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
  vPricePill: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  vPriceText: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.white,
  },
  vPriceUnit: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },
  vBody: {
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  vTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  vTitle: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  vFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  agentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexShrink: 1,
  },
  agentAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  agentName: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    maxWidth: 80,
  },

  // ── Shared ────────────────────────────────────────────────────
  badge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  saveIcon: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  verifiedText: {
    fontSize: 9,
    color: Colors.white,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    flex: 1,
  },
  sizeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: `${Colors.lime}18`,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  sizeChipText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
