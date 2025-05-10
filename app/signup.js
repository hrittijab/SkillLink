import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
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
import BASE_URL from '../config';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const calculateStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    setPasswordStrength(calculateStrength(text));
  };

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) return alert('Please fill in all fields.');
    if (!validateEmail(email)) return alert('Invalid email format.');
    if (password !== confirmPassword) return alert('Passwords do not match!');
    if (passwordStrength < 5) return alert('Password is too weak.');

    try {
      const response = await fetch(`${BASE_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          passwordHash: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem('userEmail', email);
        alert(data.message || 'Signup successful!');
        router.push('/profile-setup');
      } else {
        alert(`Signup failed: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error during signup:', error);
      alert('Signup failed. Please check your network or server.');
    }
  };

  return (
    <LinearGradient colors={['#6D83F2', '#A775F2']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%', alignItems: 'center' }}>
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
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={handlePasswordChange}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Strength bar */}
          <View style={styles.strengthBarContainer}>
            <View style={[styles.strengthBar, { width: `${(passwordStrength / 5) * 100}%`, backgroundColor: getStrengthColor(passwordStrength) }]} />
          </View>
          <Text style={styles.strengthText}>{getStrengthLabel(passwordStrength)}</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#999"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color="#999" />
            </TouchableOpacity>
          </View>

          <Pressable style={({ pressed }) => [styles.signupButton, pressed && styles.buttonPressed]} onPress={handleSignup}>
            <Text style={styles.signupButtonText}>Sign Up</Text>
          </Pressable>

          <Link href="/login" asChild>
            <TouchableOpacity>
              <Text style={styles.loginText}>
                Already have an account? <Text style={styles.loginLink}>Login</Text>
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const getStrengthColor = (strength) => {
  switch (strength) {
    case 5: return '#4caf50'; // strong
    case 4: return '#8bc34a'; // good
    case 3: return '#ffc107'; // okay
    case 2: return '#ff9800'; // weak
    default: return '#f44336'; // very weak
  }
};

const getStrengthLabel = (strength) => {
  switch (strength) {
    case 5: return 'Strong password ✔️';
    case 4: return 'Good password';
    case 3: return 'Medium strength';
    case 2: return 'Weak password';
    default: return 'Very weak';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 30,
  },
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
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  strengthBarContainer: {
    height: 8,
    backgroundColor: '#ddd',
    borderRadius: 5,
    marginBottom: 6,
  },
  strengthBar: {
    height: 8,
    borderRadius: 5,
  },
  strengthText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
    marginLeft: 5,
  },
  signupButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#6D83F2',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  signupButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#333',
    fontSize: 14,
  },
  loginLink: {
    color: '#6D83F2',
    fontWeight: 'bold',
  },
  buttonPressed: {
    backgroundColor: '#5a6fe0',
  },
});
