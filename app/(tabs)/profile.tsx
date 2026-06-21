import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/auth';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface MenuItem {
  icon: IoniconsName;
  label: string;
  onPress?: () => void;
  iconBg: string;
  iconColor: string;
  rightElement?: React.ReactNode;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

const HERO_BG = '#003828';

const STATS = [
  { value: '3', label: 'Listings' },
  { value: '5', label: 'Inspections' },
  { value: '2', label: 'Saved' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { logout, user } = useAuthStore();
  const displayName = user ? `${user.firstName} ${user.lastName}` : 'Landrush User';
  const displayRole =
    user?.role === 'agent' ? 'Landrush Agent'
    : user?.role === 'landowner' ? 'Landowner'
    : 'Land Seeker';
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () =>
    Alert.alert('Log Out?', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => { logout(); router.replace('/(auth)/login'); },
      },
    ]);

  const groups: MenuGroup[] = [
    {
      title: 'Account',
      items: [
        {
          icon: 'person-outline',
          label: 'Personal Information',
          iconBg: `${Colors.lime}22`,
          iconColor: Colors.primary,
          onPress: () => router.push('/personal-information'),
        },
        {
          icon: 'shield-checkmark-outline',
          label: 'Verification',
          iconBg: '#E3F2FD',
          iconColor: '#1565C0',
          onPress: () => router.push('/verification'),
        },
        {
          icon: 'notifications-outline',
          label: 'Notifications',
          iconBg: '#FFF8E1',
          iconColor: '#F57F17',
          onPress: () => router.push('/notifications'),
        },
        {
          icon: 'moon-outline',
          label: 'Dark Mode',
          iconBg: '#EDE7F6',
          iconColor: '#5C6BC0',
          rightElement: (
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: Colors.border, true: Colors.lime }}
              thumbColor={Colors.white}
            />
          ),
        },
      ],
    },
    {
      title: 'Activity',
      items: [
        {
          icon: 'list-outline',
          label: 'My Listings',
          iconBg: `${Colors.lime}22`,
          iconColor: Colors.primary,
          onPress: () => router.push('/my-listings'),
        },
        {
          icon: 'bookmark-outline',
          label: 'Saved Listings',
          iconBg: '#E8F5E9',
          iconColor: Colors.success,
          onPress: () => router.push('/saved-listings'),
        },
        {
          icon: 'calendar-outline',
          label: 'Bookings',
          iconBg: '#E3F2FD',
          iconColor: '#1565C0',
          onPress: () => router.push('/(tabs)/bookings'),
        },
        {
          icon: 'receipt-outline',
          label: 'Payment History',
          iconBg: '#FFF8E1',
          iconColor: '#F57F17',
          onPress: () => router.push('/payment-history'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: 'help-circle-outline',
          label: 'Help & Support',
          iconBg: '#F3E5F5',
          iconColor: '#7B1FA2',
          onPress: () => router.push('/help'),
        },
        {
          icon: 'document-text-outline',
          label: 'Terms & Privacy',
          iconBg: Colors.chipInactive,
          iconColor: Colors.textSecondary,
          onPress: () => {},
        },
      ],
    },
  ];

  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      {/* Dark hero header */}
      <View style={[styles.hero, { paddingTop: insets.top + Spacing.lg }]}>
        <View style={styles.heroDecoA} />
        <View style={styles.heroDecoB} />

        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <Image
            source={{ uri: user?.avatar ?? 'https://i.pravatar.cc/150?img=11' }}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.editAvatarBtn}>
            <Ionicons name="camera-outline" size={14} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <Text style={styles.heroName}>{displayName}</Text>
        <View style={styles.roleRow}>
          <View style={styles.rolePill}>
            <Ionicons name="ribbon-outline" size={12} color={Colors.lime} />
            <Text style={styles.roleText}>{displayRole}</Text>
          </View>
          {user?.isVerified && (
            <View style={styles.verifiedPill}>
              <Ionicons name="checkmark-circle" size={12} color={Colors.primary} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>

        {/* Stats strip */}
        <View style={styles.statsRow}>
          {STATS.map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <View style={styles.statsDivider} />}
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* Menu groups */}
      <View style={styles.menuArea}>
        {groups.map((group) => (
          <View key={group.title} style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.groupCard}>
              {group.items.map((item, i) => (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.menuRow, i < group.items.length - 1 && styles.menuRowBorder]}
                  onPress={item.onPress}
                  activeOpacity={item.onPress ? 0.7 : 1}
                >
                  <View style={[styles.menuIcon, { backgroundColor: item.iconBg }]}>
                    <Ionicons name={item.icon} size={18} color={item.iconColor} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  {item.rightElement ?? (
                    <Ionicons name="chevron-forward" size={17} color={Colors.textTertiary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color={Colors.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Landrush v1.0.0</Text>
        <View style={{ height: 80 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ── Hero ────────────────────────────────────────────────────
  hero: {
    backgroundColor: HERO_BG,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    overflow: 'hidden',
  },
  heroDecoA: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(159,187,68,0.07)',
    top: -80,
    right: -60,
  },
  heroDecoB: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(159,187,68,0.05)',
    bottom: 20,
    left: -20,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: Colors.lime,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: HERO_BG,
  },
  heroName: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  roleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  roleText: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${Colors.lime}22`,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  verifiedText: {
    fontSize: FontSize.xs,
    color: Colors.lime,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    width: '100%',
  },
  statsDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: 4,
    flex: 0,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.lime,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.55)',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  // ── Menu ────────────────────────────────────────────────────
  menuArea: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    gap: Spacing.sm,
  },
  group: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  groupTitle: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingLeft: 4,
  },
  groupCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: `${Colors.error}50`,
    backgroundColor: '#FFF5F5',
  },
  logoutText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.error,
  },
  version: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: Spacing.lg,
  },
});
