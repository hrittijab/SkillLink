import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

export default function ExploreSkillsScreen() {
  const router = useRouter();
  const [skills, setSkills] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/skills/all');
      if (response.ok) {
        const data = await response.json();
        setSkills(data || []);
      } else {
        alert('Failed to load skills');
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
      alert('Error fetching skills');
    }
    setLoading(false);
  };

  const filteredSkills = skills.filter(skill =>
    (skill && skill.skillName ? skill.skillName.toLowerCase() : '').includes(searchQuery.toLowerCase())
  );

  const renderSkillCard = ({ item }) => {
    if (!item) return null;

    return (
      <View style={styles.card}>
        <Text style={styles.skillName}>
          {item.skillName || 'Unnamed Skill'}
        </Text>

        <Text style={styles.skillDetails}>
          {(item.preferenceType || 'Unknown')} • {(item.paymentType || 'Unknown')}
        </Text>

        {item.paymentType === 'PAID' && item.price != null && (
          <Text style={styles.skillDetails}>Price: ${item.price}</Text>
        )}

        {item.paymentType === 'EXCHANGE' && item.exchangeSkill && (
          <Text style={styles.skillDetails}>Exchange for: {item.exchangeSkill}</Text>
        )}
      </View>
    );
  };

  return (
    <LinearGradient colors={['#6D83F2', '#A775F2']} style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Explore Skills</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Search skills..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {loading ? (
          <ActivityIndicator size="large" color="white" />
        ) : (
          <FlatList
            data={filteredSkills}
            keyExtractor={(item, index) => (item && item.id ? item.id.toString() : index.toString())}
            renderItem={renderSkillCard}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 20,
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  skillName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  skillDetails: {
    fontSize: 14,
    color: '#555',
  },
});
