import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, Link, useRouter } from 'expo-router';

export default function TimerScreen() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const navigation = useNavigation();
  const router = useRouter();

  useLayoutEffect(() => {
      navigation.setOptions({
        title: 'Workout Log',
        headerStyle: { backgroundColor: '#25292e' },
        headerTintColor: '#fff',
      });
    }, [navigation]);

  useEffect(() => {
    let interval : any;
    if (running) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [running]);

  const toggleTimer = () => {
    setRunning(prev => !prev);
  };

  const resetTimer =() =>{
    setSeconds(0);
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
            <Text style={styles.buttonText}>{"Reset"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity onPress={() => router.push('/workouttabs/addexercise')} style={styles.addExerciseButton}>
        <Text style={styles.buttonText}>Add exercise</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    justifyContent: 'space-between',
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
    paddingVertical:10,
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
  },
  timercontainer:{
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
});
