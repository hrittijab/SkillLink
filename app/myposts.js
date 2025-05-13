import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BASE_URL from '../config';

export default function MyPostsScreen() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUserPosts = useCallback(async () => {
    try {
      const email = await AsyncStorage.getItem('userEmail');
      const token = await SecureStore.getItemAsync('jwtToken');

      if (!email || !token) {
        Alert.alert('Error', 'User not logged in');
        router.replace('/login');
        return;
      }

      const res = await fetch(`${BASE_URL}/api/skills/user?email=${encodeURIComponent(email)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error('Error fetching user posts:', err);
      Alert.alert('Error', 'Could not load your posts.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUserPosts();
  }, [fetchUserPosts]);

  useFocusEffect(
    useCallback(() => {
      fetchUserPosts();
    }, [fetchUserPosts])
  );

  const handleDelete = async (id) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await SecureStore.getItemAsync('jwtToken');
            const res = await fetch(`${BASE_URL}/api/skills/delete/${id}`, {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (!res.ok) {
              const text = await res.text();
              Alert.alert('Delete Failed', text || 'Something went wrong.');
              return;
            }

            setPosts((prev) => prev.filter((post) => post.id !== id));
          } catch (err) {
            console.error('Delete error:', err);
            Alert.alert('Error', 'Failed to delete post.');
          }
        },
      },
    ]);
  };

  const handleEdit = (post) => {
    router.push({
      pathname: '/editpost',
      params: { id: post.id },
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6D83F2" />
        <Text>Loading your posts...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 🔙 Back Button */}
      <TouchableOpacity onPress={() => router.push('/home')} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>

      <Text style={styles.header}>Your Posts</Text>
      {posts.length === 0 ? (
        <Text style={styles.empty}>You haven’t posted any skills yet.</Text>
      ) : (
        posts.map((post) => (
          <View key={post.id} style={styles.card}>
            <Text style={styles.title}>{post.skillName}</Text>
            <Text>Type: {post.preferenceType}</Text>
            <Text>Payment: {post.paymentType}</Text>
            {post.paymentType === 'PAID' && <Text>Price: ${post.price}</Text>}
            {post.exchangeSkills?.length > 0 && (
              <Text>Exchange for: {post.exchangeSkills.join(', ')}</Text>
            )}
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(post)}>
                <Text style={styles.btnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(post.id)}>
                <Text style={styles.btnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: StatusBar.currentHeight || 24,
    paddingHorizontal: 16,
    paddingBottom: 24,
    backgroundColor: '#f0f3ff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f3ff',
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#6D83F2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 14,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c2c2c',
    textAlign: 'center',
    marginBottom: 20,
  },
  empty: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 80,
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  editBtn: {
    backgroundColor: '#6D83F2',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  deleteBtn: {
    backgroundColor: '#d9534f',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  btnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
