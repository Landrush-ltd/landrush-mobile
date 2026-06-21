import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, Shadow, BorderRadius, Spacing } from '../../src/constants/theme';

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
  index:    { icon: 'home-outline',        activeIcon: 'home',        label: 'Home'     },
  messages: { icon: 'chatbubbles-outline', activeIcon: 'chatbubbles', label: 'Messages' },
  bookings: { icon: 'calendar-outline',    activeIcon: 'calendar',    label: 'Bookings' },
  profile:  { icon: 'person-outline',      activeIcon: 'person',      label: 'Profile'  },
};

function CustomTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  const renderTab = (name: string) => {
    const meta = META[name];
    if (!meta) return null;
    const idx     = state.routes.findIndex((r) => r.name === name);
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
          size={19}
          color={focused ? Colors.textPrimary : 'rgba(255,255,255,0.45)'}
        />
        {focused && <Text style={styles.tabLabel}>{meta.label}</Text>}
      </TouchableOpacity>
    );
  };

  const createIdx     = state.routes.findIndex((r) => r.name === 'create');
  const createFocused = state.index === createIdx;

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      <View style={styles.pill}>
        {renderTab('index')}
        {renderTab('messages')}

        {/* Centre FAB */}
        <TouchableOpacity
          style={[styles.fab, createFocused && styles.fabActive]}
          onPress={() => navigation.navigate('create')}
          activeOpacity={0.85}
        >
          <Ionicons
            name={createFocused ? 'close' : 'add'}
            size={26}
            color={createFocused ? Colors.textPrimary : Colors.white}
          />
        </TouchableOpacity>

        {renderTab('bookings')}
        {renderTab('profile')}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    backgroundColor: Colors.background,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: BorderRadius.full,
    padding: 5,
    height: 64,
    ...Shadow.lg,
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
    flex: 1.8,
  },
  tabLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 0.2,
  },
  fab: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 3,
    ...Shadow.md,
  },
  fabActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
});

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
