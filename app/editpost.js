import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
import BASE_URL from '../config';

export default function EditPostScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [post, setPost] = useState(null);
  const [exchangeSkillInput, setExchangeSkillInput] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      const res = await fetch(`${BASE_URL}/api/skills/all`);
      const data = await res.json();
      const targetPost = data.find((p) => p.id === id);
      setPost(targetPost);
    };
    fetchPost();
  }, []);

  const handleChange = (field, value) => {
    setPost({ ...post, [field]: value });
  };

  const addExchangeSkill = () => {
    const trimmed = exchangeSkillInput.trim();
    if (trimmed && !post.exchangeSkills?.includes(trimmed)) {
      setPost({ ...post, exchangeSkills: [...(post.exchangeSkills || []), trimmed] });
      setExchangeSkillInput('');
    }
  };

  const handleSubmit = async () => {
    try {
      const userEmail = await AsyncStorage.getItem('userEmail');
      const payload = {
        ...post,
        userEmail,
        price: post.paymentType === 'PAID' ? parseFloat(post.price) : null,
        exchangeSkills: post.paymentType === 'EXCHANGE' ? post.exchangeSkills || [] : [],
      };

      const res = await fetch(`${BASE_URL}/api/skills/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        Alert.alert('Updated', 'Post updated successfully!');
        router.replace('/myposts');
      } else {
        Alert.alert('Failed', 'Could not update post.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Update failed.');
    }
  };

  if (!post) {
    return (
      <View style={styles.centered}>
        <Text>Loading post...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#6D83F2', '#A775F2']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%', alignItems: 'center' }}>
        <Text style={styles.title}>Edit Your Post</Text>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Skill Name"
            value={post.skillName}
            onChangeText={(text) => handleChange('skillName', text)}
          />

          <Text style={styles.label}>Preference Type</Text>
          <Picker selectedValue={post.preferenceType} onValueChange={(val) => handleChange('preferenceType', val)} style={styles.picker}>
            <Picker.Item label="Teach" value="TEACH" />
            <Picker.Item label="Learn" value="LEARN" />
          </Picker>

          <Text style={styles.label}>Payment Type</Text>
          <Picker selectedValue={post.paymentType} onValueChange={(val) => handleChange('paymentType', val)} style={styles.picker}>
            <Picker.Item label="Free" value="FREE" />
            <Picker.Item label="Paid" value="PAID" />
            <Picker.Item label="Exchange" value="EXCHANGE" />
          </Picker>

          {post.paymentType === 'PAID' && (
            <TextInput
              style={styles.input}
              placeholder="Enter Price"
              keyboardType="numeric"
              value={post.price?.toString() || ''}
              onChangeText={(val) => handleChange('price', val)}
            />
          )}

          {post.paymentType === 'EXCHANGE' && (
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
                {post.exchangeSkills?.map((skill, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          <Pressable style={({ pressed }) => [styles.submitButton, pressed && styles.buttonPressed]} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Save Changes</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 32, color: 'white', fontWeight: 'bold', marginVertical: 30, textAlign: 'center' },
  formContainer: { width: '85%', backgroundColor: 'white', borderRadius: 20, padding: 20, elevation: 6 },
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
