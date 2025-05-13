import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import BASE_URL from '../config';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const fetchUser = async () => {
        setLoading(true);
        try {
          const email = await AsyncStorage.getItem('userEmail');
          const token = await SecureStore.getItemAsync('jwtToken');

          if (!email || !token) {
            alert('User not logged in.');
            router.push('/login');
            return;
          }

          const response = await fetch(`${BASE_URL}/api/users/${encodeURIComponent(email)}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data);
          } else {
            console.error('Failed to fetch user profile.');
          }
        } catch (error) {
          console.error('Error fetching user:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchUser();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6D83F2" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text>User not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/home')}>
        <Ionicons name="arrow-back" size={28} color="#6D83F2" />
      </TouchableOpacity>

      <View style={{ alignItems: 'center' }}>
        {user.profilePictureUrl ? (
          <Image source={{ uri: user.profilePictureUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.initialAvatar}>
            <Text style={styles.initialText}>
              {user.firstName?.charAt(0)?.toUpperCase() ?? "?"}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
      <Text style={styles.email}>{user.email}</Text>

      {user.bio && (
        <>
          <Text style={styles.label}>Bio</Text>
          <Text style={styles.info}>{user.bio}</Text>
        </>
      )}

      {user.skillsOffered && (
        <>
          <Text style={styles.label}>Skills Offered</Text>
          <Text style={styles.info}>{user.skillsOffered}</Text>
        </>
      )}

      {user.skillsWanted && (
        <>
          <Text style={styles.label}>Skills Wanted</Text>
          <Text style={styles.info}>{user.skillsWanted}</Text>
        </>
      )}

      <TouchableOpacity style={styles.editButton} onPress={() => router.push('/editprofile')}>
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 60,
    paddingBottom: 40,
    backgroundColor: '#f0f4ff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 20 : 50,
    left: 16,
    padding: 10,
    zIndex: 1,
  },
  avatar: {
    width: width * 0.35,
    height: width * 0.35,
    borderRadius: (width * 0.35) / 2,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#6D83F2',
  },
  initialAvatar: {
    width: width * 0.35,
    height: width * 0.35,
    borderRadius: (width * 0.35) / 2,
    backgroundColor: '#6D83F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 4,
  },
  initialText: {
    fontSize: width * 0.15,
    color: 'white',
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#444',
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  info: {
    fontSize: 14,
    backgroundColor: '#fff',
    padding: 12,
    width: '100%',
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    color: '#333',
  },
  editButton: {
    marginTop: 30,
    backgroundColor: '#6D83F2',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    elevation: 3,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
