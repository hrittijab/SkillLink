import { Ionicons } from '@expo/vector-icons'; // ✅ Back icon
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BASE_URL from '../config';

dayjs.extend(relativeTime);

export default function ConversationsScreen() {
  const [previews, setPreviews] = useState([]);
  const [myEmail, setMyEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchPreviews = async () => {
      const email = await AsyncStorage.getItem('userEmail');
      console.log('📧 Logged in user email:', email); // ✅ Log 1

      setMyEmail(email);

      try {
        const res = await fetch(`${BASE_URL}/api/messages/previews?email=${email}`);
        const data = await res.json();

        console.log('📨 Raw preview data from backend:', data); // ✅ Log 2
        setPreviews(data);
      } catch (err) {
        console.error('❌ Failed to fetch conversation previews:', err);
      }
    };

    fetchPreviews();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* ✅ Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/home')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#6D83F2" />
        </TouchableOpacity>
        <Text style={styles.title}>Chats</Text>
      </View>

      {previews.length === 0 ? (
        <Text style={styles.noChats}>No conversations yet.</Text>
      ) : (
        previews.map((item, idx) => {
          console.log('🧵 Rendering preview:', item); // ✅ Log 3
          return (
            <TouchableOpacity
              key={idx}
              style={styles.chatCard}
              onPress={() =>
                router.push({
                  pathname: '/chatscreen',
                  params: { email: item.otherUserEmail },
                })
              }
            >
              <View style={styles.row}>
                <Image
                  source={{
                    uri: item.profilePictureUrl || 'https://via.placeholder.com/50',
                  }}
                  style={styles.avatar}
                  onError={() =>
                    console.warn(`❌ Failed to load image for ${item.otherUserEmail}`)
                  }
                />
                <View style={styles.textContainer}>
                  <View style={styles.rowSpaceBetween}>
                    <Text style={styles.name}>{item.otherUserName}</Text>
                    <Text style={styles.timestamp}>
                      {dayjs(item.timestamp).fromNow()}
                    </Text>
                  </View>
                  <Text style={styles.lastMessage} numberOfLines={1}>
                    {item.lastMessage}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingTop: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    marginRight: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6D83F2',
  },
  chatCard: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowSpaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ccc',
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  noChats: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
    fontSize: 16,
  },
});
