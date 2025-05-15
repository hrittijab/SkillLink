import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Client } from '@stomp/stompjs';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import SockJS from 'sockjs-client';
import BASE_URL from '../config';

/**
 * ChatScreen component allows users to send and receive messages, view recipient info, and auto-scroll.
 */
export default function ChatScreen() {
  const { email: receiverEmail } = useLocalSearchParams();
  const router = useRouter();

  const [messages, setMessages] = useState([]);
  const [myEmail, setMyEmail] = useState('');
  const [content, setContent] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPic, setReceiverPic] = useState('');
  const [stompConnected, setStompConnected] = useState(false);
  const scrollViewRef = useRef(null);
  const stompClientRef = useRef(null);

  // Fetch messages and receiver info
  useEffect(() => {
    const init = async () => {
      const storedEmail = await AsyncStorage.getItem('userEmail');
      const token = await SecureStore.getItemAsync('jwtToken');
      if (!storedEmail || !token) return;

      setMyEmail(storedEmail);

      try {
        const res = await fetch(
          `${BASE_URL}/api/messages/conversation?user1=${storedEmail}&user2=${receiverEmail}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setMessages(data);
      } catch {}

      try {
        const nameRes = await fetch(`${BASE_URL}/api/users/${encodeURIComponent(receiverEmail)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (nameRes.ok) {
          const user = await nameRes.json();
          const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
          setReceiverName(fullName || receiverEmail);
          setReceiverPic(user.profilePictureUrl || '');
        } else {
          setReceiverName(receiverEmail);
        }
      } catch {
        setReceiverName(receiverEmail);
      }
    };

    init();
  }, [receiverEmail]);

  // Setup WebSocket connection for real-time messaging
  useEffect(() => {
    const socket = new SockJS(`${BASE_URL}/chat`);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        setStompConnected(true);
        client.subscribe('/topic/messages', (message) => {
          const body = JSON.parse(message.body);
          const isChatMessage =
            (body.senderEmail === myEmail && body.receiverEmail === receiverEmail) ||
            (body.senderEmail === receiverEmail && body.receiverEmail === myEmail);

          if (isChatMessage) {
            setMessages((prev) => [...prev, body]);
          }
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame.body);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      client.deactivate();
      setStompConnected(false);
    };
  }, [myEmail, receiverEmail]);

  // Handle sending a message
  const handleSend = async () => {
    if (!content.trim()) return;

    const message = {
      senderEmail: myEmail,
      receiverEmail,
      content,
    };

    setContent('');

    try {
      await fetch(`${BASE_URL}/api/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });

      if (stompClientRef.current?.connected) {
        stompClientRef.current.publish({
          destination: '/app/chat.send',
          body: JSON.stringify(message),
        });
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.wrapper}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/conversations')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        {receiverPic ? (
          <Image source={{ uri: receiverPic }} style={styles.avatar} />
        ) : (
          <View style={styles.initialCircle}>
            <Text style={styles.initialText}>
              {receiverName?.[0]?.toUpperCase() ?? '?'}
            </Text>
          </View>
        )}

        <Text style={styles.headerText} numberOfLines={1}>
          {receiverName}
        </Text>
      </View>

      {!stompConnected && (
        <View style={styles.connectionStatus}>
          <ActivityIndicator size="small" color="gray" />
          <Text style={styles.connectionText}>Connecting to chat...</Text>
        </View>
      )}

      <ScrollView
        ref={scrollViewRef}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
        contentContainerStyle={styles.messagesContainer}
      >
        {messages.map((msg, idx) => (
          <View
            key={idx}
            style={[
              styles.messageBubble,
              msg.senderEmail === myEmail ? styles.mine : styles.theirs,
            ]}
          >
            <Text style={styles.messageText}>{msg.content}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={content}
          onChangeText={setContent}
        />
        <Button title="Send" onPress={handleSend} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#6D83F2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 40 : 15,
  },
  backButton: { marginRight: 10 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'white',
  },
  initialCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  initialText: {
    color: '#6D83F2',
    fontWeight: 'bold',
    fontSize: 18,
  },
  headerText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    flexShrink: 1,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    justifyContent: 'center',
  },
  connectionText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  messagesContainer: { padding: 10 },
  messageBubble: {
    padding: 10,
    marginVertical: 4,
    maxWidth: '75%',
    borderRadius: 10,
  },
  mine: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
  },
  theirs: {
    backgroundColor: '#E5E5EA',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
    backgroundColor: 'white',
  },
});