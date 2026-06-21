import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../src/constants/theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface NotificationItem {
  id: string;
  icon: IoniconsName;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  time: string;
  unread?: boolean;
}

interface NotificationGroup {
  label: string;
  items: NotificationItem[];
}

const groups: NotificationGroup[] = [
  {
    label: 'Today',
    items: [
      {
        id: '1',
        icon: 'calendar-outline',
        iconColor: Colors.primary,
        iconBg: `${Colors.lime}25`,
        title: 'Inspection Confirmed',
        subtitle: 'Your inspection for 12 Acres of Farmland has been confirmed for Monday, 12 May.',
        time: '2m ago',
        unread: true,
      },
      {
        id: '2',
        icon: 'notifications-outline',
        iconColor: Colors.info,
        iconBg: '#E3F2FD',
        title: 'Payment Successful',
        subtitle: 'Your access fee payment of ₦5,000 was processed successfully.',
        time: '1h ago',
        unread: true,
      },
    ],
  },
  {
    label: 'Yesterday',
    items: [
      {
        id: '3',
        icon: 'close-circle-outline',
        iconColor: Colors.error,
        iconBg: '#FFEBEE',
        title: 'Listing Rejected',
        subtitle: 'Your listing "5 Plots Industrial Zone" was rejected. Please review and resubmit.',
        time: 'Yesterday, 3:45 PM',
      },
      {
        id: '4',
        icon: 'checkmark-circle-outline',
        iconColor: Colors.success,
        iconBg: '#E8F5E9',
        title: 'Listing Approved',
        subtitle: 'Your listing "8 Plots Corner Piece, Lekki" is now live on Landrush.',
        time: 'Yesterday, 10:12 AM',
      },
    ],
  },
  {
    label: '03-06',
    items: [
      {
        id: '5',
        icon: 'person-outline',
        iconColor: Colors.textSecondary,
        iconBg: Colors.chipInactive,
        title: 'New Booking Request',
        subtitle: 'Adewale Properties has requested an inspection for your listing.',
        time: '03-06, 8:00 AM',
      },
    ],
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Sage-green header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* White card body */}
      <View style={styles.card}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {groups.map((group, gi) => (
            <View key={group.label}>
              <Text style={[styles.groupLabel, gi > 0 && { marginTop: Spacing.xxl }]}>
                {group.label}
              </Text>
              {group.items.map((item, ii) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.item,
                    ii < group.items.length - 1 && styles.itemBorder,
                    item.unread && styles.itemUnread,
                  ]}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
                    <Ionicons name={item.icon} size={22} color={item.iconColor} />
                  </View>
                  <View style={styles.itemText}>
                    <Text style={[styles.itemTitle, item.unread && styles.itemTitleUnread]}>
                      {item.title}
                    </Text>
                    <Text style={styles.itemSubtitle} numberOfLines={2}>
                      {item.subtitle}
                    </Text>
                  </View>
                  <Text style={styles.itemTime}>{item.time}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
          <View style={{ height: Spacing.xxxl }} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.authBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    ...Shadow.lg,
  },
  groupLabel: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  itemBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.borderLight,
  },
  itemUnread: {
    backgroundColor: `${Colors.lime}08`,
    marginHorizontal: -Spacing.xl,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.sm,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  itemText: {
    flex: 1,
    gap: 3,
  },
  itemTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  itemTitleUnread: {
    fontWeight: '700',
  },
  itemSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  itemTime: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    flexShrink: 0,
    marginTop: 2,
  },
});
