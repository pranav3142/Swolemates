import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Dimensions, Image, TouchableOpacity } from 'react-native';
import { supabase } from '../../utils/supabase';
import { Ionicons } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';

export default function BuddyMatch() {
  const [buddyProfiles, setBuddyProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  // Get Firebase Auth user ID on mount
  useEffect(() => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      setUserId(currentUser.uid);
      console.log("Logged in Firebase user ID:", currentUser.uid);
    } else {
      Alert.alert('Authentication Error', 'No authenticated Firebase user found.');
    }
  }, []);

  const fetchMatches = async () => {
    if (!userId) {
      Alert.alert('Error', 'User ID is not available.');
      return;
    }

    setLoading(true);
    try {
      console.log('Sending user_id:', userId);
      console.log('Request body:', JSON.stringify({ user_id: userId }));

      const resp = await fetch('http://127.0.0.1:8000/recommend-buddies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });

      const data = await resp.json();
      console.log('Full backend response:', data);
      console.log('Matched user IDs:', data.user_ids);

      if (!data.user_ids) throw new Error('No matches found');
      
      const { data: profiles, error } = await supabase
        .from('about')
        .select('user_id, age, location, fitness_level, goal, avatar_url, name')
        .in('user_id', data.user_ids);

      if (error) throw error;
      setBuddyProfiles(profiles || []);
      setCurrent(0);
    } catch (e) {
      Alert.alert('Error', e.message || String(e));
    }
    setLoading(false);
  };

  const handleLike = async () => {
    try {
      const liked = buddyProfiles[current];
      await supabase
        .from('buddylikes')
        .insert({
          user_id: userId,
          liked_user_id: liked.user_id,
          liked_user_name: liked.name,
        });
      nextProfile();
    } catch (e) {
      Alert.alert('Like failed', e.message || String(e));
    }
  };

  const nextProfile = () => setCurrent(c => c + 1);

  const profile = buddyProfiles[current];

  return (
    <View style={styles.container}>
      {!userId && <Text style={{ color: '#fff' }}>Loading user info...</Text>}
      {userId && buddyProfiles.length === 0 && !loading && (
        <TouchableOpacity style={styles.findButton} onPress={fetchMatches}>
          <Text style={styles.findButtonText}>Find a Buddy</Text>
        </TouchableOpacity>
      )}
      {loading && <ActivityIndicator size="large" color="#ffd33d" />}
      {profile && (
        <View style={styles.card}>
          <Image
            source={
              profile.avatar_url
                ? { uri: profile.avatar_url }
                : require('../../assets/images/userIconYellow.png')
            }
            style={styles.avatar}
          />
          <Text style={styles.name}>{profile.name || 'No name'}</Text>
          <Text style={styles.info}>{profile.age} | {profile.location}</Text>
          <Text style={styles.info}>{profile.fitness_level} | {profile.goal}</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.crossButton} onPress={nextProfile}>
              <Ionicons name="close" size={40} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.tickButton} onPress={handleLike}>
              <Ionicons name="checkmark" size={40} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}
      {userId && buddyProfiles.length > 0 && current >= buddyProfiles.length && (
        <Text style={{ color: "#fff", fontSize: 18, marginTop: 60 }}>No more buddies to show. 🎉</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#25292e', alignItems: 'center', justifyContent: 'center' },
  card: {
    backgroundColor: '#1c1c1e',
    borderRadius: 16,
    alignItems: 'center',
    padding: 24,
    width: Dimensions.get('window').width * 0.85,
    minHeight: 440,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 16 },
  name: { color: '#ffd33d', fontSize: 22, fontWeight: 'bold' },
  info: { color: '#fff', fontSize: 16, marginVertical: 2 },
  buttonRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 30, gap: 50 },
  crossButton: { backgroundColor: '#d11a2a', padding: 18, borderRadius: 40, marginRight: 16 },
  tickButton: { backgroundColor: '#49C368', padding: 18, borderRadius: 40, marginLeft: 16 },
  findButton: { marginTop: 100, backgroundColor: '#ffd33d', padding: 18, borderRadius: 20 },
  findButtonText: { color: '#25292e', fontWeight: 'bold', fontSize: 18 },
});
