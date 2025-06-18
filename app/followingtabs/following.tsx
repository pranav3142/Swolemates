import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState, useLayoutEffect } from 'react';
import { supabase } from '../../utils/supabase';
import auth from '@react-native-firebase/auth';
import { useNavigation } from 'expo-router';


export default function FollowingList() {
  const navigation = useNavigation();    
    
  const [following, setFollowing] = useState<any[]>([]);

  const currentUser = auth().currentUser;

  useLayoutEffect(() => {
        navigation.setOptions({
          title: 'Following',
          headerStyle: {
            backgroundColor: '#25292e',
          },
          headerTintColor: '#fff',
        });
      }, [navigation]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchFollowing = async () => {
      const { data, error } = await supabase
        .from('follows')
        .select('following_id, profiles!following_id(id, username)')
        .eq('follower_id', currentUser.uid);

      if (error) {
        Alert.alert('Error loading following list', error.message);
        return;
      }

      const followingList = data.map((row: any) => row.profiles);
      setFollowing(followingList);
    };

    fetchFollowing();
  }, []);

  const unfollow = async (targetId: string) => {
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', currentUser?.uid)
      .eq('following_id', targetId);

    if (error) return Alert.alert('Error finding follow entry', error.message);

    const followId = data[0]?.id;
    if (!followId) return;

    const { error: delError } = await supabase.from('follows').delete().eq('id', followId);
    if (delError) return Alert.alert('Unfollow Error', delError.message);

    setFollowing((prev) => prev.filter((u) => u.id !== targetId));
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {following.map((user) => (
          <View key={user.id} style={styles.card}>
            <Text style={styles.username}>{user.username}</Text>
            <TouchableOpacity
              style={styles.unfollowBtn}
              onPress={() => unfollow(user.id)}
            >
              <Text style={styles.unfollowText}>Unfollow</Text>
            </TouchableOpacity>
          </View>
        ))}
        {following.length === 0 && (
          <Text style={styles.emptyText}>You're not following anyone yet.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e',
    padding: 16,
  },
  heading: {
    color: '#ffd33d',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#2c2c2e',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  username: {
    color: '#fff',
    fontSize: 16,
  },
  unfollowBtn: {
    backgroundColor: '#ff5555',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  unfollowText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 20,
  },
});
