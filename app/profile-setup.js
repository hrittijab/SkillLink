import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function ProfileSetupScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true); // ⭐ loading spinner
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [skillsOffered, setSkillsOffered] = useState('');
  const [skillsWanted, setSkillsWanted] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem('userEmail');
        if (storedEmail) {
          setEmail(storedEmail);

          const response = await fetch(`http://localhost:8080/api/users/${storedEmail}`);
          if (response.ok) {
            const userData = await response.json();

            // ⭐ Check if profile already exists
            if (userData.firstName && userData.lastName && userData.bio) {
              // Profile is already filled — skip to home
              router.push('/home');
              return;
            }

            // If profile not completed yet, allow user to fill
            setFirstName(userData.firstName || '');
            setLastName(userData.lastName || '');
            setBio(userData.bio || '');
            setSkillsOffered(userData.skillsOffered || '');
            setSkillsWanted(userData.skillsWanted || '');
          } else {
            alert('Failed to fetch profile from server.');
          }
        } else {
          alert('No logged-in user found. Please login again.');
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false); // ⭐ Done loading
      }
    };
    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    if (!firstName || !lastName || !bio) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/profile/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          firstName: firstName,
          lastName: lastName,
          bio: bio,
          skillsOffered: skillsOffered,
          skillsWanted: skillsWanted,
        }),
      });

      if (response.ok) {
        alert('Profile saved successfully!');
        console.log('Profile updated');
        router.push('/home');
      } else {
        const data = await response.json();
        alert(`Profile save failed: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Profile save failed. Check your network or server.');
    }
  };

  const getInitial = () => {
    if (firstName.length > 0) {
      return firstName.charAt(0).toUpperCase();
    }
    return '?';
  };

  if (loading) {
    // ⭐ Show loading spinner while fetching profile
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6D83F2" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#6D83F2', '#A775F2']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ width: '100%', alignItems: 'center' }}>
        <Text style={styles.title}>Complete Your Profile</Text>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitial()}</Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput style={styles.input} placeholder="First Name" value={firstName} onChangeText={setFirstName} />
          <TextInput style={styles.input} placeholder="Last Name" value={lastName} onChangeText={setLastName} />
          <TextInput style={styles.input} placeholder="Short Bio" multiline value={bio} onChangeText={setBio} />
          <TextInput style={styles.input} placeholder="Skills Offered" value={skillsOffered} onChangeText={setSkillsOffered} />
          <TextInput style={styles.input} placeholder="Skills Wanted" value={skillsWanted} onChangeText={setSkillsWanted} />

          <Pressable style={({ pressed }) => [styles.saveButton, pressed && styles.buttonPressed]} onPress={handleSaveProfile}>
            <Text style={styles.saveButtonText}>Save Profile</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }, // ⭐ Loading screen
  title: { fontSize: 34, color: 'white', fontWeight: 'bold', marginBottom: 20 },
  avatar: { backgroundColor: '#f5f5f5', width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  avatarText: { fontSize: 36, color: '#6D83F2', fontWeight: 'bold' },
  formContainer: { width: '85%', backgroundColor: 'white', borderRadius: 20, padding: 20, elevation: 6, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12 },
  input: { width: '100%', height: 50, backgroundColor: '#f5f5f5', borderRadius: 10, paddingHorizontal: 15, fontSize: 16, marginBottom: 15 },
  saveButton: { width: '100%', height: 50, backgroundColor: '#6D83F2', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  buttonPressed: { backgroundColor: '#5a6fe0' },
});
