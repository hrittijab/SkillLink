import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Initial screen */}
        <Stack.Screen name="index" />

        {/* Authentication screens */}
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="profile-setup" />

        {/* Main app */}
        <Stack.Screen name="home" />
        <Stack.Screen name="addpost" />
        <Stack.Screen name="editpost" />
        <Stack.Screen name="myposts" />
        <Stack.Screen name="editprofile" />
        <Stack.Screen name="exploreskills" />
        <Stack.Screen name="profile" />

        {/* Fallback */}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
