import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import BASE_URL from '../config';

export default function AddPostScreen() {
  const router = useRouter();
  const [skillName, setSkillName] = useState('');
  const [preferenceType, setPreferenceType] = useState('TEACH');
  const [paymentType, setPaymentType] = useState('FREE');
  const [price, setPrice] = useState('');
  const [exchangeSkills, setExchangeSkills] = useState([]);
  const [exchangeSkillInput, setExchangeSkillInput] = useState('');

  const addExchangeSkill = () => {
    const trimmed = exchangeSkillInput.trim();
    if (trimmed && !exchangeSkills.includes(trimmed)) {
      setExchangeSkills([...exchangeSkills, trimmed]);
      setExchangeSkillInput('');
    }
  };

  const handleSubmit = async () => {
    if (!skillName) {
      Alert.alert('Missing Field', 'Please enter a skill name.');
      return;
    }

    try {
      const userEmail = await AsyncStorage.getItem('userEmail');
      const token = await SecureStore.getItemAsync('jwtToken');

      if (!userEmail || !token) {
        Alert.alert('Login Required', 'Please log in again.');
        router.push('/login');
        return;
      }

      const payload = { userEmail, skillName, preferenceType, paymentType };
      if (paymentType === 'PAID') {
        if (!price) {
          Alert.alert('Missing Price', 'Please enter a price.');
          return;
        }
        payload.price = parseFloat(price);
      }

      if (paymentType === 'EXCHANGE') {
        if (exchangeSkills.length === 0) {
          Alert.alert('Missing Skills', 'Please add at least one skill to exchange.');
          return;
        }
        payload.exchangeSkills = exchangeSkills;
      }

      const res = await fetch(`${BASE_URL}/api/skills/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        Alert.alert('Success', result.message || 'Skill posted!');
        router.replace('/home');
      } else {
        Alert.alert('Failed', result.message || 'Something went wrong.');
      }
    } catch (err) {
      console.error('Error submitting skill:', err);
      Alert.alert('Error', 'Could not submit skill.');
    }
  };

  return (
    <LinearGradient colors={['#6D83F2', '#A775F2']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            {/* 🔙 Back Button */}
            <TouchableOpacity onPress={() => router.push('/home')} style={styles.backButton}>
              <Ionicons name="arrow-back" size={28} color="white" />
            </TouchableOpacity>

            <Text style={styles.title}>Add New Skill</Text>

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Skill Name"
                value={skillName}
                onChangeText={setSkillName}
              />

              <Text style={styles.label}>Preference Type</Text>
              <Picker selectedValue={preferenceType} onValueChange={setPreferenceType} style={styles.picker}>
                <Picker.Item label="Teach" value="TEACH" />
                <Picker.Item label="Learn" value="LEARN" />
              </Picker>

              <Text style={styles.label}>Payment Type</Text>
              <Picker selectedValue={paymentType} onValueChange={setPaymentType} style={styles.picker}>
                <Picker.Item label="Free" value="FREE" />
                <Picker.Item label="Paid" value="PAID" />
                <Picker.Item label="Exchange" value="EXCHANGE" />
              </Picker>

              {paymentType === 'PAID' && (
                <TextInput
                  style={styles.input}
                  placeholder="Enter Price"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />
              )}

              {paymentType === 'EXCHANGE' && (
                <>
                  <Text style={styles.label}>Skills to exchange</Text>
                  <View style={styles.row}>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      placeholder="e.g. Cooking"
                      value={exchangeSkillInput}
                      onChangeText={setExchangeSkillInput}
                      onSubmitEditing={addExchangeSkill}
                    />
                    <Pressable style={styles.addButton} onPress={addExchangeSkill}>
                      <Text style={styles.addButtonText}>Add</Text>
                    </Pressable>
                  </View>
                  <View style={styles.tagsContainer}>
                    {exchangeSkills.map((skill, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}

              <Pressable style={({ pressed }) => [styles.submitButton, pressed && styles.buttonPressed]} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Submit</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 100,
    padding: 10,
    backgroundColor: 'transparent',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    elevation: 6,
  },
  input: {
    height: 50,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
    marginTop: 10,
  },
  picker: {
    height: 50,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#6D83F2',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginLeft: 10,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  tag: {
    backgroundColor: '#e0e0e0',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    margin: 3,
  },
  tagText: {
    fontSize: 14,
  },
  submitButton: {
    height: 50,
    backgroundColor: '#6D83F2',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonPressed: {
    backgroundColor: '#5a6fe0',
  },
});
