import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { colors } from '../../src/utils/theme';

export default function AuthLayout() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="scanner" options={{ presentation: 'fullScreenModal' }} />
    </Stack>
  );
}
