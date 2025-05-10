import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import BASE_URL from '../config';

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
      const response = await fetch(`${BASE_URL}/api/skills/all`);
      if (response.ok) {
        const data = await response.json();
        const sortedData = (data || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setSkills(sortedData);
      } else {
        alert('Failed to load skills.');
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
      alert('Error fetching skills.');
    }
    setLoading(false);
  };

  const filteredSkills = skills.filter(skill =>
    (skill.skillName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const timeAgo = (isoString) => {
    if (!isoString) return '';
    const now = new Date();
    const postTime = new Date(isoString);
    const diffMinutes = Math.floor((now - postTime) / (1000 * 60));

    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes} minute(s) ago`;
    const hours = Math.floor(diffMinutes / 60);
    if (hours < 24) return `${hours} hour(s) ago`;
    const days = Math.floor(hours / 24);
    return `${days} day(s) ago`;
  };

  const renderSkillCard = ({ item }) => {
    if (!item) return null;

    return (
      <View style={styles.card}>
        <Text style={styles.posterName}>
          {item.firstName || 'Anonymous'} {item.lastName || ''}
        </Text>

        <Text style={styles.timeStamp}>
          {item.createdAt ? timeAgo(item.createdAt) : 'Posted just now'}
        </Text>

        <Text style={styles.skillTitle}>{item.skillName}</Text>

        <Text style={styles.detailsText}>
          <Text style={{ fontWeight: 'bold' }}>{item.preferenceType}</Text> •{' '}
          <Text style={{ fontWeight: 'bold' }}>{item.paymentType}</Text>
        </Text>

        {item.paymentType === 'PAID' && item.price != null && (
          <Text style={styles.extraDetail}>💰 ${item.price}</Text>
        )}

        {item.paymentType === 'EXCHANGE' && item.exchangeSkills && (
          <Text style={styles.extraDetail}>
            🤝 Exchange for:{' '}
            {Array.isArray(item.exchangeSkills)
              ? item.exchangeSkills.join(', ')
              : item.exchangeSkills}
          </Text>
        )}
      </View>
    );
  };

  return (
    <LinearGradient colors={['#6D83F2', '#A775F2']} style={styles.container}>
      <View style={styles.innerContainer}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => router.push('/home')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>

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
            keyExtractor={(item, index) => item?.id || index.toString()}
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
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 100,
    padding: 10,
    backgroundColor: 'transparent',
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
  posterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 2,
  },
  timeStamp: {
    fontSize: 12,
    color: '#777',
    marginBottom: 5,
  },
  skillTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  detailsText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#444',
  },
  extraDetail: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
});
