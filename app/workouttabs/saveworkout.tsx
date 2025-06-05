import React, { useState, useLayoutEffect, useEffect } from 'react';
import { Text, View, TextInput, Button, StyleSheet, Alert,TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import auth from '@react-native-firebase/auth';
import { supabase } from '../../utils/supabase';
import Ionicons from '@expo/vector-icons/Ionicons';
//import { ScrollView } from 'react-native-gesture-handler';

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

export default function SaveWorkout() {
  const { exercises } = useLocalSearchParams();
  const [name, setName] = useState('');
  const [workoutData, setWorkoutData] = useState<Exercise[]>([]);
  const [description, setDescription] = useState('');
  const router = useRouter();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Save your workout',
      headerStyle: { backgroundColor: '#25292e' },
      headerTintColor: '#fff',
      headerBackVisible: true,
      
    });
  }, [navigation]);

  
  useEffect(() => {
    if (exercises) {
      try {
        const parsed = JSON.parse(exercises as string);
        setWorkoutData(parsed);
      } catch (e) {
        Alert.alert('Error', 'Invalid workout data');
      }
    }
  }, [exercises]);

  const handleSave = async () => {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    const { error } = await supabase.from('workouts').insert({
      user_id: currentUser.uid,
      data: workoutData,
      name,
      description,
      timestamp: new Date(),
    });

    if (error) {
      Alert.alert('Save Failed', error.message);
    } else {
      Alert.alert('Workout Saved', 'Your workout was saved successfully');
      router.replace('../workout');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Workout Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter workout name"
        placeholderTextColor="#aaa"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Enter workout description"
        placeholderTextColor="#aaa"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={[styles.label, { marginTop: 16 }]}>Workout Details</Text>
      {workoutData.map((ex, idx) => (
        <View key={idx} style={styles.exerciseCard}>
          <Text style={styles.exerciseTitle}>{ex.name}</Text>
          <Text style={styles.text}>Muscle: {ex.muscle}</Text>
          <Text style={styles.text}>Type: {ex.type}</Text>
          <Text style={styles.text}>Equipment: {ex.equipment}</Text>
          <Text style={styles.text}>Difficulty: {ex.difficulty}</Text>
          {(ex.sets ?? []).map((set, setIdx) => (
            <Text key={setIdx} style={styles.text}>
              Set {setIdx + 1}: {set.reps} reps × {set.weight} kg
            </Text>
          ))}
        </View>
      ))}

      <View style={{ marginBottom: 45 }}>
        <Button title="Save Workout" onPress={handleSave} color="#ffd33d" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#25292e',
    padding: 16,
    paddingBottom: 40,
    flex: 1
  },
  label: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#2c2c2e',
    color: 'white',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  exerciseCard: {
    backgroundColor: '#2c2c2e',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  exerciseTitle: {
    color: '#ffd33d',
    fontWeight: 'bold',
    fontSize: 16,
  },
  text: {
    color: '#fff',
    marginTop: 2,
  },
});