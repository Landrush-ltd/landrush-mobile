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
  color?: string;
  rightElement?: React.ReactNode;
}

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { logout, user } = useAuthStore();
  const displayName = user ? `${user.firstName} ${user.lastName}` : 'Landrush User';
  const displayRole = user?.role === 'agent' ? 'Landrush Agent' : user?.role === 'landowner' ? 'Landowner' : 'Land Seeker';
  const [notifications, setNotifications] = useState(true);

  const handleLogout = () => {
    Alert.alert('Log Out?', 'Are you sure you want to log out?', [
      { text: 'No, Continue', style: 'cancel' },
      {
        text: 'Proceed',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const menuItems: MenuItem[] = [
    { icon: 'person-outline', label: 'Personal Information', onPress: () => router.push('/personal-information') },
    { icon: 'list-outline', label: 'My Listings', onPress: () => router.push('/my-listings') },
    { icon: 'bookmark-outline', label: 'Saved Listings', onPress: () => router.push('/saved-listings') },
    { icon: 'calendar-outline', label: 'Bookings', onPress: () => router.push('/(tabs)/bookings') },
    { icon: 'notifications-outline', label: 'Notifications', onPress: () => router.push('/notifications') },
    { icon: 'shield-checkmark-outline', label: 'Verification', onPress: () => router.push('/verification') },
    { icon: 'help-circle-outline', label: 'Help & Support', onPress: () => {} },
  ];

  const renderMenuItem = (item: MenuItem, index: number, isLast: boolean) => (
    <TouchableOpacity
      key={index}
      style={[styles.menuItem, isLast && styles.menuItemLast]}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuLeft}>
        <View style={styles.menuIconWrap}>
          <Ionicons name={item.icon} size={20} color={item.color ?? Colors.textPrimary} />
        </View>
        <Text style={[styles.menuLabel, item.color ? { color: item.color } : null]}>
          {item.label}
        </Text>
      </View>
      {item.rightElement ?? (
        <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Sage-green profile header */}
      <View style={[styles.profileHeader, { paddingTop: insets.top + Spacing.xl }]}>
        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: user?.avatar ?? 'https://i.pravatar.cc/150?img=11' }}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.editAvatarButton}>
            <Ionicons name="camera-outline" size={14} color={Colors.white} />
          </TouchableOpacity>
        </View>
        <Text style={styles.profileName}>{displayName}</Text>
        <Text style={styles.profileRole}>{displayRole}</Text>
      </View>

      {/* Menu card */}
      <View style={styles.menuCard}>
        {menuItems.map((item, i) => renderMenuItem(item, i, i === menuItems.length - 1))}

        {/* Notifications toggle row */}
        <View style={[styles.menuItem, styles.menuItemLast]}>
          <View style={styles.menuLeft}>
            <View style={styles.menuIconWrap}>
              <Ionicons name="moon-outline" size={20} color={Colors.textPrimary} />
            </View>
            <Text style={styles.menuLabel}>Dark Mode</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: Colors.border, true: Colors.lime }}
            thumbColor={Colors.white}
          />
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <View style={{ height: Spacing.huge }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  profileHeader: {
    backgroundColor: Colors.authBg,
    alignItems: 'center',
    paddingBottom: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: Colors.white,
  },
  editAvatarButton: {
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
    borderColor: Colors.white,
  },
  profileName: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  profileRole: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  menuCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.xl,
    marginTop: -Spacing.xl,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadow.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.borderLight,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.chipInactive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.error,
    backgroundColor: Colors.white,
  },
  logoutText: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.error,
  },
});
