import React from 'react';
import { View, Text, StyleSheet, Modal, Image, TouchableOpacity } from 'react-native';
import Animated, {
  FadeIn,
  ZoomIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../context/ThemeContext';
import { Spacing, FontSize, FontFamily, BorderRadius, Shadow } from '../constants/theme';
import type { Listing } from '../types/listing';

interface LongPressPreviewProps {
  listing: Listing | null;
  visible: boolean;
  onDismiss: () => void;
  onPress?: (listing: Listing) => void;
}

export function LongPressPreview({
  listing,
  visible,
  onDismiss,
  onPress,
}: LongPressPreviewProps) {
  const colors = useColors();

  if (!listing) return null;

  const price = listing.price >= 1_000_000
    ? `₦${(listing.price / 1_000_000).toFixed(1)}M`
    : `₦${(listing.price / 1_000).toFixed(0)}K`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
    >
      {/* Backdrop */}
      <TouchableOpacity
        style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.4)' }]}
        onPress={onDismiss}
        activeOpacity={1}
      />

      {/* Preview Card */}
      <Animated.View
        entering={ZoomIn.springify().damping(12).mass(0.8)}
        style={[
          styles.previewContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            onPress?.(listing);
            onDismiss();
          }}
          activeOpacity={0.9}
        >
          {/* Image */}
          <View style={styles.imageWrap}>
            {listing.media[0]?.uri ? (
              <Image
                source={{ uri: listing.media[0].uri }}
                style={styles.image}
              />
            ) : (
              <View style={[styles.image, { backgroundColor: colors.border }]}>
                <Ionicons
                  name="image-outline"
                  size={40}
                  color={colors.textTertiary}
                />
              </View>
            )}
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
              {listing.title}
            </Text>

            <View style={styles.metaRow}>
              <Ionicons name="location" size={14} color={colors.primary} />
              <Text
                style={[styles.location, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {listing.location}, {listing.state}
              </Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={[styles.price, { color: colors.primary }]}>
                {price}
              </Text>
              <Text style={[styles.size, { color: colors.textSecondary }]}>
                {listing.size} {listing.sizeUnit}
              </Text>
            </View>

            {/* Agent */}
            {listing.agent && (
              <View style={styles.agentRow}>
                <View
                  style={[
                    styles.agentAvatar,
                    { backgroundColor: colors.lime },
                  ]}
                >
                  <Text style={styles.agentInitials}>
                    {listing.agent.name.charAt(0)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.agentName, { color: colors.textPrimary }]}
                  >
                    {listing.agent.name}
                  </Text>
                  {listing.agent.isVerified && (
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="shield-checkmark" size={12} color={colors.success} />
                      <Text style={[styles.verifiedText, { color: colors.success }]}>
                        Verified
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>

          {/* CTA Button */}
          <View
            style={[
              styles.ctaButton,
              { backgroundColor: colors.primary },
            ]}
          >
            <Text style={styles.ctaText}>View Details</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.white} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  imageWrap: {
    width: '100%',
    height: 280,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  title: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.bold,
    fontWeight: '700',
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  location: {
    fontSize: FontSize.sm,
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: FontSize.xl,
    fontFamily: FontFamily.extraBold,
    fontWeight: '800',
  },
  size: {
    fontSize: FontSize.sm,
  },
  agentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  agentAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  agentInitials: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.bold,
    fontWeight: '700',
    color: '#222',
  },
  agentName: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.semiBold,
    fontWeight: '600',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 4,
  },
  verifiedText: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.semiBold,
    fontWeight: '600',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  ctaText: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.semiBold,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
