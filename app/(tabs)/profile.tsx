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

interface MenuItem {
  icon: string;
  label: string;
  onPress?: () => void;
  hasChevron?: boolean;
  rightElement?: React.ReactNode;
  color?: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { logout } = useAuthStore();
  const [darkMode, setDarkMode] = useState(false);

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

  const settingsItems: MenuItem[] = [
    { icon: 'person-outline', label: 'Edit Profile', hasChevron: true },
    { icon: 'shield-checkmark-outline', label: 'Verification', hasChevron: true },
    { icon: 'notifications-outline', label: 'Notifications', hasChevron: true },
    { icon: 'card-outline', label: 'Listing Updates', hasChevron: true },
    { icon: 'bookmark-outline', label: 'Saved Listings', hasChevron: true },
    { icon: 'receipt-outline', label: 'Transactions', hasChevron: true },
  ];

  const supportItems: MenuItem[] = [
    { icon: 'help-circle-outline', label: 'Help & Support', hasChevron: true },
    { icon: 'document-text-outline', label: 'Terms & Privacy', hasChevron: true },
    { icon: 'chatbubble-outline', label: 'Contact Support', hasChevron: true },
  ];

  const renderMenuItem = (item: MenuItem, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.menuItem}
      onPress={item.onPress}
    >
      <View style={styles.menuLeft}>
        <Ionicons
          name={item.icon as any}
          size={22}
          color={item.color || Colors.textPrimary}
        />
        <Text style={[styles.menuLabel, item.color ? { color: item.color } : null]}>
          {item.label}
        </Text>
      </View>
      {item.rightElement || (
        item.hasChevron && (
          <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
        )
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.profileCard}>
        <Image
          source={{ uri: 'https://i.pravatar.cc/150?img=11' }}
          style={styles.profileAvatar}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>Kenneth Umoekpe</Text>
          <Text style={styles.profileRole}>Land Seeker</Text>
        </View>
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="create-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.menuGroup}>
          {settingsItems.map(renderMenuItem)}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.menuGroup}>
          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Ionicons name="moon-outline" size={22} color={Colors.textPrimary} />
              <Text style={styles.menuLabel}>Dark Mode</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.menuGroup}>
          {supportItems.map(renderMenuItem)}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.menuGroup}>
          {renderMenuItem({
            icon: 'trash-outline',
            label: 'Delete Account',
            hasChevron: true,
            color: Colors.error,
          }, 99)}
        </View>
      </View>

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
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xxl,
    ...Shadow.sm,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: Spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  profileRole: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  menuGroup: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
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
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
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
    marginHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.error,
    marginTop: Spacing.md,
  },
  logoutText: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.error,
  },
});
