import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../src/stores/authStore';
import { colors } from '../src/utils/theme';

export default function RootLayout() {
  const { isInitialized, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (!isInitialized) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen
          name="post/[id]"
          options={{
            headerShown: true,
            headerTitle: 'Publication',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="post/create"
          options={{
            headerShown: true,
            headerTitle: 'Nouvelle publication',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="channel/[id]"
          options={{
            headerShown: true,
            headerTitle: 'Messages',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            animation: 'slide_from_right',
          }}
        />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
