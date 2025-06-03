import { Link, useRouter } from 'expo-router';
import { Alert, Button, Dimensions, StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import { supabase } from '../../utils/supabase';

export default function Workout() {
  const screenHeight = Dimensions.get('window').height;
  const containerHeight = screenHeight / 10;
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

  return (
    <View style={styles.container}>
      <View style={[styles.translucentWrapper, { height: containerHeight }]}>
        <View style={styles.row}>
          <View style={styles.buttonBox}>
            <Button color='#ffd33d' title="Start Workout" onPress={() => router.push('/workouttabs/startworkout')} />
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.buttonBox}>
            <Button color='#ffd33d' title="Workout generator" onPress={() => router.push('/workouttabs/workoutgen')} />
          </View>
          <View style={styles.buttonBox}>
            <Button color='#ffd33d' title="Exercises" onPress={() => router.push('/workouttabs/exercises')} />
          </View>
        </View>
      </View>

      <Text style={styles.title}>Your Workouts</Text>

      <ScrollView style={{ width: '100%', paddingHorizontal: 20 }}>
        {workouts.map((workout, index) => (
          <View key={workout.id || index} style={styles.workoutCard}>
            <Text style={styles.workoutTitle}>
              Workout {index + 1} — {new Date(workout.timestamp).toLocaleDateString()}
            </Text>

            <TouchableOpacity onPress={() => toggleDetails(workout.id)} style={styles.detailsButton}>
              <Text style={styles.detailsButtonText}>
                {expandedWorkout === workout.id ? 'Hide Details' : 'View Details'}
              </Text>
            </TouchableOpacity>

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
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 3,
  },
  buttonBox: {
    flex: 1,
    margin: 0,
    padding: 0,
    borderWidth: 1,
    borderColor: '#ffffff55',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  translucentWrapper: {
    width: '100%',
    padding: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: '#ffffff88',
    borderWidth: 1,
    borderRadius: 10,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#ffd33d',
    fontSize: 30,
    fontWeight: 'bold',
    paddingVertical: 20,
  },
  workoutCard: {
    backgroundColor: '#2c2c2e',
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
});
