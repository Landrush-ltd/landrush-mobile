import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import {
  useFonts,
  Sora_400Regular,
  Sora_500Medium,
  Sora_600SemiBold,
  Sora_700Bold,
  Sora_800ExtraBold,
} from '@expo-google-fonts/sora';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { OfflineBanner } from '../src/components/OfflineBanner';
import { applySoraFont } from '../src/utils/fonts';
import {
  registerForPushNotifications,
  addNotificationReceivedListener,
  addNotificationResponseListener,
  removeNotificationSubscription,
} from '../src/services/pushNotifications';
import { useAuthStore } from '../src/store/auth';

// Map every fontWeight to its Sora file, app-wide, before anything renders.
applySoraFont();
SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 2 } },
});

function NotificationSetup() {
  const { isAuthenticated, token } = useAuthStore();
  const router = useRouter();
  const receivedSub = useRef<Notifications.EventSubscription | null>(null);
  const responseSub = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token || Platform.OS === 'web') return;

    registerForPushNotifications(token).catch(() => {});

    receivedSub.current = addNotificationReceivedListener((_notification) => {
      // badge / local state updates handled by React Query refetch interval
    });

    responseSub.current = addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data as Record<string, string>;
      if (data?.listingId) router.push(`/listing/${data.listingId}`);
      else if (data?.bookingId) router.push('/(tabs)/bookings');
      else if (data?.conversationId) router.push('/(tabs)/messages');
      else router.push('/notifications');
    });

    return () => {
      if (receivedSub.current) removeNotificationSubscription(receivedSub.current);
      if (responseSub.current) removeNotificationSubscription(responseSub.current);
    };
  }, [isAuthenticated, token]);

  return null;
}

function ThemedStack() {
  const { colors, isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="listing/[id]" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Sora_400Regular,
    Sora_500Medium,
    Sora_600SemiBold,
    Sora_700Bold,
    Sora_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  // On web, fonts load as CSS @font-face — blocking here just produces a blank
  // screen while the TTF downloads. Render immediately; the font swaps in.
  if (!fontsLoaded && Platform.OS !== 'web') return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <OfflineBanner />
          <NotificationSetup />
          <ThemedStack />
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
