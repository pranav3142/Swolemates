import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../utils/supabase';
import auth from '@react-native-firebase/auth';

export default function CustomExerciseScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { currentList } = useLocalSearchParams();
  const [customList, setCustomList] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: '',
    type: '',
    muscle: '',
    equipment: '',
    instructions: '',
  });

  const user = auth().currentUser;
  const previousList = currentList ? JSON.parse(currentList as string) : [];

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'My Custom Exercises',
      headerStyle: { backgroundColor: '#25292e' },
      headerTintColor: '#fff',
    });
  }, [navigation]);

  const fetchCustomExercises = async () => {
    const { data, error } = await supabase
      .from('custom_exercises')
      .select('*')
      .eq('user_id', user?.uid)
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching custom exercises:', error.message);
    else setCustomList(data);
  };

  useEffect(() => {
    if (user) fetchCustomExercises();
  }, [user]);

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      Alert.alert('Name is required.');
      return;
    }

    const { error } = await supabase.from('custom_exercises').insert({
      ...form,
      user_id: user?.uid,
    });

    if (error) {
      console.error('Error saving custom exercise:', error.message);
      Alert.alert('Failed to save exercise.');
    } else {
      Alert.alert('Exercise saved!');
      setForm({ name: '', type: '', muscle: '', equipment: '', instructions: '' });
      fetchCustomExercises();
    }
  };

  const handleSelect = (exercise: any) => {
    const updatedList = [...previousList, exercise];
    router.replace({
      pathname: '/workouttabs/startworkout',
      params: { selectedExercise: JSON.stringify(updatedList) },
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.header}>Add a Custom Exercise</Text>

      {['name', 'type', 'muscle', 'equipment', 'instructions'].map(field => (
        <TextInput
          key={field}
          placeholder={field[0].toUpperCase() + field.slice(1)}
          placeholderTextColor="#aaa"
          style={styles.input}
          value={form[field]}
          onChangeText={text => handleChange(field, text)}
        />
      ))}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Save Exercise</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Your Exercises</Text>

      {customList.map((exercise, idx) => (
        <TouchableOpacity key={idx} onPress={() => handleSelect(exercise)} style={styles.card}>
          <Text style={styles.title}>{exercise.name}</Text>
          <Text style={styles.text}>Muscle: {exercise.muscle}</Text>
          <Text style={styles.text}>Type: {exercise.type}</Text>
          <Text style={styles.text}>Equipment: {exercise.equipment}</Text>
          <Text style={styles.text}>Instructions: {exercise.instructions}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e',
    padding: 16,
  },
  input: {
    backgroundColor: '#2c2c2e',
    color: 'white',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#ffd33d',
    paddingVertical: 10,
    borderRadius: 6,
    marginBottom: 20,
  },
  buttonText: {
    textAlign: 'center',
    color: '#000',
    fontWeight: 'bold',
  },
  header: {
    color: '#ffd33d',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#2c2c2e',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  title: {
    color: '#ffd33d',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  text: {
    color: '#fff',
    fontSize: 13,
  },
});
