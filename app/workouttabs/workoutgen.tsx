import { Text, View, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from 'expo-router';
import React, { useState, useLayoutEffect} from 'react';
import { theme } from '@/constants/themes';
import { GoogleGenerativeAI } from "@google/generative-ai";
import BouncyCheckbox from "react-native-bouncy-checkbox";

export default function ExGen() {
  const navigation = useNavigation();

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
      const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash'}); //	models/gemini-2.5-flash-preview-05-20
      const userPrompt = `
        Generate a workout plan based on the following user preferences:
        - Goals: ${goals}
        - Available Equipment: ${equipment}
        - Time Available: ${time}
        - Current Fitness Level: ${currentFitnessLevel}
        - Additional Remarks ${remarks}
        - Warm up: ${warmUp}
        - Cool down: ${coolDown}



        Output as plain text, all same font size and unbolded, being as concise as possible without unncessary information, provide purely sets, reps and weights if appropriate, suggest rest time between sets,
        For number of sets, 1.5 minutes per set, excluding rest time, is a good rule of thumb, so if the user has 30 minutes, you can do 10 sets of 3 minutes each. ensure more rest time according to the user's fitness level, with minimally 90 seconds of rest, unless it is a HIIT workout, if there are per arm workouts, ensure fewer sets or shorter rest accordingly
        `;
        // Please provide a structured workout plan, including:
        // - Warm-up
        // - Main Workout (list of exercises with sets and reps/duration)
        // - Cool-down
      console.log("Sending prompt to Gemini API", userPrompt);

      const result = await model.generateContent(userPrompt);
      const response = await result.response;
      const text = await response.text();

      console.log("Gemini API Response:", text);
      setGeneratedWorkout(text);
    } catch (error) {
      console.error('Error generating workout:', error);
      Alert.alert('Error', 'Failed  to generate workout. Please check your internet connection.');
    } finally {
      setIsLoading(false);
    }
    };

  return (
    // Using ScrollView to ensure content is scrollable if it exceeds screen height
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>AI Workout Generator</Text>

      <Text style={styles.label}>Your Fitness Goals 
        {"\n"}
        (Lose weight, Build muscle, Bigger biceps, etc.):</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your goals"
        placeholderTextColor= {theme.colors.textGray} // Make placeholder text visible on dark background
        value={goals}
        onChangeText={setGoals}
        multiline // Allow multiple lines of input
      />

      <Text style={styles.label}>Available Equipment 
        {"\n"}
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

      <Text style={styles.label}>Current Fitness Level 
        {"\n"}
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
        textStyle={{ fontFamily: "JosefinSans-Regular" }}
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
        textStyle={{ fontFamily: "JosefinSans-Regular" }}
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
    backgroundColor: theme.colors.primaryDark, 
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