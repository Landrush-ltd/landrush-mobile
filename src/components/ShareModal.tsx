import { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSize, FontFamily, BorderRadius, Shadow } from '../constants/theme';
import type { ThemeColors } from '../constants/theme';
import { useColors } from '../context/ThemeContext';
import type { Listing } from '../types/listing';
import { SHARE_PLATFORMS } from '../services/shareService';

interface ShareModalProps {
  visible: boolean;
  listing: Listing;
  onClose: () => void;
}

export default function ShareModal({ visible, listing, onClose }: ShareModalProps) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [loading, setLoading] = useState(false);
  const [loadingPlatform, setLoadingPlatform] = useState<string | null>(null);

  const handleShare = async (platformId: string) => {
    try {
      setLoadingPlatform(platformId);
      const platform = SHARE_PLATFORMS.find((p) => p.id === platformId);

      if (!platform) return;

      await platform.handler(listing);
      Alert.alert('Success', `Shared to ${platform.name}`);
      onClose();
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setLoadingPlatform(null);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* ── Backdrop ─────────────────────────────────────── */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={0.7}
        onPress={onClose}
      />

      {/* ── Modal Content ────────────────────────────────── */}
      <View style={styles.modalContainer}>
        {/* ── Header ────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Share Listing</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* ── Listing Preview ───────────────────────────── */}
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle} numberOfLines={2}>
            {listing.title}
          </Text>
          <Text style={styles.previewPrice}>
            ₦{listing.price.toLocaleString()} {listing.priceUnit}
          </Text>
          <Text style={styles.previewLocation}>
            📍 {listing.location}, {listing.state}
          </Text>
        </View>

        {/* ── Share Platforms ───────────────────────────── */}
        <FlatList
          scrollEnabled={false}
          data={SHARE_PLATFORMS}
          keyExtractor={(item) => item.id}
          numColumns={3}
          columnWrapperStyle={styles.platformRow}
          contentContainerStyle={styles.platformsContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.platformButton}
              onPress={() => handleShare(item.id)}
              disabled={loadingPlatform !== null}
            >
              <View
                style={[
                  styles.platformIconBg,
                  { backgroundColor: item.color + '20' },
                ]}
              >
                {loadingPlatform === item.id ? (
                  <ActivityIndicator size="small" color={item.color} />
                ) : (
                  <Ionicons
                    name={item.icon as any}
                    size={28}
                    color={item.color}
                  />
                )}
              </View>
              <Text style={styles.platformName} numberOfLines={1}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* ── Copy Link Button ──────────────────────────── */}
        <TouchableOpacity
          style={[styles.copyButton, { backgroundColor: colors.primary }]}
          onPress={() =>
            handleShare('copy-link')
          }
        >
          <Ionicons name="copy-outline" size={20} color={colors.white} />
          <Text style={styles.copyButtonText}>Copy Link to Clipboard</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
      backgroundColor: colors.background,
      borderTopLeftRadius: BorderRadius.xl,
      borderTopRightRadius: BorderRadius.xl,
      paddingTop: Spacing.lg,
      paddingBottom: Spacing.lg,
      maxHeight: '80%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.lg,
    },
    headerTitle: {
      fontSize: FontSize.lg,
      fontFamily: FontFamily.bold,
      color: colors.text,
    },
    previewCard: {
      backgroundColor: colors.card,
      marginHorizontal: Spacing.lg,
      marginBottom: Spacing.lg,
      padding: Spacing.md,
      borderRadius: BorderRadius.lg,
      ...Shadow.sm,
    },
    previewTitle: {
      fontSize: FontSize.sm,
      fontFamily: FontFamily.bold,
      color: colors.text,
      marginBottom: Spacing.xs,
    },
    previewPrice: {
      fontSize: FontSize.md,
      fontFamily: FontFamily.bold,
      color: colors.primary,
      marginBottom: Spacing.xs,
    },
    previewLocation: {
      fontSize: FontSize.xs,
      fontFamily: FontFamily.regular,
      color: colors.textSecondary,
    },
    platformsContainer: {
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.lg,
    },
    platformRow: {
      justifyContent: 'space-between',
      marginBottom: Spacing.md,
    },
    platformButton: {
      width: '30%',
      alignItems: 'center',
    },
    platformIconBg: {
      width: 56,
      height: 56,
      borderRadius: BorderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.xs,
    },
    platformName: {
      fontSize: FontSize.xs,
      fontFamily: FontFamily.regular,
      color: colors.text,
      textAlign: 'center',
    },
    copyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.md,
      gap: Spacing.sm,
    },
    copyButtonText: {
      fontSize: FontSize.sm,
      fontFamily: FontFamily.semibold,
      color: colors.white,
    },
  });
