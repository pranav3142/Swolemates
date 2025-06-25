import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useNavigation, useRouter, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { supabase } from '../../utils/supabase';
import auth from '@react-native-firebase/auth';


interface SetEntry {
  reps: string;
  weight: string;
}

interface Exercise {
  name: string;
  type: string;
  muscle: string;
  equipment: string;
  difficulty: string;
  instructions: string;
  sets?: SetEntry[];
}

async function saveWorkout(exercises: Exercise[]) {
  const currentUser = auth().currentUser;

  if (!currentUser) {
    console.error("User not authenticated with Firebase");
    return;
  }
  console.log("Inserting workout for UID:", currentUser?.uid);
  console.log("Data:", JSON.stringify(exercises, null, 2));

  const { error } = await supabase.from('workouts').insert({
    user_id: currentUser.uid,
    data: exercises,
    timestamp: new Date(),
  });
  
  const testSupabase = async () => {
  const { data, error } = await supabase.from('workouts').select('*').limit(1);
  if (error) console.error('Supabase error:', error.message);
  else console.log('Supabase response:', data);
};


  if (error) {
    console.error('Error saving workout:', error.message);
  } else {
    console.log('Workout saved successfully');
  }
}




export default function TimerScreen() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [exerciseList, setExerciseList] = useState<Exercise[]>([]);

  const navigation = useNavigation();
  const router = useRouter();
  
  const { selectedExercise } = useLocalSearchParams();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Workout Log',
      headerStyle: { backgroundColor: '#25292e' },
      headerTintColor: '#fff',
      headerBackVisible: false,
      headerLeft: () => (
      <TouchableOpacity onPress={() => router.replace('/workout')} style={{ paddingHorizontal: 16 }}>
        <Ionicons name={'chevron-back-outline'} color={'white'} size={24}/>
      </TouchableOpacity>
      )
    });
  }, [navigation]);

  useEffect(() => {
    let interval: any;
    if (running) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [running]);

  useEffect(() => {
    if (selectedExercise) {
      try {
        const parsed: Exercise[] = JSON.parse(selectedExercise as string);
        setExerciseList(parsed);
      } catch (err) {
        console.error('Failed to parse selectedExercise list:', err);
      }
    }
  }, [selectedExercise]);

  const toggleTimer = () => {
    setRunning(prev => !prev);
  };

  const resetTimer = () => {
    setRunning(false);
    setSeconds(0);
  };

  const navigateToAdd = () => {
    router.push({
      pathname: '/workouttabs/addexercise',
      params: {
        currentList: JSON.stringify(exerciseList),
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.timerCard}>
        <Text style={styles.timerText}>{seconds}s</Text>
        <View style={styles.timercontainer}>
          <TouchableOpacity onPress={toggleTimer} style={[styles.buttonOutline, running && styles.buttonActive]}>
            <Text style={styles.buttonText}>{running ? 'Stop' : 'Start'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={resetTimer} style={styles.buttonOutline}>
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.exerciseList}>
        {exerciseList.map((ex, idx) => (
          <View key={idx} style={styles.exerciseCard}>
            <Text style={styles.exerciseText}>{ex.name}</Text>
            <Text style={styles.detailText}>Muscle: {ex.muscle}</Text>
            <Text style={styles.detailText}>Type: {ex.type}</Text>
            <Text style={styles.detailText}>Equipment: {ex.equipment}</Text>
            <Text style={styles.detailText}>Difficulty: {ex.difficulty}</Text>

            {(ex.sets ?? []).map((set, setIdx) => (
              <View key={setIdx} style={{ marginTop: 6 }}>
                <Text style={styles.detailText}>Set {setIdx + 1}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Reps"
                  value={set.reps}
                  onChangeText={(text) => {
                    const updatedList = [...exerciseList];
                    updatedList[idx].sets![setIdx].reps = text;
                    setExerciseList(updatedList);
                  }}
                  keyboardType="numeric"
                  placeholderTextColor="#aaa"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Weight/kg"
                  value={set.weight}
                  onChangeText={(text) => {
                    const updatedList = [...exerciseList];
                    updatedList[idx].sets![setIdx].weight = text;
                    setExerciseList(updatedList);
                  }}
                  keyboardType="numeric"
                  placeholderTextColor="#aaa"
                />
              </View>
            ))}

            <TouchableOpacity
              style={[styles.buttonOutline, { marginTop: 8 }]}
              onPress={() => {
                const updatedList = [...exerciseList];
                if (!updatedList[idx].sets) updatedList[idx].sets = [];
                updatedList[idx].sets!.push({ reps: '', weight: '' });
                setExerciseList(updatedList);
              }}
            >
              <Text style={styles.buttonText}>Add Set</Text>
            </TouchableOpacity>
          </View>
        ))}

      </ScrollView>

      <TouchableOpacity onPress={navigateToAdd} style={styles.addExerciseButton}>
        <Text style={styles.buttonText}>Add exercise</Text>
      </TouchableOpacity>
      <TouchableOpacity
  onPress={() => {
    router.push({
      pathname: '/workouttabs/saveworkout',
      params: {
        exercises: JSON.stringify(exerciseList),
      },
    });
  }}
  style={[styles.addExerciseButton, { backgroundColor: '#ffd33d', borderColor: '#ffd33d',marginBottom: 30 }]}
>
  <Text style={{ color: '#000', fontWeight: 'bold',  }}>Finish Workout</Text>
</TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  timerCard: {
    borderWidth: 1,
    borderColor: '#fff',
    padding: 10,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 24,
    color: 'white',
  },
  buttonOutline: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  addExerciseButton: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 10,
    marginTop: 12,
  }, 
  timercontainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    marginLeft: 20,
  },
  buttonActive: {
    backgroundColor: '#ffd33d',
    borderColor: '#ffd33d',
  },
  exerciseList: {
    flex: 1,
    marginTop: 16,
    marginBottom: 8,
  },
  exerciseCard: {
    backgroundColor: '#222',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  exerciseText: {
    color: '#ffd33d',
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailText: {
    color: 'white',
    fontSize: 14,
  },
  input: {
  backgroundColor: '#2c2c2e',
  color: 'white',
  padding: 8,
  borderRadius: 6,
  marginTop: 4,
  marginBottom: 4,
},

});
