import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

function formatPrice(price: number) {
  if (price >= 1_000_000_000) return `₦${(price / 1_000_000_000).toFixed(1)}B`;
  if (price >= 1_000_000)     return `₦${(price / 1_000_000).toFixed(1)}M`;
  return `₦${(price / 1_000).toFixed(0)}K`;
}

export function ListingCard({ listing, onPress, variant = 'horizontal' }: ListingCardProps) {
  const [saved, setSaved] = useState(false);
  const imageUri    = listing.media[0]?.uri;
  const badgeColor  = CATEGORY_COLOR[listing.category] ?? Colors.primary;
  const priceLabel  = formatPrice(listing.price);

  if (variant === 'horizontal') {
    return (
      <TouchableOpacity style={styles.hCard} onPress={() => onPress(listing)} activeOpacity={0.9}>
        {/* Image */}
        <View style={styles.hImageWrap}>
          {imageUri
            ? <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            : <View style={[StyleSheet.absoluteFill, styles.imgPlaceholder]}>
                <Ionicons name="image-outline" size={28} color={Colors.textTertiary} />
              </View>
          }

          {/* Gradient overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.72)']}
            style={styles.hGradient}
          />

          {/* Category badge */}
          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            <Text style={styles.badgeText}>{CATEGORY_LABEL[listing.category]}</Text>
          </View>

          {/* Save button */}
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={(e) => { e.stopPropagation?.(); setSaved((s) => !s); }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={saved ? 'bookmark' : 'bookmark-outline'}
              size={15}
              color={saved ? Colors.lime : Colors.white}
            />
          </TouchableOpacity>

          {/* Price pill at bottom */}
          <View style={styles.hPricePill}>
            <Text style={styles.hPriceText}>{priceLabel}</Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.hBody}>
          <Text style={styles.hTitle} numberOfLines={2}>{listing.title}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={11} color={Colors.textTertiary} />
            <Text style={styles.metaText} numberOfLines={1}>{listing.location}</Text>
          </View>
          <View style={styles.hFooter}>
            <View style={styles.chip}>
              <Ionicons name="expand-outline" size={10} color={Colors.primary} />
              <Text style={styles.chipText}>{listing.size} {listing.sizeUnit}</Text>
            </View>
            {listing.agent.isVerified && (
              <View style={styles.verifiedChip}>
                <Ionicons name="checkmark-circle" size={11} color={Colors.primary} />
                <Text style={styles.verifiedChipText}>Verified</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // ── Vertical card ─────────────────────────────────────────────
  return (
    <TouchableOpacity style={styles.vCard} onPress={() => onPress(listing)} activeOpacity={0.9}>
      <View style={styles.vImageWrap}>
        {imageUri
          ? <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          : <View style={[StyleSheet.absoluteFill, styles.imgPlaceholder]}>
              <Ionicons name="image-outline" size={40} color={Colors.textTertiary} />
            </View>
        }

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.78)']}
          style={styles.vGradient}
        />

        {/* Category badge */}
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>{CATEGORY_LABEL[listing.category]}</Text>
        </View>

        {/* Save */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={(e) => { e.stopPropagation?.(); setSaved((s) => !s); }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={saved ? 'bookmark' : 'bookmark-outline'}
            size={15}
            color={saved ? Colors.lime : Colors.white}
          />
        </TouchableOpacity>

        {/* Bottom-left: price + priceUnit */}
        <View style={styles.vBottomLeft}>
          <Text style={styles.vPrice}>{priceLabel}</Text>
          {listing.priceUnit && (
            <Text style={styles.vPriceUnit}> / {listing.priceUnit}</Text>
          )}
        </View>

        {/* Bottom-right: verified */}
        {listing.agent.isVerified && (
          <View style={styles.vVerified}>
            <Ionicons name="checkmark-circle" size={12} color={Colors.lime} />
            <Text style={styles.vVerifiedText}>Verified</Text>
          </View>
        )}
      </View>

      <View style={styles.vBody}>
        <Text style={styles.vTitle} numberOfLines={1}>{listing.title}</Text>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={12} color={Colors.textTertiary} />
          <Text style={styles.metaText} numberOfLines={1}>{listing.location}</Text>
        </View>

        <View style={styles.vFooterRow}>
          <View style={styles.chip}>
            <Ionicons name="expand-outline" size={10} color={Colors.primary} />
            <Text style={styles.chipText}>{listing.size} {listing.sizeUnit}</Text>
          </View>

          <View style={styles.agentRow}>
            <Image source={{ uri: listing.agent.avatar }} style={styles.agentAvatar} />
            <Text style={styles.agentName} numberOfLines={1}>{listing.agent.name}</Text>
            <Ionicons name="star" size={11} color="#F9A825" />
            <Text style={styles.ratingText}>{listing.agent.rating.toFixed(1)}</Text>
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

  // ── Shared ────────────────────────────────────────────────────
  badge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  saveBtn: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.38)',
    alignItems: 'center',
    justifyContent: 'center',
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
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: `${Colors.lime}1A`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  chipText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '600',
  },
  verifiedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: `${Colors.primary}12`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  verifiedChipText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '600',
  },

  // ── Horizontal card ──────────────────────────────────────────
  hCard: {
    width: 220,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    marginRight: Spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.md,
  },
  hImageWrap: {
    height: 150,
    position: 'relative',
    backgroundColor: Colors.borderLight,
  },
  hGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
  },
  hPricePill: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: Colors.lime,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  hPriceText: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  hBody: {
    padding: Spacing.md,
    gap: 5,
  },
  hTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  hFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 2,
  },

  // ── Vertical card ─────────────────────────────────────────────
  vCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.md,
  },
  vImageWrap: {
    height: 200,
    position: 'relative',
    backgroundColor: Colors.borderLight,
  },
  vGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 110,
  },
  vBottomLeft: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  vPrice: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.white,
  },
  vPriceUnit: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  vVerified: {
    position: 'absolute',
    bottom: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.42)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  vVerifiedText: {
    fontSize: 10,
    color: Colors.white,
    fontWeight: '600',
  },
  vBody: {
    padding: Spacing.lg,
    gap: 6,
  },
  vTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  vFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  agentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  agentAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  agentName: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    maxWidth: 80,
  },
  ratingText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
