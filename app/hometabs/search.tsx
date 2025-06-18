import { Text, View, StyleSheet, TextInput, Button, Alert, TouchableOpacity, ScrollView } from 'react-native';
import React, { useLayoutEffect, useState } from 'react';
import { useNavigation } from 'expo-router';
import { supabase } from '../../utils/supabase';
import auth from '@react-native-firebase/auth';

export default function Search() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [followStatus, setFollowStatus] = useState<Record<string, boolean>>({});

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Search for your friends',
      headerStyle: {
        backgroundColor: '#25292e',
      },
      headerTintColor: '#fff',
    });
  }, [navigation]);

  const checkFollowingStatus = async (userIds: string[]) => {
    const currentUser = auth().currentUser;
    if (!currentUser) return;

    const { data, error } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', currentUser.uid)
      .in('following_id', userIds);

    if (error) return console.error(error);

    const statusMap: Record<string, boolean> = {};
    userIds.forEach((id) => {
      statusMap[id] = data.some((row) => row.following_id === id);
    });

    setFollowStatus(statusMap);
  };

  const handleSearch = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username')
      .ilike('username', `%${searchQuery}%`);

    if (error) {
      Alert.alert('Search Error', error.message);
    } else {
      setResults(data);
      checkFollowingStatus(data.map((u) => u.id));
    }
  };

  const toggleFollow = async (targetId: string) => {
    const currentUser = auth().currentUser;
    if (!currentUser) return;

    const isFollowing = followStatus[targetId];

    if (isFollowing) {
      // Unfollow
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', currentUser.uid)
        .eq('following_id', targetId);

      if (error) return Alert.alert('Error', error.message);

      const followId = data[0]?.id;
      if (followId) {
        const { error: delError } = await supabase.from('follows').delete().eq('id', followId);
        if (delError) return Alert.alert('Unfollow Error', delError.message);
      }

      setFollowStatus((prev) => ({ ...prev, [targetId]: false }));
    } else {
      // Follow
      const { error } = await supabase.from('follows').insert({
        follower_id: currentUser.uid,
        following_id: targetId,
      });

      if (error) return Alert.alert('Follow Error', error.message);
      setFollowStatus((prev) => ({ ...prev, [targetId]: true }));
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter username"
        placeholderTextColor="#aaa"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <Button title="Search" color="#ffd33d" onPress={handleSearch} />

      <ScrollView style={{ marginTop: 20 }}>
        {results.map((user) => {
          const isFollowing = followStatus[user.id];

          return (
            <View key={user.id} style={styles.resultCard}>
              <Text style={styles.username}>{user.username}</Text>
              <TouchableOpacity
                style={[
                  styles.followBtn,
                  isFollowing && styles.followingBtn,
                ]}
                onPress={() => toggleFollow(user.id)}
              >
                <Text style={[styles.followText, isFollowing && styles.followingText]}>
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e',
    padding: 20,
    paddingTop: 40,
  },
  input: {
    backgroundColor: '#2c2c2e',
    color: 'white',
    width: '100%',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  resultCard: {
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
  followBtn: {
    backgroundColor: '#ffd33d',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  followText: {
    color: '#000',
    fontWeight: 'bold',
  },
  followingBtn: {
    backgroundColor: 'green',
  },
  followingText: {
    color: '#fff',
  },
});
