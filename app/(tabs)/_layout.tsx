import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, Shadow, BorderRadius } from '../../src/constants/theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface TabMeta {
  icon: IoniconsName;
  activeIcon: IoniconsName;
  label: string;
}

interface TabBarProps {
  state: { routes: Array<{ key: string; name: string }>; index: number };
  navigation: { navigate: (name: string) => void };
  descriptors: Record<string, unknown>;
}

const META: Record<string, TabMeta> = {
  index:    { icon: 'home-outline',     activeIcon: 'home',     label: 'Home' },
  bookings: { icon: 'calendar-outline', activeIcon: 'calendar', label: 'Bookings' },
  profile:  { icon: 'person-outline',   activeIcon: 'person',   label: 'Profile' },
};

function CustomTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  const renderPillTab = (name: string) => {
    const meta = META[name];
    if (!meta) return null;
    const idx = state.routes.findIndex((r) => r.name === name);
    const focused = state.index === idx;

    return (
      <TouchableOpacity
        key={name}
        style={[styles.tab, focused && styles.tabActive]}
        onPress={() => navigation.navigate(name)}
        activeOpacity={0.85}
      >
        <Ionicons
          name={focused ? meta.activeIcon : meta.icon}
          size={20}
          color={focused ? Colors.textPrimary : Colors.textTertiary}
        />
        {focused && <Text style={styles.tabLabel}>{meta.label}</Text>}
      </TouchableOpacity>
    );
  };

  const createIdx = state.routes.findIndex((r) => r.name === 'create');
  const createFocused = state.index === createIdx;

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.pill}>
        {renderPillTab('index')}
        {renderPillTab('bookings')}

        <TouchableOpacity
          style={[styles.fab, createFocused && styles.fabFocused]}
          onPress={() => navigation.navigate('create')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={26} color={Colors.white} />
        </TouchableOpacity>

        {renderPillTab('profile')}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    paddingTop: 8,
    backgroundColor: Colors.background,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBEBEB',
    borderRadius: BorderRadius.full,
    padding: 5,
    height: 62,
    ...Shadow.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  tabActive: {
    backgroundColor: Colors.lime,
    flex: 2,
  },
  tabLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  fab: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    ...Shadow.sm,
  },
  fabFocused: {
    backgroundColor: Colors.primary,
  },
});

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="bookings" />
      <Tabs.Screen name="create" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="map" options={{ href: null }} />
    </Tabs>
  );
}
