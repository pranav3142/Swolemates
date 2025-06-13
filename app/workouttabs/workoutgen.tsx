import { Text, View, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from 'expo-router';
import React, { useState, useLayoutEffect} from 'react';
import { theme } from '@/constants/themes';

export default function ExGen() {
  const navigation = useNavigation();

  const [goals, setGoals] = useState('');
  const [equipment, setEquipment] = useState('');
  const [time, setTime] = useState('');
  const [currentFitnessLevel, setCurrentFitnessLevel] = useState('');
  const [generatedWorkout, setGeneratedWorkout] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Generate Workout',
      headerStyle: {
        backgroundColor: '#25292e',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold'
      }
    });
  }, [navigation]);
  // --- Placeholder for LLM API call (will replace this with actual API integration later) ---
  const handleGenerateWorkout = async () => {
    if (!goals || !equipment || !time || !currentFitnessLevel) {
      Alert.alert('Missing Information', 'Please fill in all fields to generate a workout.');
      return;
    }

    setIsLoading(true);
    setGeneratedWorkout(''); // Clear previous workout

    try {
      // THIS IS WHERE YOU'LL INTEGRATE YOUR LLM API CALL
      // For now, simulating a response
      const userPrompt = `
        Generate a workout plan based on the following user preferences:
        - Goals: ${goals}
        - Available Equipment: ${equipment}
        - Time Available: ${time}
        - Current Fitness Level: ${currentFitnessLevel}

        Please provide a structured workout plan, including:
        - Warm-up
        - Main Workout (list of exercises with sets and reps/duration)
        - Cool-down

        Format the output as a readable text, possibly using markdown for headings and bullet points.
        `;

      console.log("Sending prompt to LLM (simulated):", userPrompt);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Simulate a generated workout (replace with actual LLM response)
      const simulatedResponse = `
**Warm-up (5 minutes):**
* Light cardio (jumping jacks, high knees) - 2 minutes
* Dynamic stretches (arm circles, leg swings) - 3 minutes

**Main Workout:**
* **Squats:** 3 sets of 10-12 reps
* **Push-ups:** 3 sets to failure
* **Plank:** 3 sets, hold for 30-60 seconds
* **Lunges:** 3 sets of 10 reps per leg
* **Dumbbell Rows (if dumbbells available):** 3 sets of 10-12 reps per arm
* **Burpees (bodyweight option):** 3 sets of 8-10 reps

**Cool-down (5 minutes):**
* Static stretches (hamstring stretch, tricep stretch) - 5 minutes
      `;

      setGeneratedWorkout(simulatedResponse);
    } catch (error) {
      console.error('Error generating workout:', error);
      Alert.alert('Error', 'Failed to generate workout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Using ScrollView to ensure content is scrollable if it exceeds screen height
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>AI Workout Generator</Text>

      <Text style={styles.label}>Your Fitness Goals (e.g., "lose weight, build muscle, improve endurance"):</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your goals"
        placeholderTextColor= {theme.colors.textGray} // Make placeholder text visible on dark background
        value={goals}
        onChangeText={setGoals}
        multiline // Allow multiple lines of input
      />

      <Text style={styles.label}>Available Equipment (e.g., "dumbbells, resistance bands, no equipment"):</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter available equipment"
        placeholderTextColor= {theme.colors.textGray}
        value={equipment}
        onChangeText={setEquipment}
      />

      <Text style={styles.label}>Time Available for Workout (e.g., "30 minutes, 1 hour"):</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter time available"
        placeholderTextColor= {theme.colors.textGray}
        value={time}
        onChangeText={setTime}
      />

      <Text style={styles.label}>Current Fitness Level (e.g., "beginner, intermediate, advanced"):</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your fitness level"
        placeholderTextColor= {theme.colors.textGray}
        value={currentFitnessLevel}
        onChangeText={setCurrentFitnessLevel}
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
          {/* We'll eventually use a markdown parser here if the LLM returns markdown */}
          <Text style={styles.workoutText}>{generatedWorkout}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e', // Dark background for the screen
    padding: 20,
  },
  contentContainer: {
    paddingBottom: 40, // Add some padding to the bottom for scrollability
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: theme.colors.primaryDark, // White title text
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#ccc', // Lighter grey for labels
  },
  input: {
    borderWidth: 1,
    borderColor: '#444', // Darker border for inputs
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#333', // Darker background for inputs
    color: '#fff', // White input text
    minHeight: 50, // Ensure multiline inputs are visible
    textAlignVertical: 'top', // Align text to the top for multiline
  },
  button: {
    backgroundColor: theme.colors.primary, 
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  workoutContainer: {
    backgroundColor: '#333', // Dark background for workout output
    borderRadius: 10,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#555', // Slightly lighter border
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff', // White workout title
  },
  workoutText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#e0e0e0', // Slightly off-white for workout text
  },
});