import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Dimensions, Image, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { supabase } from '../../utils/supabase';
import { Ionicons } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';
import { useRouter, useNavigation } from 'expo-router';

export default function BuddyMatch() {
  const [buddyProfiles, setBuddyProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
  setRefreshing(true);
  await fetchMatches();
  setRefreshing(false);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Match with a gym buddy',
      headerStyle: {
        backgroundColor: '#25292e',
      },
      headerTintColor: '#fff',
    });
  }, [navigation]);

  useEffect(() => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      setUserId(currentUser.uid);
      console.log("Logged in Firebase user ID:", currentUser.uid);
    } else {
      Alert.alert('Authentication Error', 'No authenticated Firebase user found.');
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchMatches(); // Auto-fetch matches once userId is available
    }
  }, [userId]);

  const fetchMatches = async () => {
    if (!userId) {
      Alert.alert('Error', 'User ID is not available.');
      return;
    }

    setLoading(true);
    try {
      // Get previously liked user IDs
      const { data: likedData, error: likedError } = await supabase
        .from('buddylikes')
        .select('liked_user_id')
        .eq('user_id', userId);

      if (likedError) throw likedError;

      const likedUserIds = likedData?.map(entry => entry.liked_user_id) || [];

      // Call backend to get recommended matches
      const resp = await fetch('https://allied-arlene-pranav3142-8e293de8.koyeb.app/recommend-buddies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });

      const data = await resp.json();
      console.log('Full backend response:', data);

      if (!data.user_ids) throw new Error('No matches found');

      // Filter out liked user_ids
      const filteredIds = data.user_ids.filter((id: string) => !likedUserIds.includes(id));

      // Fetch data from Supabase
      const { data: aboutData, error: aboutError } = await supabase
        .from('about')
        .select('user_id, age, location, fitness_level, goal')
        .in('user_id', filteredIds);
      if (aboutError) throw aboutError;

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', filteredIds);
      if (profileError) throw profileError;

      const { data: pictureData, error: pictureError } = await supabase
        .from('profile_pictures')
        .select('user_id, image_url')
        .in('user_id', filteredIds);
      if (pictureError) throw pictureError;

      const merged = aboutData.map(user => {
        const profile = profileData.find(p => p.id === user.user_id);
        const picture = pictureData.find(p => p.user_id === user.user_id);
        return {
          ...user,
          name: profile?.username || 'No name',
          avatar_url: picture?.image_url || null,
        };
      });

      setBuddyProfiles(merged);
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
  <ScrollView
    contentContainerStyle={styles.container}
    refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffd33d" />
    }
  >
    {!userId && <Text style={{ color: '#fff' }}>Loading user info...</Text>}
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
        <Text style={styles.name}>{profile.name}</Text>
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
    {userId && (
      <TouchableOpacity style={styles.viewMatchesButton} onPress={() => router.push('../buddyfindtabs/matched_buddies')}>
        <Text style={styles.viewMatchesText}>View Matched Buddies</Text>
      </TouchableOpacity>
    )}
  </ScrollView>
);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#25292e', alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
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
  viewMatchesButton: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: '#ffd33d',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  viewMatchesText: {
    color: '#25292e',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
