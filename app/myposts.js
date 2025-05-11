import { Ionicons } from '@expo/vector-icons'; // ✅ Add this
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
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
    padding: 20,
    backgroundColor: '#f2f4ff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#6D83F2',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  empty: {
    textAlign: 'center',
    color: '#555',
    marginTop: 40,
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  editBtn: {
    backgroundColor: '#6D83F2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  deleteBtn: {
    backgroundColor: '#d9534f',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
