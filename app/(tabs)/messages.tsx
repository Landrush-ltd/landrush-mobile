import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, FontSize, FontFamily, BorderRadius, Shadow, LetterSpacing } from '../../src/constants/theme';
import type { ThemeColors } from '../../src/constants/theme';
import { useColors } from '../../src/context/ThemeContext';
import {
  mockConversations,
  formatMessageTime,
} from '../../src/services/mockChatData';
import type { Conversation } from '../../src/types/chat';


export default function MessagesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const filtered = mockConversations.filter(
    (c) =>
      c.agentName.toLowerCase().includes(search.toLowerCase()) ||
      c.listingTitle.toLowerCase().includes(search.toLowerCase()),
  );

  const totalUnread = mockConversations.reduce((n, c) => n + c.unreadCount, 0);

  const renderItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() =>
        router.push({
          pathname: '/chat/[conversationId]',
          params: { conversationId: item.id },
        })
      }
      activeOpacity={0.85}
    >
      {/* Avatar + online dot */}
      <View style={styles.avatarWrap}>
        <Image source={{ uri: item.agentAvatar }} style={styles.avatar} />
        {item.agentOnline && <View style={styles.onlineDot} />}
      </View>

      {/* Content */}
      <View style={styles.rowContent}>
        <View style={styles.rowTop}>
          <Text style={styles.rowName} numberOfLines={1}>{item.agentName}</Text>
          <Text style={styles.rowTime}>{formatMessageTime(item.lastMessageAt)}</Text>
        </View>
        <Text style={styles.rowListing} numberOfLines={1}>{item.listingTitle}</Text>
        <View style={styles.rowBottom}>
          <Text
            style={[styles.rowMsg, item.unreadCount > 0 && styles.rowMsgUnread]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      {/* White header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Text style={styles.headerTitle}>Messages</Text>
        {totalUnread > 0 && (
          <Text style={styles.headerSub}>{totalUnread} unread</Text>
        )}
      </View>

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color={colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search conversations…"
            placeholderTextColor={colors.textTertiary}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={48} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptySub}>
              Message an agent from any listing to start chatting
            </Text>
          </View>
        }
      />
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.white,
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    headerTitle: {
      fontSize: FontSize.xxl,
      fontFamily: FontFamily.extraBold,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: LetterSpacing.tight,
      marginBottom: 2,
    },
    headerSub: {
      fontSize: FontSize.sm,
      color: colors.textSecondary,
    },
    searchWrap: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.lg,
      backgroundColor: colors.white,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      height: 44,
      backgroundColor: colors.background,
      borderRadius: BorderRadius.xl,
      paddingHorizontal: Spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: {
      flex: 1,
      fontSize: FontSize.md,
      color: colors.textPrimary,
    },
    list: {
      paddingBottom: 100,
      backgroundColor: colors.white,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.lg,
      gap: Spacing.md,
      backgroundColor: colors.white,
    },
    avatarWrap: {
      position: 'relative',
    },
    avatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
    },
    onlineDot: {
      position: 'absolute',
      bottom: 1,
      right: 1,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.success,
      borderWidth: 2,
      borderColor: colors.white,
    },
    rowContent: {
      flex: 1,
      gap: 2,
    },
    rowTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    rowName: {
      flex: 1,
      fontSize: FontSize.md,
      fontWeight: '700',
      color: colors.textPrimary,
      marginRight: Spacing.sm,
    },
    rowTime: {
      fontSize: FontSize.xs,
      color: colors.textTertiary,
    },
    rowListing: {
      fontSize: FontSize.xs,
      color: colors.primary,
      fontWeight: '500',
    },
    rowBottom: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    rowMsg: {
      flex: 1,
      fontSize: FontSize.sm,
      color: colors.textSecondary,
      marginRight: Spacing.sm,
    },
    rowMsgUnread: {
      color: colors.textPrimary,
      fontWeight: '600',
    },
    badge: {
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.lime,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 5,
    },
    badgeText: {
      fontSize: FontSize.xs,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    separator: {
      height: 1,
      backgroundColor: colors.borderLight,
      marginLeft: 52 + Spacing.lg + Spacing.md,
    },
    empty: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 80,
      paddingHorizontal: Spacing.xxl,
      gap: Spacing.md,
    },
    emptyTitle: {
      fontSize: FontSize.xl,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    emptySub: {
      fontSize: FontSize.md,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
  });
}
