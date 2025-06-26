import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, TextInput, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import ProgressCircle from 'react-native-progress/Circle';
import { supabase } from '../../utils/supabase';
import auth from '@react-native-firebase/auth';
import { useIsFocused } from '@react-navigation/native';
import Swipeable from 'react-native-gesture-handler/Swipeable';


type FoodEntry = {
  id: string;
  food_name: string;
  calories: number;
  date: string;
};

export default function CalorieTracker() {
  const [foodLog, setFoodLog] = useState<FoodEntry[]>([]);
  const [calorieTarget, setCalorieTarget] = useState(2000);
  const [targetInput, setTargetInput] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const isFocused = useIsFocused();

  const getSingaporeDate = () => {
  const now = new Date();
  const sgOffsetMs = 8 * 60 * 60 * 1000;
  const sgDate = new Date(now.getTime() + sgOffsetMs);
  return sgDate.toISOString().split('T')[0];
};

const today = getSingaporeDate();

  const todaysCalories = foodLog
    .filter(entry => entry.date === today)
    .reduce((sum, item) => sum + item.calories, 0);

  const progress = Math.min(todaysCalories / calorieTarget, 1);

  const groupedByDate = foodLog.reduce((acc, entry) => {
    if (!acc[entry.date]) acc[entry.date] = [];
    acc[entry.date].push(entry);
    return acc;
  }, {} as Record<string, FoodEntry[]>);

  const fetchData = async () => {
    const currentUser = auth().currentUser;
    if (!currentUser) return;

    const { data: targetData } = await supabase
      .from('calorie_targets')
      .select('target')
      .eq('user_id', currentUser.uid)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (targetData?.target) setCalorieTarget(targetData.target);

    const { data: foodData } = await supabase
      .from('food_log')
      .select('*')
      .eq('user_id', currentUser.uid)
      .order('date', { ascending: false });

    if (foodData) setFoodLog(foodData);
  };

  useEffect(() => {
    if (isFocused) {
      fetchData();
    }
  }, [isFocused]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const resetToday = async () => {
  const currentUser = auth().currentUser;
  if (!currentUser) return;

  const { error } = await supabase
    .from('food_log')
    .delete()
    .eq('user_id', currentUser.uid)
    .eq('date', today);

  if (error) {
    Alert.alert('Error', 'Could not delete today\'s food entries.');
  } else {
    setFoodLog(prev => prev.filter(entry => entry.date !== today));
    Alert.alert('Success', 'Today\'s entries have been reset.');
  }
};


  const updateTarget = async () => {
    const val = parseInt(targetInput);
    if (!isNaN(val) && val > 0) {
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      await supabase.from('calorie_targets').insert({
        user_id: currentUser.uid,
        target: val,
      });

      setCalorieTarget(val);
      setTargetInput('');
    }
  };

  const deleteEntry = async (id: string) => {
    const { error } = await supabase.from('food_log').delete().eq('id', id);
    if (error) {
      Alert.alert('Error', 'Could not delete entry.');
    } else {
      setFoodLog(prev => prev.filter(entry => entry.id !== id));
    }
  };

  const renderRightActions = (id: string) => (
    <TouchableOpacity style={styles.deleteButton} onPress={() => deleteEntry(id)}>
      <Text style={styles.deleteText}>Delete</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.dashboard}>
        <ProgressCircle
          size={100}
          progress={progress}
          showsText
          color="#ffd33d"
          borderWidth={2}
          thickness={8}
          textStyle={{ color: 'white' }}
        />
        <Text style={styles.caloriesText}>{todaysCalories} / {calorieTarget} kcal</Text>

        <TextInput
          placeholder="Set calorie target"
          placeholderTextColor="#aaa"
          value={targetInput}
          onChangeText={setTargetInput}
          keyboardType="numeric"
          style={styles.input}
        />
        <TouchableOpacity onPress={updateTarget} style={styles.button}>
          <Text style={styles.buttonText}>Set Target</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={resetToday} style={[styles.button, { borderColor: '#ff4444', marginTop: 10 }]}>
          <Text style={[styles.buttonText, { color: '#ff4444' }]}>Reset Today</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ffd33d"
            colors={['#ffd33d']}
          />
        }
      >
        {Object.entries(groupedByDate)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([date, entries]) => (
            <View key={date} style={styles.dayGroup}>
              <Text style={styles.dateHeader}>{date}</Text>
              {entries.map((item, index) => (
                <Swipeable key={item.id} renderRightActions={() => renderRightActions(item.id)}>
                  <View style={styles.foodItem}>
                    <Text style={styles.foodText}>{item.food_name}</Text>
                    <Text style={styles.foodText}>{item.calories} kcal</Text>
                  </View>
                </Swipeable>
              ))}
            </View>
          ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/calorietabs/addfood')}
      >
        <Text style={styles.addText}>+ Add Food</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    padding: 16,
  },
  dashboard: {
    padding: 16,
    backgroundColor: '#303030',
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  caloriesText: {
    color: '#ffd33d',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  input: {
    backgroundColor: '#2c2c2e',
    color: 'white',
    padding: 10,
    borderRadius: 6,
    marginTop: 12,
    width: '80%',
    textAlign: 'center',
  },
  button: {
    borderWidth: 1,
    borderColor: '#ffd33d',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginTop: 8,
  },
  buttonText: {
    color: '#ffd33d',
    fontWeight: 'bold',
  },
  dayGroup: {
    marginBottom: 16,
  },
  dateHeader: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  foodItem: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 6,
    marginBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  foodText: {
    color: '#fff',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 6,
    marginBottom: 4,
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  addButton: {
    alignSelf: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#ffd33d',
    marginTop: 10,
  },
  addText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
