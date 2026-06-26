import { Stack } from 'expo-router';
import { useColors } from '../../src/context/ThemeContext';

export default function AgentLayout() {
  const colors = useColors();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="listings-manager" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
