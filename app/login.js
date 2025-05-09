import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          passwordHash: password, 
        }),
      });

      const data = await response.json(); 

      if (data.message === 'Login successful!') {
        await AsyncStorage.setItem('userEmail', email); 
        alert(data.message);
        router.push('/home');
      } else {
        alert(`Login failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('Login failed. Please check your network or server.');
    }
  };

  return (
    <LinearGradient colors={['#6D83F2', '#A775F2']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ width: '100%', alignItems: 'center' }}
      >
        <Text style={styles.title}>SkillLink</Text>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#999" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <Pressable style={({ pressed }) => [styles.loginButton, pressed && styles.buttonPressed]} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </Pressable>

          <Link href="/signup" asChild>
            <TouchableOpacity>
              <Text style={styles.signupText}>
                Don&apos;t have an account? <Text style={styles.signupLink}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 42, color: 'white', fontWeight: 'bold', marginBottom: 30 },
  formContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  icon: { marginRight: 8 },
  input: { flex: 1, height: 50, fontSize: 16 },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#6D83F2',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  signupText: { marginTop: 20, textAlign: 'center', color: '#333', fontSize: 14 },
  signupLink: { color: '#6D83F2', fontWeight: 'bold' },
  buttonPressed: { backgroundColor: '#5a6fe0' },
});
