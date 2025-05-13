import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
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

export default function OtherProfileScreen() {
  const { email } = useLocalSearchParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const token = await SecureStore.getItemAsync('jwtToken');
        if (!token) {
          alert('Session expired. Please log in again.');
          router.push('/login');
          return;
        }

        const response = await fetch(`${BASE_URL}/api/users/${encodeURIComponent(email)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          alert('Failed to load user profile.');
        }
      } catch (err) {
        console.error('Error:', err);
        alert('Something went wrong.');
      } finally {
        setLoading(false);
      }
    };

    if (email) fetchUser();
  }, [email]);

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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>

        <View style={styles.profileCard}>
          {user.profilePictureUrl ? (
            <Image source={{ uri: user.profilePictureUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.initialAvatar}>
              <Text style={styles.initialText}>{user.firstName?.[0]?.toUpperCase() ?? '?'}</Text>
            </View>
          )}
          <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
        </View>

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
    paddingTop: 80,
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
    top: 40,
    left: 20,
    zIndex: 10,
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
});
