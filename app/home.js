import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [settingsVisible, setSettingsVisible] = useState(false);

  const handleGoToExploreSkills = () => router.push('/skills');
  const handleAddPost = () => router.push('/add-post'); // ⭐ you will make this page later

  const handleDeleteAccount = () => {
    // TODO: Add delete logic
    alert('Delete Account clicked!');
  };

  const handleProfileDetails = () => {
    router.push('/profile'); // or '/profile-details' if you make a new page
  };

  const handleChangePassword = () => {
    router.push('/change-password'); // ⭐ you will make this page later
  };

  return (
    <LinearGradient colors={['#6D83F2', '#A775F2']} style={styles.container}>
      {/* Avatar in top-right corner */}
      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={() => setSettingsVisible(true)}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person-circle-outline" size={40} color="white" />
          </View>
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

            <Pressable style={styles.closeButton} onPress={() => setSettingsVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  avatarContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  avatarCircle: {
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
  buttonPressed: {
    backgroundColor: '#e0e0e0',
  },
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
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#6D83F2',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 10,
  },
  closeButtonText: {
    color: '#6D83F2',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
