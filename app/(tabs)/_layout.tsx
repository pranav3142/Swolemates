import { Tabs } from 'expo-router';
import { Image } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';


export default function TabLayout() {
  return (
    <Tabs
  screenOptions={{
    
    tabBarActiveTintColor: '#ffd33d',
    headerStyle: {
      backgroundColor: '#25292e',
    },
    headerShadowVisible: false,
    headerTintColor: '#fff',
    tabBarStyle: {
    backgroundColor: '#25292e',
    },
  }}
>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Image source={require('../../assets/images/dumbbell.png')} style={{ width: 24, height: 24, tintColor: color }}/>

          ),
        }}
      />

      <Tabs.Screen
        name="workout"
        options={{
          title: 'Workout',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'add-circle' : 'add-circle-outline'} color={color} size={24}/>
          ),
        }}
      />
  

      <Tabs.Screen
        name="buddymatch"
        options={{
          title: 'Find Buddy',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'man' : 'man-outline'} color={color} size={24}/>
          ),
        }}
      />

      <Tabs.Screen
        name="calorietracker"
        options={{
          title: 'Calories',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'nutrition' : 'nutrition-outline'} color={color} size={24}/>
          ),
        }}
      />

      <Tabs.Screen
        name="about"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} color={color} size={24}/>
          ),
        }}
      />

  
      
    </Tabs>
  );
}
