import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { supabase } from '../../utils/supabase';
import auth from '@react-native-firebase/auth';



export default function AddFood() {
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const router = useRouter();
    const navigation = useNavigation();
  

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Add Food',
      headerStyle: {
        backgroundColor: '#25292e',
      },
      headerTintColor: '#fff',
    });
  }, [navigation]);

  const handleAdd = async () => {
  const calNum = parseInt(calories);
  if (!name || isNaN(calNum) || calNum <= 0) {
    Alert.alert('Invalid Input', 'Please enter a valid name and calorie value.');
    return;
  }

  const currentUser = auth().currentUser;
  if (!currentUser) return;

  const entry = {
    user_id: currentUser.uid,
    food_name: name,
    calories: calNum,
    date: new Date().toISOString().split('T')[0],
  };

  const { error } = await supabase.from('food_log').insert(entry);

  if (error) {
    Alert.alert('Error', error.message);
  } else {
    Alert.alert('Food Added', `${name} - ${calNum} kcal`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  }
};


  return (
    <View style={styles.container}>
      <Text style={styles.label}>Food Name</Text>
      <TextInput
        placeholder="e.g., Chicken Rice"
        placeholderTextColor="#aaa"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <Text style={styles.label}>Calories</Text>
      <TextInput
        placeholder="e.g., 450"
        placeholderTextColor="#aaa"
        value={calories}
        onChangeText={setCalories}
        keyboardType="numeric"
        style={styles.input}
      />

      <TouchableOpacity onPress={handleAdd} style={styles.button}>
        <Text style={styles.buttonText}>Add Food</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()} style={[styles.button, { borderColor: '#ff4444', marginTop: 10 }]}>
        <Text style={[styles.buttonText, { color: '#ff4444' }]}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    padding: 24,
  },
  label: {
    color: '#fff',
    marginBottom: 6,
    marginTop: 12,
    fontSize: 16,
  },
  input: {
    backgroundColor: '#2c2c2e',
    color: 'white',
    padding: 12,
    borderRadius: 6,
    fontSize: 16,
  },
  button: {
    marginTop: 20,
    borderColor: '#ffd33d',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffd33d',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
