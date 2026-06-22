import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, FontSize, BorderRadius, Shadow } from '../../src/constants/theme';
import type { ThemeColors } from '../../src/constants/theme';
import { useColors, useTheme } from '../../src/context/ThemeContext';
import { useAuthStore } from '../../src/store/auth';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface MenuItem {
  icon:       IoniconsName;
  label:      string;
  onPress?:   () => void;
  right?:     React.ReactNode;
  danger?:    boolean;
}

interface MenuGroup { title: string; items: MenuItem[] }

export default function ProfileScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { logout, user } = useAuthStore();
  const { isDark, toggleTheme } = useTheme();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const displayName = user ? `${user.firstName} ${user.lastName}` : 'Landrush User';
  const initials    = ((user?.firstName?.[0] ?? '') + (user?.lastName?.[0] ?? '')).toUpperCase();
  const role        = user?.role === 'agent' ? 'Landrush Agent' : user?.role === 'landowner' ? 'Landowner' : 'Land Seeker';

  const handleLogout = () =>
    Alert.alert('Log out?', 'You will be returned to the login screen.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => { logout(); router.replace('/(auth)/login'); } },
    ]);

  const groups: MenuGroup[] = [
    {
      title: 'Account',
      items: [
        { icon: 'person-outline',            label: 'Personal Information', onPress: () => router.push('/personal-information') },
        { icon: 'shield-checkmark-outline',  label: 'Verification',        onPress: () => router.push('/verification') },
        { icon: 'notifications-outline',     label: 'Notifications',       onPress: () => router.push('/notifications') },
        {
          icon: 'moon-outline',
          label: 'Dark Mode',
          right: (
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.lime }}
              thumbColor={colors.white}
            />
          ),
        },
      ],
    },
    {
      title: 'Activity',
      items: [
        { icon: 'list-outline',     label: 'My Listings',    onPress: () => router.push('/my-listings') },
        { icon: 'bookmark-outline', label: 'Saved Listings', onPress: () => router.push('/saved-listings') },
        { icon: 'calendar-outline', label: 'Bookings',       onPress: () => router.push('/(tabs)/bookings') },
        { icon: 'receipt-outline',  label: 'Payment History',onPress: () => router.push('/payment-history') },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: 'help-circle-outline',   label: 'Help & Support',  onPress: () => router.push('/help') },
        { icon: 'document-text-outline', label: 'Terms & Privacy', onPress: () => {} },
      ],
    },
  ];

  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      {/* ── Header ─────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* ── Avatar card ─────────────────────────────────────── */}
      <View style={styles.avatarCard}>
        <View style={styles.avatarWrap}>
          {user?.avatar
            ? <Image source={{ uri: user.avatar }} style={styles.avatar} />
            : <View style={styles.avatarInitials}><Text style={styles.avatarInitialsText}>{initials}</Text></View>
          }
          <TouchableOpacity style={styles.editAvatarBtn}>
            <Ionicons name="camera-outline" size={14} color={colors.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.avatarInfo}>
          <Text style={styles.displayName}>{displayName}</Text>
          <Text style={styles.roleText}>{role}</Text>
          {user?.isVerified && (
            <View style={styles.verifiedRow}>
              <Ionicons name="checkmark-circle" size={14} color={colors.lime} />
              <Text style={styles.verifiedText}>Verified member</Text>
            </View>
          )}
        </View>
      </View>

      {/* ── Stats row ───────────────────────────────────────── */}
      <View style={styles.statsRow}>
        {[{ v: '3', l: 'Listings' }, { v: '5', l: 'Inspections' }, { v: '2', l: 'Saved' }].map((s, i, arr) => (
          <View key={s.l} style={[styles.statItem, i < arr.length - 1 && styles.statItemBorder]}>
            <Text style={styles.statValue}>{s.v}</Text>
            <Text style={styles.statLabel}>{s.l}</Text>
          </View>
        ))}
      </View>

      {/* ── Menu groups ─────────────────────────────────────── */}
      <View style={styles.menuArea}>
        {groups.map((g) => (
          <View key={g.title} style={styles.group}>
            <Text style={styles.groupTitle}>{g.title}</Text>
            <View style={styles.groupCard}>
              {g.items.map((item, i) => (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.menuRow, i < g.items.length - 1 && styles.menuRowBorder]}
                  onPress={item.onPress}
                  activeOpacity={item.onPress ? 0.7 : 1}
                >
                  <Ionicons name={item.icon} size={20} color={colors.textSecondary} />
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  {item.right ?? <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color={colors.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Landrush v1.0.0</Text>
        <View style={{ height: 80 }} />
      </View>
    </ScrollView>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.surface },
    header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
    headerTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: colors.textPrimary },
    avatarCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, backgroundColor: colors.white, padding: Spacing.xl, marginBottom: 1 },
    avatarWrap: { position: 'relative' },
    avatar: { width: 72, height: 72, borderRadius: 36 },
    avatarInitials: { width: 72, height: 72, borderRadius: 36, backgroundColor: `${colors.lime}22`, borderWidth: 2, borderColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
    avatarInitialsText: { fontSize: FontSize.xxl, fontWeight: '800', color: colors.lime },
    editAvatarBtn: { position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: 12, backgroundColor: colors.textPrimary, alignItems: 'center', justifyContent: 'center' },
    avatarInfo: { flex: 1, gap: 3 },
    displayName: { fontSize: FontSize.xl, fontWeight: '700', color: colors.textPrimary },
    roleText: { fontSize: FontSize.sm, color: colors.textSecondary },
    verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    verifiedText: { fontSize: FontSize.sm, color: colors.lime, fontWeight: '600' },
    statsRow: { flexDirection: 'row', backgroundColor: colors.white, marginBottom: 8 },
    statItem: { flex: 1, alignItems: 'center', paddingVertical: Spacing.lg, gap: 3 },
    statItemBorder: { borderRightWidth: 1, borderRightColor: colors.borderLight },
    statValue: { fontSize: FontSize.xxl, fontWeight: '800', color: colors.textPrimary },
    statLabel: { fontSize: FontSize.xs, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
    menuArea: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, gap: 2 },
    group: { marginBottom: Spacing.xl },
    groupTitle: { fontSize: FontSize.xs, fontWeight: '700', color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.8, paddingLeft: 4, marginBottom: Spacing.sm },
    groupCard: { backgroundColor: colors.white, borderRadius: BorderRadius.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.borderLight },
    menuRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: 15, paddingHorizontal: Spacing.lg },
    menuRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
    menuLabel: { flex: 1, fontSize: FontSize.md, color: colors.textPrimary, fontWeight: '500' },
    logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.lg, borderRadius: BorderRadius.xl, borderWidth: 1.5, borderColor: `${colors.error}40`, backgroundColor: colors.white, marginTop: Spacing.md },
    logoutText: { fontSize: FontSize.md, fontWeight: '700', color: colors.error },
    version: { textAlign: 'center', fontSize: FontSize.xs, color: colors.textTertiary, marginTop: Spacing.lg },
  });
}
