import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Picker, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function AddPostScreen() {
  const router = useRouter();

  const [skillName, setSkillName] = useState('');
  const [preferenceType, setPreferenceType] = useState('TEACH');
  const [paymentType, setPaymentType] = useState('FREE');
  const [price, setPrice] = useState('');
  const [exchangeSkill, setExchangeSkill] = useState('');

  const handleSubmit = async () => {
    if (!skillName) {
      alert('Please enter a skill name.');
      return;
    }

    try {
      const userEmail = await AsyncStorage.getItem('userEmail');
      if (!userEmail) {
        alert('No user logged in. Please login again.');
        router.push('/login');
        return;
      }

      const payload = {
        userEmail: userEmail,
        skillName: skillName,
        preferenceType: preferenceType,
        paymentType: paymentType,
      };

      if (paymentType === 'PAID') {
        payload.price = parseFloat(price);
      }
      if (paymentType === 'EXCHANGE') {
        payload.exchangeSkill = exchangeSkill;
      }

      const response = await fetch('http://localhost:8080/api/skills/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert('Skill posted successfully!');
        router.push('/home');
      } else {
        alert('Failed to post skill.');
      }
    } catch (error) {
      console.error('Error posting skill:', error);
      alert('Something went wrong. Try again.');
    }
  };

  return (
    <LinearGradient colors={['#6D83F2', '#A775F2']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ width: '100%', alignItems: 'center' }}>
        <Text style={styles.title}>Add a New Skill</Text>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Skill Name"
            value={skillName}
            onChangeText={setSkillName}
          />

          <Text style={styles.label}>Preference Type</Text>
          <Picker
            selectedValue={preferenceType}
            onValueChange={(itemValue) => setPreferenceType(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Teach" value="TEACH" />
            <Picker.Item label="Learn" value="LEARN" />
          </Picker>

          <Text style={styles.label}>Payment Type</Text>
          <Picker
            selectedValue={paymentType}
            onValueChange={(itemValue) => setPaymentType(itemValue)}
            style={styles.picker}
          >
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
            <TextInput
              style={styles.input}
              placeholder="Skill you want in exchange"
              value={exchangeSkill}
              onChangeText={setExchangeSkill}
            />
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
  container: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
    marginVertical: 30,
    textAlign: 'center',
  },
  formContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  input: {
    width: '100%',
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
    width: '100%',
    height: 50,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 15,
  },
  submitButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#6D83F2',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
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
