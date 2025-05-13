import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
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
  View,
} from 'react-native';
import BASE_URL from '../config';

const { width } = Dimensions.get('window');

/**
 * Profile screen for displaying the logged-in user's data.
 */
export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user data on screen focus
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
          }
        } catch {
          alert('Failed to load profile. Please try again.');
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
    <LinearGradient colors={['#6D83F2', '#A775F2']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* 🔙 Back to Home */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/home')}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>

        {/* 👤 User Avatar */}
        <View style={styles.profileCard}>
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
        </View>

        {/* Profile Info */}
        {user.bio && (
          <View style={styles.infoCard}>
            <Text style={styles.label}>Bio</Text>
            <Text style={styles.info}>{user.bio}</Text>
          </View>
        )}
        {user.skillsOffered && (
          <View style={styles.infoCard}>
            <Text style={styles.label}>Skills Offered</Text>
            <Text style={styles.info}>{user.skillsOffered}</Text>
          </View>
        )}
        {user.skillsWanted && (
          <View style={styles.infoCard}>
            <Text style={styles.label}>Skills Wanted</Text>
            <Text style={styles.info}>{user.skillsWanted}</Text>
          </View>
        )}

        {/* ✏️ Edit Profile Button */}
        <TouchableOpacity style={styles.editButton} onPress={() => router.push('/editprofile')}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 60 : 80,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 30 : 50,
    left: 20,
    zIndex: 1,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#6D83F2',
  },
  initialAvatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#6D83F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  initialText: {
    fontSize: 42,
    color: 'white',
    fontWeight: 'bold',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
    textAlign: 'center',
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '100%',
    padding: 18,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6D83F2',
    marginBottom: 6,
  },
  info: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
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
