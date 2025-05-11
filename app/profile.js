import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import BASE_URL from '../config';

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
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/home')}>
        <Ionicons name="arrow-back" size={28} color="#6D83F2" />
      </TouchableOpacity>

      {user.profilePictureUrl ? (
        <Image source={{ uri: user.profilePictureUrl }} style={styles.avatar} />
      ) : (
        <View style={styles.initialAvatar}>
          <Text style={styles.initialText}>
            {user.firstName?.charAt(0)?.toUpperCase() ?? "?"}
          </Text>
        </View>
      )}

      <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
      <Text style={styles.email}>{user.email}</Text>

      {user.bio ? (
        <>
          <Text style={styles.label}>Bio</Text>
          <Text style={styles.info}>{user.bio}</Text>
        </>
      ) : null}

      {user.skillsOffered ? (
        <>
          <Text style={styles.label}>Skills Offered</Text>
          <Text style={styles.info}>{user.skillsOffered}</Text>
        </>
      ) : null}

      {user.skillsWanted ? (
        <>
          <Text style={styles.label}>Skills Wanted</Text>
          <Text style={styles.info}>{user.skillsWanted}</Text>
        </>
      ) : null}

      <TouchableOpacity style={styles.editButton} onPress={() => router.push('/editprofile')}>
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
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
    top: 20,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#6D83F2',
  },
  initialAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#6D83F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  initialText: {
    fontSize: 48,
    color: 'white',
    fontWeight: 'bold',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#444',
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  info: {
    fontSize: 16,
    backgroundColor: '#fff',
    padding: 10,
    width: '100%',
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 8,
    color: '#333',
  },
  editButton: {
    marginTop: 30,
    backgroundColor: '#6D83F2',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 3,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
