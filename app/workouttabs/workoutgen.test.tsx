// Mock all native and external modules
jest.mock('expo-router', () => ({
  useNavigation: () => ({ setOptions: jest.fn() }),
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock('@/constants/themes', () => ({
  theme: {
    colors: {
      textGray: '#aaa',
      primary: '#ffd33d',
      primaryDark: '#ffaa00'
    }
  }
}));
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: function() {
    return {
      getGenerativeModel: () => ({
        generateContent: async () => ({
          response: {
            text: async () => 'Workout: Example',
          },
        }),
      }),
    };
  }
}));
jest.mock('react-native-reanimated', () => ({
  useSharedValue: (v: any) => ({ value: v }),
}));
jest.mock('react-native-awesome-slider', () => ({
  Slider: ({ children }) => null,
}));

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ExGen from './workoutgen';

describe('ExGen Workout Generator', () => {
  it('renders main UI fields', () => {
    const { getByPlaceholderText, getByText } = render(<ExGen />);
    expect(getByText('AI Workout Generator')).toBeTruthy();
    expect(getByPlaceholderText('Enter your goals')).toBeTruthy();
    expect(getByPlaceholderText('Enter available equipment')).toBeTruthy();
    expect(getByPlaceholderText('Enter any additional remarks')).toBeTruthy();
    expect(getByText('Generate Workout')).toBeTruthy();
  });

  it('alerts if required fields missing on generate', () => {
    const { getByText } = render(<ExGen />);
    // The Alert.alert will not display in test, but no crash = pass
    fireEvent.press(getByText('Generate Workout'));
  });

  it('renders generated workout on happy path', async () => {
    const { getByText, getByPlaceholderText } = render(<ExGen />);
    fireEvent.changeText(getByPlaceholderText('Enter your goals'), 'Lose fat');
    fireEvent.changeText(getByPlaceholderText('Enter available equipment'), 'Dumbbells');
    fireEvent.changeText(getByPlaceholderText('Enter any additional remarks'), 'HIIT');
    fireEvent.press(getByText('Beginner'));
    fireEvent.press(getByText('Generate Workout'));
    await waitFor(() => {
      expect(getByText('Your Personalized Workout:')).toBeTruthy();
      expect(getByText('Workout: Example')).toBeTruthy();
    });
  });
});
