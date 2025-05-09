import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const email = await AsyncStorage.getItem('userEmail');
        const response = await fetch(`http://localhost:8080/api/users/${encodeURIComponent(email)}`);
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          console.error('Failed to fetch user');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

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

      {/* Edit Profile Button */}
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
    backgroundColor: '#F9F9FF',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  info: {
    fontSize: 16,
    alignSelf: 'flex-start',
    marginBottom: 10,
    color: '#333',
  },
  editButton: {
    marginTop: 20,
    backgroundColor: '#6D83F2',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
