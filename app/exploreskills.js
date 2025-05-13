import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import BASE_URL from '../config';

/**
 * ExploreSkillsScreen displays all skill posts shared by users.
 * Users can filter posts by preference and payment type, search by skill name,
 * and message or view the profile of other users.
 */
export default function ExploreSkillsScreen() {
  const router = useRouter();
  const [skills, setSkills] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [preferenceFilter, setPreferenceFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [myEmail, setMyEmail] = useState('');

  useEffect(() => {
    const init = async () => {
      const email = await AsyncStorage.getItem('userEmail');
      if (email) setMyEmail(email);
      fetchSkills();
    };
    init();
  }, []);

  // Fetch all skills from backend
  const fetchSkills = async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('jwtToken');
      const response = await fetch(`${BASE_URL}/api/skills/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setSkills(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch {
      alert('Failed to load skills.');
    }
    setLoading(false);
  };

  // Format post timestamp as relative time
  const timeAgo = (isoString) => {
    const now = new Date();
    const postTime = new Date(isoString);
    const diff = Math.floor((now - postTime) / (1000 * 60));
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff} min ago`;
    const hrs = Math.floor(diff / 60);
    if (hrs < 24) return `${hrs} hr ago`;
    return `${Math.floor(hrs / 24)} day(s) ago`;
  };

  // Filter skills by query and dropdown filters
  const filteredSkills = skills.filter((skill) =>
    (skill.skillName || '').toLowerCase().includes(searchQuery.toLowerCase()) &&
    (!preferenceFilter || skill.preferenceType === preferenceFilter) &&
    (!paymentFilter || skill.paymentType === paymentFilter)
  );

  const renderSkillCard = ({ item }) => {
    const isOwnPost = item.userEmail?.toLowerCase() === myEmail.toLowerCase();
    const isActive = !item.status || item.status.toUpperCase() === 'ACTIVE';

    return (
      <View style={styles.card}>
        <View style={styles.profileRow}>
          {item.profilePictureUrl?.trim() ? (
            <Image source={{ uri: item.profilePictureUrl }} style={styles.profilePic} />
          ) : (
            <View style={styles.initialCircle}>
              <Text style={styles.initialText}>{item.firstName?.[0]?.toUpperCase() ?? '?'}</Text>
            </View>
          )}
          <View>
            <Text style={styles.posterName}>{item.firstName} {item.lastName}</Text>
            <Text style={styles.timeStamp}>{timeAgo(item.createdAt)}</Text>
          </View>
        </View>

        <Text style={styles.skillTitle}>{item.skillName}</Text>
        <Text style={styles.detailsText}>{item.preferenceType} • {item.paymentType}</Text>

        {item.paymentType === 'PAID' && item.price && (
          <Text style={styles.extraDetail}>💰 ${item.price}</Text>
        )}

        {item.paymentType === 'EXCHANGE' && item.exchangeSkills && (
          <Text style={styles.extraDetail}>
            🤝 Exchange for: {Array.isArray(item.exchangeSkills)
              ? item.exchangeSkills.join(', ')
              : item.exchangeSkills}
          </Text>
        )}

        {!isOwnPost && isActive && (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.messageButton}
              onPress={() => router.push({ pathname: '/chatscreen', params: { email: item.userEmail } })}
            >
              <Text style={styles.messageButtonText}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.messageButton, styles.viewButton]}
              onPress={() => router.push({ pathname: '/otherprofile', params: { email: item.userEmail } })}
            >
              <Text style={styles.messageButtonText}>View Profile</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <LinearGradient colors={['#6D83F2', '#A775F2']} style={styles.container}>
      <View style={styles.innerContainer}>
        <TouchableOpacity onPress={() => router.push('/home')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>

        <Text style={styles.title}>Explore Skills</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Search skills..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <View style={styles.filterRow}>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={preferenceFilter}
              onValueChange={(v) => setPreferenceFilter(v)}
              style={styles.picker}
              dropdownIconColor="#6D83F2"
            >
              <Picker.Item label="All Preferences" value="" />
              <Picker.Item label="Teach" value="TEACH" />
              <Picker.Item label="Learn" value="LEARN" />
            </Picker>
          </View>

          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={paymentFilter}
              onValueChange={(v) => setPaymentFilter(v)}
              style={styles.picker}
              dropdownIconColor="#6D83F2"
            >
              <Picker.Item label="All Payments" value="" />
              <Picker.Item label="Free" value="FREE" />
              <Picker.Item label="Paid" value="PAID" />
              <Picker.Item label="Exchange" value="EXCHANGE" />
            </Picker>
          </View>
        </View>

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
  container: { flex: 1 },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 60 : 80,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 20 : 40,
    left: 20,
    zIndex: 100,
    padding: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    elevation: 2,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  pickerWrapper: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 7,
    overflow: 'hidden',
    height: 44
  },
  picker: {
    height: 50,
    color: '#333',
    paddingVertical: -10,
    marginVertical: -4,
  },
  listContent: { paddingBottom: 20 },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 16,
    marginBottom: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  initialCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6D83F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  initialText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  posterName: { fontSize: 16, fontWeight: '600', color: '#222' },
  timeStamp: { fontSize: 12, color: '#777' },
  skillTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 4, color: '#333' },
  detailsText: { fontSize: 14, marginTop: 4, color: '#444' },
  extraDetail: { fontSize: 14, color: '#555', marginTop: 6 },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  messageButton: {
    backgroundColor: '#6D83F2',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  viewButton: {
    backgroundColor: '#A775F2',
  },
  messageButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});
