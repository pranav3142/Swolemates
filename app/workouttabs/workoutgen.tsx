import { Text, View, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation , useRouter} from 'expo-router';
import React, { useState, useLayoutEffect} from 'react';
import { theme } from '@/constants/themes';
import { GoogleGenerativeAI } from "@google/generative-ai";
import BouncyCheckbox from "react-native-bouncy-checkbox";

interface GenEx {
    name: string;
    type: string;
    muscle: string;
    equipment: string;
    difficulty: string;
    instructions: string;
    sets?: { reps: string; weight: string; }[];
}

export default function ExGen() {
  const navigation = useNavigation();
  const router = useRouter();

  const [goals, setGoals] = useState('');
  const [equipment, setEquipment] = useState('');
  const [time, setTime] = useState('');
  const [currentFitnessLevel, setCurrentFitnessLevel] = useState('');
  const [remarks, setRemarks] = useState('');
  const [warmUp, setWarmUp] = useState(false);
  const [coolDown, setCoolDown] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const API_KEY = "AIzaSyAtSZZ9qDp00JG-Wie6hV5pUwZE-kwGey8";
  const ai = new GoogleGenerativeAI(API_KEY);


  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Generate Workout',
      headerStyle: {
        backgroundColor: '#25292e'
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold'
      }
    });
  }, [navigation]);

  const handleGenerateWorkout = async () => {
    if (!goals || !equipment || !time || !currentFitnessLevel) {
      Alert.alert('Missing Information', 'Please fill in all fields to generate a workout.');
      return;
    }

    setIsLoading(true);
    setGeneratedWorkout(''); // Clear previous workout

    try {
      const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash'}); // models/gemini-2.5-flash-preview-05-20
      const userPrompt = `
        Generate a workout plan based on the following user preferences:
        - Goals: ${goals}
        - Available Equipment: ${equipment}
        - Time Available: ${time}
        - Current Fitness Level: ${currentFitnessLevel}
        - Additional Remarks ${remarks}
        - Warm up: ${warmUp}
        - Cool down: ${coolDown}

        Output as plain text, all same font size and unbolded, being as concise as possible without unncessary information, provide purely sets, reps and weights, and rest time between sets, give definite values, do not give a range for any values (including number of sets, reps or rest time),
        Ensure the workout is balanced, targeting all parts of the muscle group if the user had stated, and suitable for the user's fitness level.
        For number of sets, 1.5 minutes per set, excluding rest time, is a good rule of thumb, so if the user has 30 minutes, you can do 10 sets of 3 minutes each. ensure more rest time according to the user's fitness level, with minimally 90 seconds of rest, unless it is a HIIT workout, if there are per arm workouts, ensure fewer sets or shorter rest accordingly
        Then, structure the workout plan as follows:
        Exercise Name: [Name]
        Sets: [e.g., 3]
        Reps: [e.g., 12]
        Rest: [e.g., 90 seconds]
        Weight: [e.g., 20kg, 60kg]

        Example Format:
        Workout:
        Exercise Name: Single Leg Press
        Sets: 3
        Reps: 10
        Weight: 40kg
        Rest: 90 seconds

        Exercise Name: Barbell Full Squat
        Sets: 4
        Reps: 6
        Weight: 80kg
        Rest: 120 seconds

        `;
      console.log("Sending prompt to Gemini API", userPrompt);

      const result = await model.generateContent(userPrompt);
      const response = await result.response;
      const text = await response.text();

      console.log("Gemini API Response:", text);
      setGeneratedWorkout(text);
    } catch (error) {
      console.error('Error generating workout:', error);
      Alert.alert('Error', 'Failed to generate workout. Please check your internet connection.');
    } finally {
      setIsLoading(false);
    }
  };


  const handleSaveGeneratedWorkout = () => {
    if (!generatedWorkout) {
      Alert.alert('No Workout', 'Please generate a workout first.');
      return;
    }

    const lines = generatedWorkout.split('\n').filter(line => line.trim() !== '');
    const newWorkoutList: GenEx[] = [];
    let currentExercise: GenEx | null = null;
    let inWorkoutSection = false;
    let currentReps: string = 'N/A'; // Store reps value to apply to each set

    lines.forEach(line => {
      const lowerLine = line.toLowerCase();

      if (lowerLine.includes('workout:')) {
        inWorkoutSection = true;
        return;
      }
      if (lowerLine.includes('warm-up:') || lowerLine.includes('cool-down:')) {
          inWorkoutSection = false;
          currentExercise = null;
          return;
      }

      if (inWorkoutSection) {
          if (lowerLine.startsWith('exercise name:')) {
              if (currentExercise) {
                  newWorkoutList.push(currentExercise);
              }
              const name = line.substring('Exercise Name:'.length).trim();
              currentExercise = {
                  name,
                  type: 'Unknown',
                  muscle: 'Unknown',
                  equipment: 'Unknown',
                  difficulty: 'Unknown',
                  instructions: '',
                  sets: []
              }; 
              currentReps = 'N/A'; // Reset reps for the new exercise
          } else if (currentExercise) {
              if (lowerLine.startsWith('sets:')) {
                  const setsText = line.substring('Sets:'.length).trim();
                  const numberOfSets = parseInt(setsText, 10);

                  // Create sets based on the number of sets, using the stored 'currentReps'
                  for (let i = 0; i < numberOfSets; i++) {
                      currentExercise.sets?.push({ reps: currentReps, weight: '' });
                  }
              } else if (lowerLine.startsWith('reps:')) {
                  currentReps = line.substring('Reps:'.length).trim() || 'N/A'; // Update currentReps
                  // If sets were already defined, update them with the new reps value
                  if (currentExercise.sets && currentExercise.sets.length > 0) {
                      currentExercise.sets.forEach(set => set.reps = currentReps);
                  }
              } else if (lowerLine.startsWith('rest:')) {
                  // You could parse and use this if you extend your Exercise or SetEntry interface
              } else if (lowerLine.startsWith('weight:')) {
                  const weightText = line.substring('Weight:'.length).trim();
                  if (currentExercise.sets) {
                      currentExercise.sets.forEach(set => set.weight = weightText);
                  }
              }
          }
      }
    });

    if (currentExercise) {
        newWorkoutList.push(currentExercise);
    }

    console.log("Parsed Workout List:", JSON.stringify(newWorkoutList, null, 2));

    router.push({
      pathname: '/workouttabs/startworkout',
      params: { selectedExercise: JSON.stringify(newWorkoutList) },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>AI Workout Generator</Text>

      <Text style={styles.label}>Your Fitness Goals {"\n"}
        (Lose weight, Build muscle, Bigger biceps, etc.):</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your goals"
        placeholderTextColor= {theme.colors.textGray}
        value={goals}
        onChangeText={setGoals}
        multiline
      />

      <Text style={styles.label}>Available Equipment{"\n"}
        (Dumbbells, Resistance bands, No equipment, etc.):</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter available equipment"
        placeholderTextColor= {theme.colors.textGray}
        value={equipment}
        onChangeText={setEquipment}
      />

      <Text style={styles.label}>Time Available for Workout (30 minutes, 1 hour, etc.):</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter time available"
        placeholderTextColor= {theme.colors.textGray}
        value={time}
        onChangeText={setTime}
      />

      <Text style={styles.label}>Current Fitness Level {"\n"}
        (Beginner, Intermediate, Advanced):</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your fitness level"
        placeholderTextColor= {theme.colors.textGray}
        value={currentFitnessLevel}
        onChangeText={setCurrentFitnessLevel}
      />

      <Text style={styles.label}>Additional Remarks
        {"\n"}
        (Low intensity, HIIT, Yoga, etc.):</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter any additional remarks"
        placeholderTextColor= {theme.colors.textGray}
        value={remarks}
        onChangeText={setRemarks}
      />

      <BouncyCheckbox
        size={25}
        fillColor="orange"
        unFillColor="#1c1c1e"
        text="Warm up"
        iconStyle={{ borderColor: "red" }}
        innerIconStyle={{ borderWidth: 2 }}
        textStyle={{ fontFamily: "JosefinSans-Regular", color: theme.colors.textGray }}
        isChecked={warmUp}
        onPress={(isChecked: boolean) => {setWarmUp(isChecked)}}
        paddingBottom ={10}
      />

      <BouncyCheckbox
        size={25}
        fillColor="orange"
        unFillColor="#1c1c1e"
        text="Cool down"
        iconStyle={{ borderColor: "red" }}
        innerIconStyle={{ borderWidth: 2 }}
        textStyle={{ fontFamily: "JosefinSans-Regular", color: theme.colors.textGray }}
        isChecked={coolDown}
        onPress={(isChecked: boolean) => {setCoolDown(isChecked)}}
        paddingBottom ={5}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleGenerateWorkout}
        disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color= {theme.colors.primary} />
        ) : (
          <Text style={styles.buttonText}>Generate Workout</Text>
        )}
      </TouchableOpacity>

      {generatedWorkout ? (
        <View style={styles.workoutContainer}>
          <Text style={styles.workoutTitle}>Your Personalized Workout:</Text>
          <Text style={styles.workoutText}>{generatedWorkout}</Text>
          <TouchableOpacity
            style={[styles.button, { marginTop: 15, backgroundColor: '#DA9E44' }]}
            onPress={handleSaveGeneratedWorkout}
          >
            <Text style={[styles.buttonText, { color: '#000' }]}>Use This Workout</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e',
    padding: 20,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: theme.colors.primaryDark,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#ccc',
  },
  input: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#333',
    color: '#fff',
    minHeight: 50,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: theme.colors.primaryDark,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  workoutContainer: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#555',
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
  },
  workoutText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#e0e0e0',
  },
});