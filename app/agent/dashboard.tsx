import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, FontSize, FontFamily, BorderRadius, Shadow } from '../../src/constants/theme';
import type { ThemeColors } from '../../src/constants/theme';
import { useColors } from '../../src/context/ThemeContext';
import { useMyListings } from '../../src/hooks/useListings';
import { useConversations } from '../../src/hooks/useConversations';

interface StatCard {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string | number;
  color: string;
}

export default function AgentDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { data: myListings = [] } = useMyListings();
  const { data: conversations = [] } = useConversations();

  // Calculate stats
  const activeListings = myListings.filter((l) => l.status === 'available').length;
  const totalListings = myListings.length;
  const unreadMessages = conversations.filter((c) => c.unreadCount > 0).length;
  const totalViews = myListings.reduce((sum, l) => sum + (l.viewCount || 0), 0);

  const stats: StatCard[] = [
    {
      icon: 'home-outline',
      label: 'Total Listings',
      value: totalListings,
      color: colors.lime,
    },
    {
      icon: 'checkmark-circle-outline',
      label: 'Active',
      value: activeListings,
      color: colors.primary,
    },
    {
      icon: 'eye-outline',
      label: 'Total Views',
      value: totalViews,
      color: colors.orange,
    },
    {
      icon: 'chatbubble-outline',
      label: 'New Messages',
      value: unreadMessages,
      color: colors.red,
    },
  ];

  const quickActions = [
    {
      id: 'post-listing',
      icon: 'add-circle-outline' as const,
      label: 'Post New Listing',
      onPress: () => router.push('/(tabs)/create'),
    },
    {
      id: 'manage-listings',
      icon: 'list-outline' as const,
      label: 'Manage Listings',
      onPress: () => router.push('/agent/listings-manager'),
    },
    {
      id: 'view-messages',
      icon: 'chatbubbles-outline' as const,
      label: 'Messages',
      onPress: () => router.push('/(tabs)/messages'),
    },
    {
      id: 'view-profile',
      icon: 'person-outline' as const,
      label: 'My Profile',
      onPress: () => router.push('/agent/profile'),
    },
  ];

  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      {/* ── Header ─────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Text style={styles.headerTitle}>Agent Dashboard</Text>
        <Text style={styles.headerSubtitle}>Manage your listings and grow your business</Text>
      </View>

      {/* ── Stats Grid ─────────────────────────────────────── */}
      <View style={styles.statsContainer}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: `${stat.color}15` }]}>
              <Ionicons name={stat.icon} size={24} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* ── Quick Actions ──────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionButton}
              onPress={action.onPress}
            >
              <View style={[styles.actionIconBg, { backgroundColor: colors.lime + '20' }]}>
                <Ionicons name={action.icon} size={28} color={colors.lime} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Recent Activity ────────────────────────────────── */}
      {myListings.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Listings</Text>
            <TouchableOpacity onPress={() => router.push('/agent/listings-manager')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            scrollEnabled={false}
            data={myListings.slice(0, 3)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.recentItem}>
                <View style={styles.recentInfo}>
                  <Text style={styles.recentTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.recentMeta}>
                    {item.state} • {item.status === 'available' ? 'Active' : 'Inactive'}
                  </Text>
                </View>
                <Text style={styles.recentPrice}>₦{item.price.toLocaleString()}</Text>
              </View>
            )}
          />
        </View>
      )}

      {/* ── Empty State ────────────────────────────────────── */}
      {myListings.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="home-outline" size={64} color={colors.border} />
          <Text style={styles.emptyTitle}>No Listings Yet</Text>
          <Text style={styles.emptySubtitle}>Start by posting your first property</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push('/(tabs)/create')}
          >
            <Text style={styles.emptyButtonText}>Post Listing</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: Spacing.xl }} />
    </ScrollView>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.lg,
    },
    headerTitle: {
      fontSize: FontSize.xl,
      fontFamily: FontFamily.bold,
      color: colors.text,
      marginBottom: Spacing.xs,
    },
    headerSubtitle: {
      fontSize: FontSize.sm,
      fontFamily: FontFamily.regular,
      color: colors.textSecondary,
    },
    statsContainer: {
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.xl,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    statCard: {
      width: '48%',
      backgroundColor: colors.card,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      marginBottom: Spacing.md,
      ...Shadow.sm,
    },
    statIconBg: {
      width: 48,
      height: 48,
      borderRadius: BorderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    statValue: {
      fontSize: FontSize.lg,
      fontFamily: FontFamily.bold,
      color: colors.text,
      marginBottom: Spacing.xs,
    },
    statLabel: {
      fontSize: FontSize.xs,
      fontFamily: FontFamily.regular,
      color: colors.textSecondary,
    },
    section: {
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.xl,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    sectionTitle: {
      fontSize: FontSize.lg,
      fontFamily: FontFamily.bold,
      color: colors.text,
    },
    viewAllText: {
      fontSize: FontSize.sm,
      fontFamily: FontFamily.semibold,
      color: colors.primary,
    },
    actionGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    actionButton: {
      width: '48%',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      marginBottom: Spacing.md,
      ...Shadow.sm,
    },
    actionIconBg: {
      width: 56,
      height: 56,
      borderRadius: BorderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    actionLabel: {
      fontSize: FontSize.xs,
      fontFamily: FontFamily.semibold,
      color: colors.text,
      textAlign: 'center',
    },
    recentItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.card,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.md,
      marginBottom: Spacing.sm,
      ...Shadow.xs,
    },
    recentInfo: {
      flex: 1,
      marginRight: Spacing.md,
    },
    recentTitle: {
      fontSize: FontSize.sm,
      fontFamily: FontFamily.semibold,
      color: colors.text,
      marginBottom: Spacing.xs,
    },
    recentMeta: {
      fontSize: FontSize.xs,
      fontFamily: FontFamily.regular,
      color: colors.textSecondary,
    },
    recentPrice: {
      fontSize: FontSize.sm,
      fontFamily: FontFamily.bold,
      color: colors.primary,
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
      marginBottom: Spacing.lg,
    },
    emptyButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.md,
    },
    emptyButtonText: {
      fontSize: FontSize.sm,
      fontFamily: FontFamily.semibold,
      color: colors.white,
    },
  });
