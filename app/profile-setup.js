import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import BASE_URL from '../config';

export default function ProfileSetupScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [skillsOffered, setSkillsOffered] = useState('');
  const [skillsWanted, setSkillsWanted] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const storedEmail = await AsyncStorage.getItem('userEmail');
      const token = await SecureStore.getItemAsync('jwtToken');
      if (!storedEmail || !token) {
        alert('No logged-in user found. Please login again.');
        router.push('/login');
        return;
      }
      setEmail(storedEmail);
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const uploadToS3 = async (localUri) => {
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
        setProfilePictureUrl(s3Url);
      } catch (err) {
        console.error(err);
        alert('Image upload failed.');
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!firstName || !lastName || !bio) {
      alert('Please fill in all required fields.');
      return;
    }
    const token = await SecureStore.getItemAsync('jwtToken');
    const payload = {
      email,
      firstName,
      lastName,
      bio,
      skillsOffered,
      skillsWanted,
      profilePictureUrl,
    };

    const response = await fetch(`${BASE_URL}/api/users/profile/setup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      alert('Profile saved!');
      router.push('/home');
    } else {
      alert('Failed to save profile');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6D83F2" />
      </View>
    );
  }

  return (
    <LinearGradient colors={["#6D83F2", "#A775F2"]} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%', alignItems: 'center' }}>
        <Text style={styles.title}>Complete Your Profile</Text>
        <TouchableOpacity onPress={pickImage}>
          {profilePictureUrl ? (
            <Image source={{ uri: profilePictureUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase() || '?'}</Text>
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.formContainer}>
          <TextInput style={styles.input} placeholder="First Name" value={firstName} onChangeText={setFirstName} />
          <TextInput style={styles.input} placeholder="Last Name" value={lastName} onChangeText={setLastName} />
          <TextInput style={styles.input} placeholder="Short Bio" value={bio} onChangeText={setBio} multiline />
          <TextInput style={styles.input} placeholder="Skills Offered" value={skillsOffered} onChangeText={setSkillsOffered} />
          <TextInput style={styles.input} placeholder="Skills Wanted" value={skillsWanted} onChangeText={setSkillsWanted} />
          <Pressable style={styles.saveButton} onPress={handleSaveProfile}>
            <Text style={styles.saveButtonText}>Save Profile</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' },
  title: { fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 20 },
  avatarPlaceholder: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#f5f5f5',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  avatarText: { fontSize: 36, color: '#6D83F2', fontWeight: 'bold' },
  formContainer: {
    width: '85%', backgroundColor: 'white', borderRadius: 20, padding: 20,
    elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12,
  },
  input: {
    width: '100%', height: 50, backgroundColor: '#f5f5f5',
    borderRadius: 10, paddingHorizontal: 15, fontSize: 16, marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#6D83F2', padding: 15, borderRadius: 10,
    alignItems: 'center', marginTop: 10,
  },
  saveButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
