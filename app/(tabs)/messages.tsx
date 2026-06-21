import React, { useState } from 'react';
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
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../src/constants/theme';
import {
  mockConversations,
  formatMessageTime,
} from '../../src/services/mockChatData';
import type { Conversation } from '../../src/types/chat';

const HERO_BG = '#003828';

export default function MessagesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

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
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <View style={styles.headerDecoA} />
        <View style={styles.headerDecoB} />
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Messages</Text>
            {totalUnread > 0 && (
              <Text style={styles.headerSub}>{totalUnread} unread conversation{totalUnread > 1 ? 's' : ''}</Text>
            )}
          </View>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Ionicons name="create-outline" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color={Colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search conversations…"
            placeholderTextColor={Colors.textTertiary}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={Colors.textTertiary} />
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
            <Ionicons name="chatbubbles-outline" size={48} color={Colors.textTertiary} />
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: HERO_BG,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    overflow: 'hidden',
  },
  headerDecoA: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(159,187,68,0.07)',
    top: -70,
    right: -50,
  },
  headerDecoB: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(159,187,68,0.05)',
    bottom: -20,
    left: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.white,
  },
  headerSub: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    height: 44,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  list: {
    paddingBottom: 100,
    backgroundColor: Colors.white,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
    backgroundColor: Colors.white,
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
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.white,
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
    color: Colors.textPrimary,
    marginRight: Spacing.sm,
  },
  rowTime: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
  },
  rowListing: {
    fontSize: FontSize.xs,
    color: Colors.primary,
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
    color: Colors.textSecondary,
    marginRight: Spacing.sm,
  },
  rowMsgUnread: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.borderLight,
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
    color: Colors.textPrimary,
  },
  emptySub: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
