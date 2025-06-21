import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Button, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation, useRouter, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';


interface Exercise {
  name: string;
  type: string;
  muscle: string;
  equipment: string;
  difficulty: string;
  instructions: string;
}

const PARAMS: ('name' | 'muscle' | 'type' | 'difficulty' | 'equipment')[] = ['name', 'muscle', 'type', 'difficulty', 'equipment'];

export default function Exercises() {
  const navigation = useNavigation();
  const router = useRouter();
  const { currentList } = useLocalSearchParams();

  const [queryParam, setQueryParam] = useState<'name' | 'muscle' | 'type' | 'difficulty' | 'equipment'>('name');
  const [searchValue, setSearchValue] = useState('');
  const [exercises, setExercises] = useState<Exercise[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const previousList: Exercise[] = currentList ? JSON.parse(currentList as string) : [];

  const toggleExpand = (index: number) => {
    setExpandedIndex(prev => (prev === index ? null : index));
  };

  const selectExercise = (exercise: Exercise) => {
    const updatedList = [...previousList, exercise];
    router.replace({
      pathname: '/workouttabs/startworkout',
      params: { selectedExercise: JSON.stringify(updatedList) },
    });
  };





  const apiKey = '5uSqRB/Dod0jN38Kkj3MJg==A8ztw8uyaP3IiIaU';

const handleHeaderBack = () => {
  router.replace({
    pathname: '/workouttabs/startworkout',
    params: { selectedExercise: JSON.stringify(previousList) }
  });
};

useLayoutEffect(() => {
  navigation.setOptions({
    title: 'Add an Exercise',
    headerStyle: { backgroundColor: '#25292e' },
    headerTintColor: '#fff',
    headerBackVisible: false,
    headerLeft: () => (
      <TouchableOpacity onPress={handleHeaderBack} style={{ paddingHorizontal: 16 }}>
        <Ionicons name={'chevron-back-outline'} color={'white'} size={24} />
      </TouchableOpacity>
    ),
  });
}, [navigation, previousList]);


  const fetchExercises = async () => {
    try {
      setLoading(true);
      setError(null);
      setExercises(null);

      const url = `https://api.api-ninjas.com/v1/exercises?${queryParam}=${encodeURIComponent(searchValue)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Api-Key': apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data: Exercise[] = await response.json();
      setExercises(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Choose Parameter:</Text>
      <View style={styles.paramRow}>
        {PARAMS.map(param => (
          <TouchableOpacity
            key={param}
            style={[styles.paramButton, queryParam === param && styles.activeParam]}
            onPress={() => setQueryParam(param)}
          >
            <Text style={styles.paramText}>{param}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        placeholder={`Enter ${queryParam}`}
        placeholderTextColor="#aaa"
        style={styles.input}
        value={searchValue}
        onChangeText={setSearchValue}
      />

      <Button title="Search" onPress={fetchExercises} color="#1c1c1e" />

      {loading && <ActivityIndicator size="large" color="#fff" style={{ marginTop: 16 }} />}
      {error && <Text style={styles.text}>Error: {error}</Text>}

      {exercises && (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {exercises.map((ex, index) => (
            <TouchableOpacity key={index} onPress={() => selectExercise(ex)} activeOpacity={0.8}>
              <View style={styles.card}>
                <Text style={styles.title}>{ex.name}</Text>
                <Text style={styles.text}>Muscle: {ex.muscle}</Text>
                <Text style={styles.text}>Type: {ex.type}</Text>
                <Text style={styles.text}>Equipment: {ex.equipment}</Text>
                <Text style={styles.text}>Difficulty: {ex.difficulty}</Text>
                {expandedIndex === index && (
                  <Text style={[styles.text, { marginTop: 8 }]}>Instructions: {ex.instructions}</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e',
    padding: 16,
  },
  label: {
    color: '#fff',
    marginBottom: 6,
    fontWeight: 'bold',
  },
  paramRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  paramButton: {
    backgroundColor: '#2c2c2e',
    paddingVertical: 8,
    paddingHorizontal: 7,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  activeParam: {
    backgroundColor: '#ffd33d',
  },
  paramText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#2c2c2e',
    color: 'white',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  scrollContainer: {
    paddingBottom: 32,
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
    marginBottom: 2,
  },
});
