import React, { useEffect, useState } from 'react'; 
import { Dimensions, StyleSheet, Text, View, ImageBackground, Pressable, ScrollView, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { useRouter } from 'expo-router';
import auth from '@react-native-firebase/auth';
import { supabase } from '../../utils/supabase';
import Ionicons from '@expo/vector-icons/Ionicons';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

type RoutePath = '/hometabs/search' | '/hometabs/gymlocator' | '/hometabs/news' | '/hometabs/chat';

const data: { title: string; path: RoutePath; image: any }[] = [
  { title: 'Search', path: '/hometabs/search', image: require('../../assets/images/gympeople.png') },
  { title: 'Gym Locator', path: '/hometabs/gymlocator', image: require('../../assets/images/gymmap.png') },
  { title: 'News', path: '/hometabs/news', image: require('../../assets/images/gymnews.jpg') },
  { title: 'Chat', path: '/hometabs/chat', image: require('../../assets/images/chat.png') },
];

export default function Index() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState([]);
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [comments, setComments] = useState({});
  const [showComments, setShowComments] = useState({});
  const currentUser = auth().currentUser;
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
  setRefreshing(true);
  await fetchWorkouts();
  setRefreshing(false);
};


  const insertUserProfile = async () => {
    const user = auth().currentUser;
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.uid,
        username: user.displayName || user.email?.split('@')[0] || 'user',
      }, { onConflict: ['id'] });

    if (error) console.error('Error inserting profile:', error.message);
  };

  const fetchWorkouts = async () => {
    const user = auth().currentUser;
    if (!user) return;

    await insertUserProfile();

    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching workouts:', error.message);
      return;
    }

    setWorkouts(data);

    const { data: commentData, error: commentError } = await supabase
      .from('comments')
      .select('*, profiles(username)')
      .order('created_at', { ascending: true });

    if (commentError) {
      console.error('Error fetching comments:', commentError.message);
      return;
    }

    const groupedComments = {};
    commentData.forEach(comment => {
      if (!groupedComments[comment.workout_id]) {
        groupedComments[comment.workout_id] = [];
      }
      groupedComments[comment.workout_id].push({
        id: comment.id,
        content: comment.content,
        username: comment.profiles?.username || 'User',
        user_id: comment.user_id,
        created_at: comment.created_at,
      });
    });
    setComments(groupedComments);
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const toggleDetails = (id: string) => {
    setExpandedWorkout(prev => (prev === id ? null : id));
  };

  const toggleCommentInput = (workoutId: string) => {
    setCommentInputs(prev => ({
      ...prev,
      [workoutId]: prev[workoutId] === undefined ? "" : undefined,
    }));
  };

  const handleCommentChange = (workoutId, text) => {
    setCommentInputs(prev => ({ ...prev, [workoutId]: text }));
  };

  const handlePostComment = async (workoutId) => {
    const text = commentInputs[workoutId];
    if (!text) return;

    const user = auth().currentUser;
    await supabase.from('comments').insert({
      user_id: user.uid,
      workout_id: workoutId,
      content: text,
    });

    setCommentInputs(prev => ({ ...prev, [workoutId]: "" }));
    await fetchWorkouts();
  };

  const handleDeleteComment = async (commentId: string) => {
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (error) console.error('Failed to delete comment:', error.message);
    else await fetchWorkouts();
  };

  const toggleShowComments = (workoutId: string) => {
    setShowComments(prev => ({
      ...prev,
      [workoutId]: !prev[workoutId],
    }));
  };

  return (
    <View style={styles.container}>
      <Carousel
        width={screenWidth}
        height={220}
        data={data}
        mode="parallax"
        autoPlay
        autoPlayInterval={3000}
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 50,
          parallaxAdjacentItemScale: 0.75,
        }}
        scrollAnimationDuration={1000}
        renderItem={({ item }) => (
          <ImageBackground source={item.image} style={styles.image} imageStyle={styles.imageRadius}>
            <View style={styles.overlay}>
              <Pressable onPress={() => router.push(item.path)} hitSlop={10}>
                <Text style={styles.title}>{item.title}</Text>
              </Pressable>
            </View>
          </ImageBackground>
        )}
      />
      <Text style={styles.title2}>Workouts</Text>

      <ScrollView
          style={{ width: '100%', paddingHorizontal: 20 }}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#ffd33d"
              colors={['#ffd33d']}
            />
        }>

        {workouts.map((workout, index) => (
          <View key={workout.id || index} style={{ backgroundColor: '#303030', padding: 12, borderRadius: 8, marginBottom: 12 }}>
            <Text style={{ color: '#ffd33d', fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>
              {workout.user_name || "Unknown User"} : {workout.name || "No name"} — {new Date(workout.timestamp).toLocaleDateString()}
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <TouchableOpacity onPress={() => toggleDetails(workout.id)}>
                <Text style={{ color: '#ffd33d', fontStyle: 'italic' }}>
                  {expandedWorkout === workout.id ? 'Hide Details' : 'View Details'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => toggleCommentInput(workout.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="chatbubble-outline" size={20} color="#ffd33d" />
                <Text style={{ color: '#fff' }}>Comment</Text>
              </TouchableOpacity>
            </View>

            {expandedWorkout === workout.id && (
              <View style={{ marginTop: 8 }}>
                {workout.data?.map((exercise, i) => (
                  <View key={i} style={{ marginBottom: 8 }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>{exercise.name}</Text>
                    {(exercise.sets ?? []).map((set, j) => (
                      <Text key={j} style={{ color: '#ddd', marginLeft: 10 }}>
                        Set {j + 1}: {set.reps} reps × {set.weight} kg
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            )}

            {commentInputs[workout.id] !== undefined && (
              <View style={{ marginTop: 8 }}>
                <TextInput
                  style={{ backgroundColor: '#444', color: '#fff', padding: 6, borderRadius: 6 }}
                  placeholder="Write a comment..."
                  placeholderTextColor="#ccc"
                  value={commentInputs[workout.id]}
                  onChangeText={text => handleCommentChange(workout.id, text)}
                />
                <TouchableOpacity onPress={() => handlePostComment(workout.id)} style={{ marginTop: 6 }}>
                  <Text style={{ color: '#ffd33d' }}>Post Comment</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity onPress={() => toggleShowComments(workout.id)} style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons
                name={showComments[workout.id] ? 'chevron-down-outline' : 'chevron-forward'}
                size={20}
                color="#ffd33d"
              />
              <Text style={{ color: '#ffd33d', fontStyle: 'italic', marginLeft: 6 }}>
                Comments
              </Text>
            </TouchableOpacity>

            {showComments[workout.id] && (
              <View style={{ marginTop: 8 }}>
                {comments[workout.id]?.map((comment, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#ccc' }}>
                        <Text style={{ fontWeight: 'bold', color: '#fff' }}>{comment.username}</Text>
                        <Text style={{ color: '#888' }}> ({new Date(comment.created_at).toLocaleString()}): </Text>
                        {comment.content}
                      </Text>
                    </View>
                    {comment.user_id === currentUser?.uid && (
                      <TouchableOpacity onPress={() => handleDeleteComment(comment.id)}>
                        <Ionicons name="trash-outline" size={18} color="#ff5555" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
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
    backgroundColor: '#25292e',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 220,
    justifyContent: 'flex-end',
  },
  imageRadius: {
    borderRadius: 16,
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  title: {
    color: '#ffd33d',
    fontSize: 24,
    fontWeight: 'bold',
  },
  title2: {
    color: '#ffd33d',
    fontSize: 35,
    fontWeight: 'bold',
    marginTop: 12,
  },
});
