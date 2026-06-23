import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSize, BorderRadius, Shadow, LetterSpacing, FontFamily } from '../constants/theme';
import type { ThemeColors } from '../constants/theme';
import { useColors } from '../context/ThemeContext';
import type { Listing } from '../types/listing';

interface ListingCardProps {
  listing: Listing;
  onPress: (listing: Listing) => void;
  variant?: 'horizontal' | 'vertical';
}

const CATEGORY_LABEL: Record<string, string> = {
  lease:    'For lease',
  sale:     'For sale',
  distress: 'Distress',
};

function formatPrice(p: number) {
  if (p >= 1_000_000_000) return `₦${(p / 1_000_000_000).toFixed(1)}B`;
  if (p >= 1_000_000)     return `₦${(p / 1_000_000).toFixed(1)}M`;
  return `₦${(p / 1_000).toFixed(0)}K`;
}

export function ListingCard({ listing, onPress, variant = 'horizontal' }: ListingCardProps) {
  const [saved, setSaved] = useState(false);
  const colors   = useColors();
  const styles   = useMemo(() => makeStyles(colors), [colors]);
  const imageUri = listing.media[0]?.uri;
  const price    = formatPrice(listing.price);

  const catColor: Record<string, string> = {
    lease: colors.lease, sale: colors.sale, distress: colors.distress,
  };

  const Photo = ({ height, iconSize }: { height: number; iconSize: number }) => (
    <View style={[styles.photoWrap, { height }]}>
      {imageUri
        ? <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        : <View style={[StyleSheet.absoluteFill, styles.photoPlaceholder]}>
            <Ionicons name="image-outline" size={iconSize} color={colors.textTertiary} />
          </View>
      }
      <TouchableOpacity
        style={styles.saveBtn}
        onPress={(e) => { e.stopPropagation?.(); setSaved((s) => !s); }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name={saved ? 'heart' : 'heart-outline'} size={18} color={saved ? '#FF385C' : '#FFFFFF'} />
      </TouchableOpacity>
    </View>
  );

  // ── Compact horizontal card ──
  if (variant === 'horizontal') {
    return (
      <TouchableOpacity style={styles.hCard} onPress={() => onPress(listing)} activeOpacity={0.9}>
        <Photo height={150} iconSize={28} />
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.hTitle} numberOfLines={1}>{listing.location}</Text>
            {listing.agent.isVerified && (
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color={colors.textPrimary} />
                <Text style={styles.rating}>{listing.agent.rating.toFixed(1)}</Text>
              </View>
            )}
          </View>
          <Text style={styles.subtitle} numberOfLines={1}>{listing.title}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.hPrice}>{price}</Text>
            {listing.priceUnit ? <Text style={styles.priceUnit}> /{listing.priceUnit}</Text> : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // ── Full-width vertical card ──
  return (
    <TouchableOpacity style={styles.vCard} onPress={() => onPress(listing)} activeOpacity={0.9}>
      <View style={[styles.photoWrap, { height: 230 }]}>
        {imageUri
          ? <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          : <View style={[StyleSheet.absoluteFill, styles.photoPlaceholder]}>
              <Ionicons name="image-outline" size={40} color={colors.textTertiary} />
            </View>
        }
        <View style={[styles.catPill, { backgroundColor: catColor[listing.category] }]}>
          <Text style={styles.catPillText}>{CATEGORY_LABEL[listing.category]}</Text>
        </View>
        <TouchableOpacity
          style={styles.saveBtnCircle}
          onPress={(e) => { e.stopPropagation?.(); setSaved((s) => !s); }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name={saved ? 'heart' : 'heart-outline'} size={18} color={saved ? '#FF385C' : '#FFFFFF'} />
        </TouchableOpacity>
        <View style={styles.locPill}>
          <Ionicons name="location" size={12} color={colors.lime} />
          <Text style={styles.locPillText} numberOfLines={1}>{listing.location}</Text>
        </View>
      </View>

      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.vTitle} numberOfLines={1}>{listing.title}</Text>
          {listing.agent.isVerified && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={13} color={colors.textPrimary} />
              <Text style={styles.rating}>{listing.agent.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
        <Text style={styles.subtitle} numberOfLines={1}>{listing.size} {listing.sizeUnit} · Registered survey</Text>
        <View style={styles.priceRow}>
          <Text style={styles.vPrice}>{price}</Text>
          {listing.priceUnit && <Text style={styles.priceUnit}> /{listing.priceUnit}</Text>}
          {listing.agent.isVerified && (
            <View style={styles.verifiedPill}>
              <Ionicons name="shield-checkmark" size={12} color={colors.success} />
              <Text style={styles.verifiedText}>Verified agent</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    photoWrap: {
      borderRadius: BorderRadius.xl,
      overflow: 'hidden',
      backgroundColor: colors.surface,
      marginBottom: Spacing.md,
    },
    photoPlaceholder: { alignItems: 'center', justifyContent: 'center' },

    saveBtn: { position: 'absolute', top: Spacing.md, right: Spacing.md },
    saveBtnCircle: {
      position: 'absolute', top: Spacing.md, right: Spacing.md,
      width: 34, height: 34, borderRadius: 17,
      backgroundColor: 'rgba(0,0,0,0.32)',
      alignItems: 'center', justifyContent: 'center',
    },

    catPill: {
      position: 'absolute', top: Spacing.md, left: Spacing.md,
      paddingHorizontal: 11, paddingVertical: 5,
      borderRadius: BorderRadius.full,
    },
    catPillText: {
      fontSize: 11, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.2,
    },

    locPill: {
      position: 'absolute', bottom: Spacing.md, left: Spacing.md,
      flexDirection: 'row', alignItems: 'center', gap: 5,
      backgroundColor: 'rgba(0,0,0,0.45)',
      paddingHorizontal: 10, paddingVertical: 5,
      borderRadius: BorderRadius.full,
      maxWidth: '70%',
    },
    locPillText: { fontSize: 12, fontWeight: '600', color: '#FFFFFF' },

    info: { gap: 3, paddingHorizontal: 2 },
    titleRow: {
      flexDirection: 'row', alignItems: 'center',
      justifyContent: 'space-between', gap: Spacing.sm,
    },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, flexShrink: 0 },
    rating: { fontSize: FontSize.sm, fontWeight: '700', color: colors.textPrimary },

    subtitle: { fontSize: FontSize.sm, color: colors.textSecondary, fontWeight: '500' },
    priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    priceUnit: { fontSize: FontSize.sm, color: colors.textSecondary, fontWeight: '500' },

    // Horizontal
    hCard: { width: 230, marginRight: Spacing.lg },
    hTitle: {
      flex: 1, fontSize: FontSize.lg, fontFamily: FontFamily.bold, fontWeight: '700',
      color: colors.textPrimary, letterSpacing: LetterSpacing.snug,
    },
    hPrice: {
      fontSize: FontSize.lg, fontFamily: FontFamily.extraBold, fontWeight: '800',
      color: colors.textPrimary, letterSpacing: LetterSpacing.snug,
    },

    // Vertical
    vCard: { marginBottom: Spacing.xxl },
    vTitle: {
      flex: 1, fontSize: FontSize.lg, fontFamily: FontFamily.bold, fontWeight: '700',
      color: colors.textPrimary, letterSpacing: LetterSpacing.snug,
    },
    vPrice: {
      fontSize: FontSize.xl, fontFamily: FontFamily.extraBold, fontWeight: '800',
      color: colors.textPrimary, letterSpacing: LetterSpacing.tight,
    },
    verifiedPill: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      marginLeft: 'auto',
      backgroundColor: colors.chipActive,
      paddingHorizontal: 9, paddingVertical: 4,
      borderRadius: BorderRadius.full,
    },
    verifiedText: { fontSize: 11, fontWeight: '700', color: colors.success },
  });
}
