import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, FontSize, FontFamily, BorderRadius, Shadow } from '../../src/constants/theme';
import type { ThemeColors } from '../../src/constants/theme';
import { useColors } from '../../src/context/ThemeContext';
import { useMyListings } from '../../src/hooks/useListings';
import type { Listing } from '../../src/types/listing';

type FilterStatus = 'all' | 'available' | 'taken' | 'closed';

export default function ListingsManager() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { data: myListings = [] } = useMyListings();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter listings
  const filteredListings = myListings.filter((listing) => {
    const matchesStatus = filterStatus === 'all' || listing.status === filterStatus;
    const matchesSearch =
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.state.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleEditListing = (listing: Listing) => {
    router.push({
      pathname: '/agent/edit-listing',
      params: { listingId: listing.id },
    });
  };

  const handleDeleteListing = (listing: Listing) => {
    Alert.alert(
      'Delete Listing',
      `Are you sure you want to delete "${listing.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Call delete mutation from useListings
            Alert.alert('Success', 'Listing deleted');
          },
        },
      ]
    );
  };

  const handleShareListing = (listing: Listing) => {
    // TODO: Implement social sharing
    Alert.alert('Share', `Sharing: ${listing.title}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return colors.lime;
      case 'taken':
        return colors.orange;
      case 'closed':
        return colors.red;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Active';
      case 'taken':
        return 'Taken';
      case 'closed':
        return 'Closed';
      default:
        return status;
    }
  };

  return (
    <View style={styles.root}>
      {/* ── Header ─────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Listings</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* ── Search ─────────────────────────────────────────── */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search listings..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* ── Filters ────────────────────────────────────────── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
        <View style={styles.filtersContainer}>
          {(['all', 'available', 'taken', 'closed'] as FilterStatus[]).map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                filterStatus === status && styles.filterButtonActive,
                filterStatus === status && { backgroundColor: colors.primary },
              ]}
              onPress={() => setFilterStatus(status)}
            >
              <Text
                style={[
                  styles.filterText,
                  filterStatus === status && { color: colors.white },
                ]}
              >
                {status === 'all' ? 'All' : getStatusLabel(status)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* ── Listings List ──────────────────────────────────── */}
      <FlatList
        data={filteredListings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.listingCard}>
            {/* Image */}
            {item.media?.[0] && (
              <Image
                source={{ uri: item.media[0].uri }}
                style={styles.listingImage}
              />
            )}

            {/* Status Badge */}
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            >
              <Text style={styles.statusBadgeText}>{getStatusLabel(item.status)}</Text>
            </View>

            {/* Content */}
            <View style={styles.listingContent}>
              <Text style={styles.listingTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.listingLocation}>
                <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                {' '}
                {item.location}
              </Text>

              <View style={styles.listingMeta}>
                <Text style={styles.listingPrice}>
                  ₦{item.price.toLocaleString()}
                </Text>
                <View style={styles.metaRight}>
                  <Ionicons name="eye-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.metaText}>{item.viewCount || 0}</Text>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
                  onPress={() => handleEditListing(item)}
                >
                  <Ionicons name="pencil-outline" size={18} color={colors.primary} />
                  <Text style={[styles.actionText, { color: colors.primary }]}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.lime + '20' }]}
                  onPress={() => handleShareListing(item)}
                >
                  <Ionicons name="share-social-outline" size={18} color={colors.lime} />
                  <Text style={[styles.actionText, { color: colors.lime }]}>Share</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.red + '20' }]}
                  onPress={() => handleDeleteListing(item)}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.red} />
                  <Text style={[styles.actionText, { color: colors.red }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={64} color={colors.border} />
            <Text style={styles.emptyTitle}>No Listings Found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try a different search' : 'Post your first listing to get started'}
            </Text>
          </View>
        }
      />

      {/* ── Bottom Action ──────────────────────────────────── */}
      {myListings.length > 0 && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/(tabs)/create')}
        >
          <Ionicons name="add" size={28} color={colors.white} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// Add TextInput import at the top
import { TextInput } from 'react-native';

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.md,
    },
    headerTitle: {
      fontSize: FontSize.lg,
      fontFamily: FontFamily.bold,
      color: colors.text,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      marginHorizontal: Spacing.lg,
      marginBottom: Spacing.md,
      paddingHorizontal: Spacing.md,
      borderRadius: BorderRadius.md,
      ...Shadow.xs,
    },
    searchInput: {
      flex: 1,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.sm,
      fontSize: FontSize.sm,
      color: colors.text,
    },
    filtersScroll: {
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.md,
    },
    filtersContainer: {
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    filterButton: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterButtonActive: {
      borderColor: colors.primary,
    },
    filterText: {
      fontSize: FontSize.xs,
      fontFamily: FontFamily.semibold,
      color: colors.text,
    },
    listContent: {
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.lg,
    },
    listingCard: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.lg,
      overflow: 'hidden',
      marginBottom: Spacing.md,
      ...Shadow.sm,
    },
    listingImage: {
      width: '100%',
      height: 180,
      backgroundColor: colors.border,
    },
    statusBadge: {
      position: 'absolute',
      top: Spacing.md,
      right: Spacing.md,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.full,
    },
    statusBadgeText: {
      fontSize: FontSize.xs,
      fontFamily: FontFamily.semibold,
      color: colors.white,
    },
    listingContent: {
      padding: Spacing.md,
    },
    listingTitle: {
      fontSize: FontSize.md,
      fontFamily: FontFamily.bold,
      color: colors.text,
      marginBottom: Spacing.xs,
    },
    listingLocation: {
      fontSize: FontSize.xs,
      fontFamily: FontFamily.regular,
      color: colors.textSecondary,
      marginBottom: Spacing.sm,
    },
    listingMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.md,
      paddingTop: Spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    listingPrice: {
      fontSize: FontSize.md,
      fontFamily: FontFamily.bold,
      color: colors.primary,
    },
    metaRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
    },
    metaText: {
      fontSize: FontSize.xs,
      fontFamily: FontFamily.regular,
      color: colors.textSecondary,
    },
    actions: {
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.md,
      gap: Spacing.xs,
    },
    actionText: {
      fontSize: FontSize.xs,
      fontFamily: FontFamily.semibold,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.xl * 2,
    },
    emptyTitle: {
      fontSize: FontSize.lg,
      fontFamily: FontFamily.bold,
      color: colors.text,
      marginTop: Spacing.lg,
      marginBottom: Spacing.xs,
    },
    emptySubtitle: {
      fontSize: FontSize.sm,
      fontFamily: FontFamily.regular,
      color: colors.textSecondary,
    },
    fab: {
      position: 'absolute',
      bottom: Spacing.lg,
      right: Spacing.lg,
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      ...Shadow.md,
    },
  });
