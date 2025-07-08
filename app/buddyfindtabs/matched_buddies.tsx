import React, { useEffect, useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { supabase } from '../../utils/supabase';
import auth from '@react-native-firebase/auth';
import { useNavigation } from 'expo-router';

interface Buddy {
  user_id: string;
  name: string;
  age: number;
  location: string;
  fitness_level: string;
  goal: string;
  avatar_url: string | null;
}

export default function MatchedBuddies() {
  const [likedBuddies, setLikedBuddies] = useState<Buddy[]>([]);
  const [loading, setLoading] = useState(true);
  const [followStatus, setFollowStatus] = useState<Record<string, boolean>>({});
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: '',
      headerStyle: {
        backgroundColor: '#25292e',
      },
      headerTintColor: '#fff',
    });
  }, [navigation]);

  useEffect(() => {
    const fetchLikedBuddies = async () => {
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      setLoading(true);
      try {
        const { data: likesData, error: likesError } = await supabase
          .from('buddylikes')
          .select('liked_user_id')
          .eq('user_id', currentUser.uid);

        if (likesError) throw likesError;

        const likedUserIds = likesData?.map((item) => item.liked_user_id) || [];

        if (likedUserIds.length === 0) {
          setLikedBuddies([]);
          setLoading(false);
          return;
        }

        const { data: aboutData, error: aboutError } = await supabase
          .from('about')
          .select('user_id, age, location, fitness_level, goal')
          .in('user_id', likedUserIds);
        if (aboutError) throw aboutError;

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', likedUserIds);
        if (profileError) throw profileError;

        const { data: pictureData, error: pictureError } = await supabase
          .from('profile_pictures')
          .select('user_id, image_url')
          .in('user_id', likedUserIds);
        if (pictureError) throw pictureError;

        const merged = aboutData.map((user) => {
          const profile = profileData.find((p) => p.id === user.user_id);
          const picture = pictureData.find((p) => p.user_id === user.user_id);
          return {
            ...user,
            name: profile?.username || 'No name',
            avatar_url: picture?.image_url || null,
          };
        });

        setLikedBuddies(merged);
        checkFollowingStatus(merged.map((b) => b.user_id));
      } catch (err) {
        console.error('Failed to fetch matched buddies:', err);
      }
      setLoading(false);
    };

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

    fetchLikedBuddies();
  }, []);

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
      <Text style={styles.header}>Matched Buddies</Text>
      <Text style={styles.instruction}>
        Once both users follow each other, you'll be able to chat 
      </Text>


      {loading && <ActivityIndicator size="large" color="#ffd33d" />}

      <ScrollView contentContainerStyle={styles.scroll}>
        {likedBuddies.length === 0 && !loading && (
          <Text style={styles.noMatches}>No liked buddies yet.</Text>
        )}
        {likedBuddies.map((buddy, index) => {
          const isFollowing = followStatus[buddy.user_id];
          return (
            <View key={index} style={styles.card}>
              <Image
                source={
                  buddy.avatar_url
                    ? { uri: buddy.avatar_url }
                    : require('../../assets/images/userIconYellow.png')
                }
                style={styles.avatar}
              />
              <Text style={styles.name}>{buddy.name}</Text>
              <Text style={styles.info}>{buddy.age} | {buddy.location}</Text>
              <Text style={styles.info}>{buddy.fitness_level} | {buddy.goal}</Text>

              <TouchableOpacity
                style={[
                  styles.followBtn,
                  isFollowing && styles.followingBtn,
                ]}
                onPress={() => toggleFollow(buddy.user_id)}
              >
                <Text style={[styles.followText, isFollowing && styles.followingText]}>
                  {isFollowing ? 'Following' : 'Follow Back'}
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
    backgroundColor: '#25292e',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    color: '#ffd33d',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    alignSelf: 'center',
  },
  scroll: {
    paddingBottom: 30,
  },
  noMatches: {
    color: '#fff',
    fontSize: 16,
    alignSelf: 'center',
    marginTop: 40,
  },
  card: {
    backgroundColor: '#1c1c1e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  name: {
    color: '#ffd33d',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  info: {
    color: '#fff',
    fontSize: 16,
  },
  followBtn: {
    backgroundColor: '#ffd33d',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 10,
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
  instruction: {
  color: '#aaa',
  fontSize: 14,
  marginBottom: 10,
  textAlign: 'center',
},

});
