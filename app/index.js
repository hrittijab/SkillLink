import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';

/**
 * IndexScreen handles initial authentication check.
 * Redirects to /home if a JWT is found, otherwise to /login.
 */
export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync('jwtToken');
        router.replace(token ? '/home' : '/login');
      } catch {
        Alert.alert('Error', 'Something went wrong checking authentication.');
        router.replace('/login');
      }
    };

    checkAuth();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#6D83F2" />
    </View>
  );
}
