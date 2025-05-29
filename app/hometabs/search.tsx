import { Text, View, StyleSheet, TextInput, Button, Alert } from 'react-native';
import React,{ useLayoutEffect, useState } from 'react';
import { useNavigation } from 'expo-router';
//import { TextInput } from 'react-native-gesture-handler';

export default function Search() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Search for your friends',
      headerStyle: {
        backgroundColor: '#25292e',
      },
      headerTintColor: '#fff',
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      
      <TextInput style={styles.input}
        placeholder="Enter name"
        placeholderTextColor="#aaa"
        value={searchQuery}
        onChangeText={setSearchQuery}/>
        <Button title="Search"  color="#ffd33d" />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e',
    padding: 20,
    paddingTop: 40, // Extra padding from top
  },
  text: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#2c2c2e',
    color: 'white',
    width: '100%',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  title: {
    color: 'white',
    fontSize: 18,
    marginBottom: 16,
  },

});

