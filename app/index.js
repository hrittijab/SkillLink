import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync('jwtToken');
        if (token) {
          console.log('🔐 JWT token found. Redirecting to Home...');
          router.replace('/home');
        } else {
          console.log('🛑 No JWT token. Redirecting to Login...');
          router.replace('/login');
        }
      } catch (error) {
        console.error('❌ SecureStore error:', error);
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
