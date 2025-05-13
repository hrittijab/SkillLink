import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import BASE_URL from '../config';

export default function EditProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [editedUser, setEditedUser] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const email = await AsyncStorage.getItem('userEmail');
      const token = await SecureStore.getItemAsync('jwtToken');

      const res = await fetch(`${BASE_URL}/api/users/${encodeURIComponent(email)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setUser(data);
      setEditedUser(data);
    };
    fetchUser();
  }, []);

  const handleFieldChange = (key, value) => {
    setEditedUser({ ...editedUser, [key]: value });
  };

  const uploadToS3 = async (localUri) => {
    const email = await AsyncStorage.getItem('userEmail');
    const token = await SecureStore.getItemAsync('jwtToken');
    const formData = new FormData();

    formData.append('email', email);
    formData.append('file', {
      uri: localUri,
      name: 'profile.jpg',
      type: 'image/jpeg',
    });

    const res = await fetch(`${BASE_URL}/api/users/upload-profile-picture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!res.ok) throw new Error('Failed to upload image');
    return await res.text();
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert('Permission to access gallery is required!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      try {
        const s3Url = await uploadToS3(result.assets[0].uri);
        handleFieldChange('profilePictureUrl', s3Url);
      } catch (err) {
        console.error(err);
        alert('Image upload failed.');
      }
    }
  };

  const handleSaveClick = () => {
    setShowPasswordModal(true);
  };

  const handleVerifyAndSave = async () => {
    try {
      const email = await AsyncStorage.getItem('userEmail');
      const token = await SecureStore.getItemAsync('jwtToken');

      const verifyRes = await fetch(`${BASE_URL}/api/users/verify-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, password }),
      });

      if (!verifyRes.ok) {
        Alert.alert('Incorrect Password', 'Please enter the correct password to save changes.');
        return;
      }

      const updateRes = await fetch(`${BASE_URL}/api/users/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editedUser),
      });

      if (updateRes.ok) {
        Alert.alert('Success', 'Your profile was updated.');
        setShowPasswordModal(false);
        router.replace('/profile');
      } else {
        throw new Error('Update failed');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not update your profile.');
    }
  };

  if (!editedUser) {
    return (
      <View style={styles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={pickImage}>
          {editedUser.profilePictureUrl ? (
            <Image source={{ uri: editedUser.profilePictureUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderText}>Upload</Text>
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.name}>{editedUser.firstName} {editedUser.lastName}</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Profile Information</Text>

        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={styles.input}
          value={editedUser.firstName || ''}
          onChangeText={(text) => handleFieldChange('firstName', text)}
        />

        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={styles.input}
          value={editedUser.lastName || ''}
          onChangeText={(text) => handleFieldChange('lastName', text)}
        />

        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={editedUser.bio || ''}
          onChangeText={(text) => handleFieldChange('bio', text)}
          multiline
        />

        <Text style={styles.label}>Skills Offered</Text>
        <TextInput
          style={styles.input}
          value={editedUser.skillsOffered || ''}
          onChangeText={(text) => handleFieldChange('skillsOffered', text)}
        />

        <Text style={styles.label}>Skills Wanted</Text>
        <TextInput
          style={styles.input}
          value={editedUser.skillsWanted || ''}
          onChangeText={(text) => handleFieldChange('skillsWanted', text)}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveClick}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showPasswordModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirm Changes</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleVerifyAndSave}>
              <Text style={styles.saveButtonText}>Confirm and Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#F0F4FF' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: 20 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderColor: '#6D83F2',
    borderWidth: 2,
    marginBottom: 10,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#d6d6fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarPlaceholderText: {
    color: '#6D83F2',
    fontWeight: 'bold',
  },
  name: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  form: { backgroundColor: 'white', borderRadius: 12, padding: 16, elevation: 4 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#444',
  },
  label: { fontSize: 14, fontWeight: '600', marginTop: 12, marginBottom: 4, color: '#555' },
  input: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    fontSize: 14,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#6D83F2',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    backgroundColor: '#ddd',
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cancelText: {
    marginTop: 10,
    color: '#6D83F2',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
