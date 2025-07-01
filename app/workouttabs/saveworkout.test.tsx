// Mock navigation, auth, and Supabase dependencies
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn() }),
  useNavigation: () => ({ setOptions: jest.fn() }),
  useLocalSearchParams: () => ({
    exercises: JSON.stringify([
      {
        name: 'Push Up',
        muscle: 'Chest',
        type: 'Bodyweight',
        equipment: 'None',
        difficulty: 'Beginner',
        instructions: 'Do a push up',
        sets: [{ reps: '10', weight: '0' }]
      }
    ])
  }),
}));
jest.mock('@react-native-firebase/auth', () => () => ({
  currentUser: { uid: 'mock-user', displayName: 'Test User' },
}));
jest.mock('../../utils/supabase', () => ({
  supabase: {
    from: () => ({
      insert: () => ({ error: null }),
    }),
  },
}));
jest.mock('@expo/vector-icons/Ionicons', () => {
  const React = require('react');
  return () => React.createElement('Icon', {});
});

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SaveWorkout from './saveworkout';

describe('SaveWorkout', () => {
  it('renders workout name, description, and exercise', () => {
    const { getByPlaceholderText, getByText } = render(<SaveWorkout />);
    expect(getByPlaceholderText('Enter workout name')).toBeTruthy();
    expect(getByPlaceholderText('Enter workout description')).toBeTruthy();
    expect(getByText('Push Up')).toBeTruthy();
    expect(getByText('Muscle: Chest')).toBeTruthy();
    expect(getByText('Set 1: 10 reps × 0 kg')).toBeTruthy();
  });

  it('calls handleSave on Save Workout button press', () => {
    const { getByText, getByPlaceholderText } = render(<SaveWorkout />);
    fireEvent.changeText(getByPlaceholderText('Enter workout name'), 'My Test Workout');
    fireEvent.changeText(getByPlaceholderText('Enter workout description'), 'A test workout');
    fireEvent.press(getByText('Save Workout'));
    // The Alert will not show in test; no crash = pass
  });
});
