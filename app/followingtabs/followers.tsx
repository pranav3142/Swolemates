import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import React, { useLayoutEffect, useState, useEffect, } from 'react';
import { supabase } from '../../utils/supabase';
import { useNavigation } from 'expo-router';
import auth from '@react-native-firebase/auth';

export default function FollowersList() {
  const navigation = useNavigation();    
  const [followers, setFollowers] = useState<any[]>([]);
  const [followBackMap, setFollowBackMap] = useState<Record<string, boolean>>({});

  const currentUser = auth().currentUser;
   useLayoutEffect(() => {
      navigation.setOptions({
        title: 'Your Followers',
        headerStyle: {
          backgroundColor: '#25292e',
        },
        headerTintColor: '#fff',
      });
    }, [navigation]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchFollowers = async () => {
      const { data, error } = await supabase
        .from('follows')
        .select('follower_id, profiles!follower_id(id, username)')
        .eq('following_id', currentUser.uid);

      if (error) {
        Alert.alert('Error loading followers', error.message);
        return;
      }

      const followerList = data.map((row: any) => row.profiles);
      setFollowers(followerList);
      checkWhoIFollowBack(followerList.map((user) => user.id));
    };

    const checkWhoIFollowBack = async (ids: string[]) => {
      const { data, error } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUser.uid)
        .in('following_id', ids);

      if (error) return console.error(error);

      const map: Record<string, boolean> = {};
      ids.forEach((id) => {
        map[id] = data.some((d) => d.following_id === id);
      });
      setFollowBackMap(map);
    };

    fetchFollowers();
  }, []);

  const followBack = async (targetId: string) => {
    const { error } = await supabase.from('follows').insert({
      follower_id: currentUser?.uid,
      following_id: targetId,
    });

    if (error) {
      Alert.alert('Follow Back Error', error.message);
      return;
    }

    setFollowBackMap((prev) => ({ ...prev, [targetId]: true }));
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {followers.map((user) => (
          <View key={user.id} style={styles.card}>
            <Text style={styles.username}>{user.username}</Text>
            {!followBackMap[user.id] && (
              <TouchableOpacity
                style={styles.followBackBtn}
                onPress={() => followBack(user.id)}
              >
                <Text style={styles.followBackText}>Follow Back</Text>
              </TouchableOpacity>
            )}
            {followBackMap[user.id] && (
              <Text style={styles.followingLabel}>Following</Text>
            )}
          </View>
        ))}
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
  followBackBtn: {
    backgroundColor: '#ffd33d',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  followBackText: {
    color: '#000',
    fontWeight: 'bold',
  },
  followingLabel: {
    color: 'green',
    fontWeight: 'bold',
  },
});
