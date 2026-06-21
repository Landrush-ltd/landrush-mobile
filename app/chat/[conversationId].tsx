import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants/theme';
import {
  mockConversations,
  formatMessageTime,
} from '../../src/services/mockChatData';
import type { ChatMessage } from '../../src/types/chat';

const MY_ID = 'me';
const HERO_BG = '#003828';

function groupByDay(messages: ChatMessage[]): Array<{ type: 'date'; label: string } | { type: 'msg'; msg: ChatMessage }> {
  const result: Array<{ type: 'date'; label: string } | { type: 'msg'; msg: ChatMessage }> = [];
  let lastDate = '';
  messages.forEach((msg) => {
    const d = new Date(msg.createdAt);
    const label = d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
    if (label !== lastDate) {
      result.push({ type: 'date', label });
      lastDate = label;
    }
    result.push({ type: 'msg', msg });
  });
  return result;
}

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const sendBtnScale = useRef(new Animated.Value(1)).current;

  const conversation = mockConversations.find((c) => c.id === conversationId);
  const [messages, setMessages] = useState<ChatMessage[]>(conversation?.messages ?? []);
  const [draft, setDraft] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Simulate agent typing indicator after user sends a message
    if (isTyping) {
      const t = setTimeout(() => {
        const reply: ChatMessage = {
          id: `m-reply-${Date.now()}`,
          conversationId: conversationId ?? '',
          senderId: conversation?.agentId ?? 'agent',
          text: 'Thanks for your message! I\'ll get back to you shortly.',
          createdAt: new Date().toISOString(),
          status: 'delivered',
          type: 'text',
        };
        setMessages((prev) => [...prev, reply]);
        setIsTyping(false);
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [isTyping]);

  useEffect(() => {
    if (messages.length) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const handleSend = () => {
    if (!draft.trim()) return;

    Animated.sequence([
      Animated.timing(sendBtnScale, { toValue: 0.85, duration: 80, useNativeDriver: true }),
      Animated.spring(sendBtnScale, { toValue: 1, tension: 200, friction: 8, useNativeDriver: true }),
    ]).start();

    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      conversationId: conversationId ?? '',
      senderId: MY_ID,
      text: draft.trim(),
      createdAt: new Date().toISOString(),
      status: 'sent',
      type: 'text',
    };
    setMessages((prev) => [...prev, newMsg]);
    setDraft('');
    setIsTyping(true);
  };

  if (!conversation) {
    return (
      <View style={styles.notFound}>
        <Text style={{ color: Colors.textSecondary }}>Conversation not found</Text>
      </View>
    );
  }

  const grouped = groupByDay(messages);

  const renderItem = ({ item }: { item: (typeof grouped)[number] }) => {
    if (item.type === 'date') {
      return (
        <View style={styles.datePill}>
          <Text style={styles.datePillText}>{item.label}</Text>
        </View>
      );
    }

    const { msg } = item;
    const isMe = msg.senderId === MY_ID;

    return (
      <View style={[styles.bubbleRow, isMe ? styles.bubbleRowMe : styles.bubbleRowThem]}>
        {!isMe && (
          <Image source={{ uri: conversation.agentAvatar }} style={styles.bubbleAvatar} />
        )}
        <View
          style={[
            styles.bubble,
            isMe ? styles.bubbleMe : styles.bubbleThem,
          ]}
        >
          <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextThem]}>
            {msg.text}
          </Text>
          <View style={styles.bubbleMeta}>
            <Text style={[styles.bubbleTime, isMe ? styles.bubbleTimeMe : styles.bubbleTimeThem]}>
              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            {isMe && (
              <Ionicons
                name={
                  msg.status === 'read'
                    ? 'checkmark-done'
                    : msg.status === 'delivered'
                    ? 'checkmark-done-outline'
                    : 'checkmark'
                }
                size={12}
                color={msg.status === 'read' ? Colors.lime : 'rgba(255,255,255,0.6)'}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={styles.headerDecoA} />

        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.white} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.agentInfo} activeOpacity={0.8}>
          <View style={styles.agentAvatarWrap}>
            <Image source={{ uri: conversation.agentAvatar }} style={styles.agentAvatar} />
            {conversation.agentOnline && <View style={styles.onlineDot} />}
          </View>
          <View>
            <Text style={styles.agentName}>{conversation.agentName}</Text>
            <Text style={styles.agentStatus}>
              {conversation.agentOnline ? 'Online now' : 'Last seen recently'}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerMenuBtn}>
          <Ionicons name="call-outline" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Pinned listing context card */}
      <TouchableOpacity
        style={styles.listingCard}
        onPress={() => router.push(`/listing/${conversation.listingId}`)}
        activeOpacity={0.85}
      >
        <Image source={{ uri: conversation.listingImageUri }} style={styles.listingThumb} />
        <View style={styles.listingInfo}>
          <Text style={styles.listingLabel}>Enquiring about</Text>
          <Text style={styles.listingTitle} numberOfLines={1}>{conversation.listingTitle}</Text>
          <Text style={styles.listingPrice}>
            ₦{(conversation.listingPrice / 1_000_000).toFixed(1)}M
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
      </TouchableOpacity>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={grouped}
        keyExtractor={(item, i) =>
          item.type === 'date' ? `date-${i}` : item.msg.id
        }
        renderItem={renderItem}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
      />

      {/* Typing indicator */}
      {isTyping && (
        <View style={styles.typingRow}>
          <Image source={{ uri: conversation.agentAvatar }} style={styles.bubbleAvatar} />
          <View style={styles.typingBubble}>
            <View style={styles.typingDots}>
              <View style={[styles.dot, styles.dot1]} />
              <View style={[styles.dot, styles.dot2]} />
              <View style={[styles.dot, styles.dot3]} />
            </View>
          </View>
        </View>
      )}

      {/* Input bar */}
      <View
        style={[
          styles.inputBar,
          { paddingBottom: Math.max(insets.bottom, Spacing.lg) },
        ]}
      >
        <TextInput
          ref={inputRef}
          style={styles.inputField}
          value={draft}
          onChangeText={setDraft}
          placeholder="Type a message…"
          placeholderTextColor={Colors.textTertiary}
          multiline
          maxLength={1000}
        />
        <Animated.View style={{ transform: [{ scale: sendBtnScale }] }}>
          <TouchableOpacity
            style={[styles.sendBtn, !draft.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!draft.trim()}
          >
            <Ionicons name="send" size={18} color={draft.trim() ? Colors.textPrimary : Colors.textTertiary} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Header ────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: HERO_BG,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
    overflow: 'hidden',
  },
  headerDecoA: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(159,187,68,0.06)',
    top: -60,
    right: -40,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  agentAvatarWrap: {
    position: 'relative',
  },
  agentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: HERO_BG,
  },
  agentName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.white,
  },
  agentStatus: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.55)',
  },
  headerMenuBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Listing context card ──────────────────────────────────────
  listingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  listingThumb: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
  },
  listingInfo: {
    flex: 1,
    gap: 1,
  },
  listingLabel: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  listingTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  listingPrice: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.primary,
  },

  // ── Messages ─────────────────────────────────────────────────
  messageList: {
    padding: Spacing.lg,
    gap: Spacing.xs,
    paddingBottom: Spacing.xl,
  },
  datePill: {
    alignSelf: 'center',
    backgroundColor: Colors.borderLight,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    marginVertical: Spacing.md,
  },
  datePillText: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    marginVertical: 2,
  },
  bubbleRowMe: {
    justifyContent: 'flex-end',
  },
  bubbleRowThem: {
    justifyContent: 'flex-start',
  },
  bubbleAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginBottom: 2,
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: 2,
  },
  bubbleMe: {
    backgroundColor: Colors.lime,
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  bubbleText: {
    fontSize: FontSize.md,
    lineHeight: 20,
  },
  bubbleTextMe: {
    color: Colors.textPrimary,
  },
  bubbleTextThem: {
    color: Colors.textPrimary,
  },
  bubbleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
    marginTop: 2,
  },
  bubbleTime: {
    fontSize: 10,
  },
  bubbleTimeMe: {
    color: 'rgba(26,26,26,0.45)',
  },
  bubbleTimeThem: {
    color: Colors.textTertiary,
  },

  // ── Typing indicator ─────────────────────────────────────────
  typingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  typingBubble: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    borderBottomLeftRadius: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    height: 16,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.textTertiary,
    opacity: 0.5,
  },
  dot1: { opacity: 0.3 },
  dot2: { opacity: 0.6 },
  dot3: { opacity: 0.9 },

  // ── Input bar ─────────────────────────────────────────────────
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  inputField: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 12 : 10,
    paddingBottom: Platform.OS === 'ios' ? 12 : 10,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Colors.borderLight,
  },
});
