import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontSize, Spacing } from '../../src/constants/theme';
import type { ThemeColors } from '../../src/constants/theme';
import { useColors } from '../../src/context/ThemeContext';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface TabMeta {
  icon:       IoniconsName;
  activeIcon: IoniconsName;
  label:      string;
}

interface TabBarProps {
  state:       { routes: Array<{ key: string; name: string }>; index: number };
  navigation:  { navigate: (name: string) => void };
  descriptors: Record<string, unknown>;
}

const META: Record<string, TabMeta> = {
  index:    { icon: 'search-outline',      activeIcon: 'search',        label: 'Explore'  },
  messages: { icon: 'chatbubble-outline',  activeIcon: 'chatbubble',    label: 'Messages' },
  bookings: { icon: 'calendar-outline',    activeIcon: 'calendar',      label: 'Bookings' },
  profile:  { icon: 'person-outline',      activeIcon: 'person',        label: 'Profile'  },
};

function CustomTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);

  const renderTab = (name: string) => {
    const meta = META[name];
    if (!meta) return null;
    const idx     = state.routes.findIndex((r) => r.name === name);
    const focused = state.index === idx;

    return (
      <TouchableOpacity
        key={name}
        style={styles.tab}
        onPress={() => navigation.navigate(name)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={focused ? meta.activeIcon : meta.icon}
          size={22}
          color={focused ? colors.lime : colors.textSecondary}
        />
        <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
          {meta.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const createIdx     = state.routes.findIndex((r) => r.name === 'create');
  const createFocused = state.index === createIdx;

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {renderTab('index')}
      {renderTab('messages')}

      {/* Centre create FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('create')}
        activeOpacity={0.85}
      >
        <View style={[styles.fabInner, createFocused && styles.fabInnerActive]}>
          <Ionicons name="add" size={28} color={colors.fixedWhite} />
        </View>
        <Text style={[styles.tabLabel, createFocused && styles.tabLabelActive]}>
          List
        </Text>
      </TouchableOpacity>

      {renderTab('bookings')}
      {renderTab('profile')}
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    backgroundColor: colors.card,
    borderTopWidth: Platform.OS === 'android' ? 1 : 0.5,
    borderTopColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingTop: 2,
  },
  tabLabel: {
    fontSize: FontSize.xs,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 1,
  },
  tabLabelActive: {
    color: colors.lime,
    fontWeight: '700',
  },
  fab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  fabInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 6,
  },
  fabInnerActive: {
    backgroundColor: colors.lime,
  },
  });
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index"    />
      <Tabs.Screen name="messages" />
      <Tabs.Screen name="create"   />
      <Tabs.Screen name="bookings" />
      <Tabs.Screen name="profile"  />
      <Tabs.Screen name="map"      options={{ href: null }} />
    </Tabs>
  );
}
