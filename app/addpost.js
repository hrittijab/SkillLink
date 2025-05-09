import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

export default function AddPostScreen() {
  const router = useRouter();

  const [skillName, setSkillName] = useState('');
  const [preferenceType, setPreferenceType] = useState('TEACH');
  const [paymentType, setPaymentType] = useState('FREE');
  const [price, setPrice] = useState('');
  const [exchangeSkillInput, setExchangeSkillInput] = useState('');
  const [exchangeSkills, setExchangeSkills] = useState([]);

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
      if (!userEmail) {
        Alert.alert('Login Required', 'Please log in again.');
        router.push('/login');
        return;
      }

      const payload = {
        userEmail,
        skillName,
        preferenceType,
        paymentType,
      };

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

      const response = await fetch('http://localhost:8080/api/skills/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert('Success', result.message || 'Skill posted!');
        router.push('/home');
      } else {
        Alert.alert('Failed', result.message || 'Something went wrong.');
      }
    } catch (error) {
      console.error('Error submitting skill:', error);
      Alert.alert('Error', 'Could not submit skill.');
    }
  };

  return (
    <LinearGradient colors={['#6D83F2', '#A775F2']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%', alignItems: 'center' }}>
        <Text style={styles.title}>Add a New Skill</Text>

        <View style={styles.formContainer}>
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
              <Text style={styles.label}>Skills to exchange (one-for-one)</Text>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="e.g. Spanish"
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
            <Text style={styles.submitButtonText}>Post Skill</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 32, color: 'white', fontWeight: 'bold', marginVertical: 30, textAlign: 'center' },
  formContainer: { width: '85%', backgroundColor: 'white', borderRadius: 20, padding: 20, elevation: 6, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12 },
  input: { height: 50, backgroundColor: '#f5f5f5', borderRadius: 10, paddingHorizontal: 15, fontSize: 16, marginBottom: 15 },
  label: { fontSize: 16, color: '#555', marginBottom: 5, marginTop: 10 },
  picker: { height: 50, backgroundColor: '#f5f5f5', borderRadius: 10, marginBottom: 15 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  addButton: { backgroundColor: '#6D83F2', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10, marginLeft: 10 },
  addButtonText: { color: 'white', fontWeight: 'bold' },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 10 },
  tag: { backgroundColor: '#e0e0e0', borderRadius: 15, paddingHorizontal: 10, paddingVertical: 5, margin: 3 },
  tagText: { fontSize: 14 },
  submitButton: { height: 50, backgroundColor: '#6D83F2', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  submitButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  buttonPressed: { backgroundColor: '#5a6fe0' },
});
