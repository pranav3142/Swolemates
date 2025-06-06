import { Link, useRouter } from 'expo-router';
import { Alert, Button, Dimensions, StyleSheet,Text, View, ScrollView, TouchableOpacity, ImageBackground, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import { supabase } from '../../utils/supabase';
import Carousel from 'react-native-reanimated-carousel';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width: screenWidth } = Dimensions.get('window');

type RoutePath = '/workouttabs/startworkout' | '/workouttabs/exercises' | '/workouttabs/workoutgen';

const data: { title: string; path: RoutePath; image: any }[] = [
  { title: 'StartWorkout', path: '/workouttabs/startworkout', image: require('../../assets/images/startworkoutpic.jpg') },
  { title: 'Exercise', path: '/workouttabs/exercises', image: require('../../assets/images/anatomy.jpg') },
  { title: 'Generate a Workout', path: '/workouttabs/workoutgen', image: require('../../assets/images/AI.jpg') },
];

export default function Workout() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState([]);
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkouts = async () => {
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', currentUser.uid)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching workouts:', error.message);
      } else {
        setWorkouts(data);
      }
    };

    fetchWorkouts();
  }, []);

  const toggleDetails = (id: string) => {
    setExpandedWorkout(prev => (prev === id ? null : id));
  };
  const handleDeleteWorkout = async (id: string) => {
  Alert.alert(
    'Delete Workout',
    'Are you sure you want to delete this workout?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('workouts').delete().eq('id', id);
          if (error) {
            console.error('Error deleting workout:', error.message);
          } else {
            setWorkouts(prev => prev.filter(workout => workout.id !== id));
          }
        },
      },
    ]
  );
};


  return (
    <View style={styles.container}>
      <Carousel
        width={screenWidth * 0.85}
        height={100}
        data={data}
        mode="parallax"
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
                <Text style={styles.carouselTitle}>{item.title}</Text>
              </Pressable>
            </View>
          </ImageBackground>
        )}
      />

      
      <View style={{ width: '100%', paddingHorizontal: 20, marginTop: 16 }}>
        <Text style={[styles.title, { fontSize: 24, marginBottom: 8 }]}>Your Workouts</Text>
      </View>

<ScrollView style={{ width: '100%', paddingHorizontal: 20 }}>
  {workouts.map((workout, index) => (
    <View key={workout.id || index} style={styles.workoutCard}>
      <Text style={styles.workoutTitle}>
        Workout {index + 1} : {workout.name || "No name"} — {new Date(workout.timestamp).toLocaleDateString()}
      </Text>
      <Text style={styles.description}>{workout.description || ''}</Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TouchableOpacity onPress={() => toggleDetails(workout.id)} style={styles.detailsButton}>
          <Text style={styles.detailsButtonText}>
            {expandedWorkout === workout.id ? 'Hide Details' : 'View Details'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleDeleteWorkout(workout.id)}
          style={[styles.detailsButton, { paddingHorizontal: 8 }]}
        >
          <Ionicons name ="trash-outline" size = {20} color='#ff5555'/>
        </TouchableOpacity>
      </View>

      {expandedWorkout === workout.id && (
        <View style={{ marginTop: 8 }}>
          {workout.data?.map((exercise, i) => (
            <View key={i} style={{ marginBottom: 8 }}>
              
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              {(exercise.sets ?? []).map((set, j) => (
                <Text key={j} style={styles.setText}>
                  Set {j + 1}: {set.reps} reps × {set.weight} kg
                </Text>
              ))}
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
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  image: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  imageRadius: {
    borderRadius: 16,
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 12,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  carouselTitle: {
    fontSize: 20,
    color: '#ffd33d',
    fontWeight: 'bold',
  },
  title: {
    color: '#ffd33d',
    fontWeight: 'bold',
  },
  workoutCard: {
    backgroundColor: '#303030',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  workoutTitle: {
    color: '#ffd33d',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  detailsButton: {
    marginTop: 6,
    paddingVertical: 6,
  },
  detailsButtonText: {
    color: '#ffd33d',
    fontStyle: 'italic',
  },
  exerciseName: {
    color: '#fff',
    fontWeight: 'bold',
  },
  setText: {
    color: '#ddd',
    marginLeft: 10,
  },
  description: {
    color: '#FFBF00',
    //fontWeight: 'bold',
  },

});
