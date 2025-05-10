import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
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
      if (!email) {
        Alert.alert('Error', 'User not logged in');
        router.replace('/login');
        return;
      }

      const res = await fetch(`${BASE_URL}/api/skills/user?email=${encodeURIComponent(email)}`);
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
            const res = await fetch(`${BASE_URL}/api/skills/delete/${id}`, {
              method: 'DELETE',
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
