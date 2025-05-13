import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import BASE_URL from '../config';

export default function HomeScreen() {
  const router = useRouter();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const email = await AsyncStorage.getItem('userEmail');
        const token = await SecureStore.getItemAsync('jwtToken');
        if (!email || !token) return;

        const res = await fetch(`${BASE_URL}/api/users/${encodeURIComponent(email)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch {}
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync('jwtToken');
      await AsyncStorage.removeItem('userEmail');
      router.replace('/login');
    } catch {
      alert('Logout failed. Please try again.');
    }
  };

  const handleGoToExploreSkills = () => router.push('/exploreskills');
  const handleAddPost = () => router.push('/addpost');

  const handleProfileDetails = () => {
    setSettingsVisible(false);
    setTimeout(() => router.push('/profile'), 100);
  };

  const handleChangePassword = () => {
    setSettingsVisible(false);
    setTimeout(() => setShowChangePassword(true), 100);
  };

  const handleDeleteAccount = () => {
    setSettingsVisible(false);
    setTimeout(() => setShowDeleteConfirm(true), 100);
  };

  return (
    <LinearGradient colors={['#6D83F2', '#A775F2']} style={styles.container}>
      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={() => setSettingsVisible(true)}>
          {user?.profilePictureUrl ? (
            <Image source={{ uri: user.profilePictureUrl }} style={styles.profileImage} />
          ) : (
            <View style={styles.avatarCircle}>
              <Ionicons name="person-circle-outline" size={40} color="white" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.messagesIconContainer}>
        <TouchableOpacity onPress={() => router.push('/conversations')}>
          <Ionicons name="chatbubble-ellipses-outline" size={32} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.innerContainer}>
        <Text style={styles.title}>Welcome to SkillLink!</Text>
        <Text style={styles.subtitle}>
          Start exploring skills, offer to teach, or connect with others!
        </Text>

        <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={handleGoToExploreSkills}>
          <Text style={styles.buttonText}>Explore Skills</Text>
        </Pressable>

        <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={handleAddPost}>
          <Text style={styles.buttonText}>Add a Post</Text>
        </Pressable>
      </View>

      <Modal visible={settingsVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Account Settings</Text>

            <Pressable style={styles.modalButton} onPress={handleDeleteAccount}>
              <Text style={styles.modalButtonText}>Delete Account</Text>
            </Pressable>

            <Pressable style={styles.modalButton} onPress={handleProfileDetails}>
              <Text style={styles.modalButtonText}>Profile Details</Text>
            </Pressable>

            <Pressable style={styles.modalButton} onPress={handleChangePassword}>
              <Text style={styles.modalButtonText}>Change Password</Text>
            </Pressable>

            <Pressable
              style={styles.modalButton}
              onPress={() => {
                setSettingsVisible(false);
                setTimeout(() => router.push('/myposts'), 100);
              }}
            >
              <Text style={styles.modalButtonText}>My Posts</Text>
            </Pressable>

            <Pressable style={styles.modalButton} onPress={handleLogout}>
              <Text style={styles.modalButtonText}>Logout</Text>
            </Pressable>

            <Pressable style={styles.closeButton} onPress={() => setSettingsVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showDeleteConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirm Deletion</Text>
            <Text>Enter your password to delete your account:</Text>
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={deletePassword}
              onChangeText={setDeletePassword}
            />
            <Pressable
              style={styles.modalButton}
              onPress={async () => {
                const email = await AsyncStorage.getItem('userEmail');
                const token = await SecureStore.getItemAsync('jwtToken');

                const res = await fetch(`${BASE_URL}/api/users/verify-password`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ email, password: deletePassword }),
                });

                if (res.ok) {
                  await fetch(`${BASE_URL}/api/users/delete?email=${encodeURIComponent(email)}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  await SecureStore.deleteItemAsync('jwtToken');
                  await AsyncStorage.removeItem('userEmail');
                  setShowDeleteConfirm(false);
                  router.replace('/signup');
                } else {
                  alert('Incorrect password.');
                }
              }}
            >
              <Text style={styles.modalButtonText}>Confirm Delete</Text>
            </Pressable>
            <Pressable onPress={() => setShowDeleteConfirm(false)}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showChangePassword} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Change Password</Text>

            <TextInput
              style={styles.input}
              placeholder="Old Password"
              secureTextEntry
              value={oldPassword}
              onChangeText={setOldPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="New Password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Retype New Password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <Pressable
              style={styles.modalButton}
              onPress={async () => {
                if (newPassword !== confirmPassword) {
                  alert('Passwords do not match!');
                  return;
                }

                const email = await AsyncStorage.getItem('userEmail');
                const token = await SecureStore.getItemAsync('jwtToken');

                const res = await fetch(`${BASE_URL}/api/users/change-password`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ email, oldPassword, newPassword }),
                });

                if (res.ok) {
                  alert('Password changed!');
                  setShowChangePassword(false);
                } else {
                  alert('Old password incorrect.');
                }
              }}
            >
              <Text style={styles.modalButtonText}>Change Password</Text>
            </Pressable>
            <Pressable onPress={() => setShowChangePassword(false)}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  avatarContainer: {
    position: 'absolute',
    top: 45,
    right: 20,
    zIndex: 1,
  },
  avatarCircle: {
    backgroundColor: '#ffffff40',
    borderRadius: 40,
    padding: 6,
  },
  profileImage: {
    width: 55,
    height: 55,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'lavender',
  },
  messagesIconContainer: {
    position: 'absolute',
    top: 45,
    left: 20,
    zIndex: 1,
    backgroundColor: '#ffffff40',
    borderRadius: 40,
    padding: 6,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 38,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#f1f1f1',
    textAlign: 'center',
    marginBottom: 35,
  },
  button: {
    width: '100%',
    height: 52,
    backgroundColor: 'white',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: '#6D83F2',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonPressed: {
    backgroundColor: '#f2f2f2',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 25,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  modalButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#6D83F2',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    marginTop: 10,
  },
  closeButtonText: {
    color: '#6D83F2',
    fontSize: 15,
    fontWeight: '600',
  },
  input: {
    width: '100%',
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginVertical: 6,
    backgroundColor: '#fafafa',
  },
});
