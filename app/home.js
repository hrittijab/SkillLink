import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import {
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

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync('jwtToken');
      await AsyncStorage.removeItem('userEmail');
      router.replace('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Logout failed. Please try again.');
    }
  };

  return (
    <LinearGradient colors={['#6D83F2', '#A775F2']} style={styles.container}>
      {/* Top-right Avatar */}
      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={() => setSettingsVisible(true)}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person-circle-outline" size={40} color="white" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Top-left Messages Icon */}
      <View style={styles.messagesIconContainer}>
        <TouchableOpacity onPress={() => router.push('/conversations')}>
          <Ionicons name="chatbubble-ellipses-outline" size={32} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.innerContainer}>
        <Text style={styles.title}>Welcome to SkillLink! 🎉</Text>
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

      {/* Settings Modal */}
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

      {/* Delete Account Modal */}
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
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
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

      {/* Change Password Modal */}
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
  avatarContainer: { position: 'absolute', top: 50, right: 20, zIndex: 1 },
  avatarCircle: { backgroundColor: '#ffffff30', borderRadius: 30, padding: 5 },
  messagesIconContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
    backgroundColor: '#ffffff30',
    borderRadius: 30,
    padding: 5,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: 'white',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#6D83F2',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonPressed: { backgroundColor: '#e0e0e0' },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  modalButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#6D83F2',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  modalButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  closeButton: { marginTop: 10 },
  closeButtonText: { color: '#6D83F2', fontSize: 16, fontWeight: 'bold' },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginVertical: 8,
    backgroundColor: '#fff',
  },
});
