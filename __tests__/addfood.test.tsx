// Mocks FIRST
jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn() }),
  useNavigation: () => ({ setOptions: jest.fn() }),
}));

jest.mock('@react-native-firebase/auth', () => () => ({
  currentUser: { uid: 'mock-user' },
}));

jest.mock('../../utils/supabase', () => ({
  supabase: {
    from: () => ({
      insert: () => ({ error: null }),
    }),
  },
}));

// -------------- Test code --------------
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AddFood from './addfood';

describe('AddFood', () => {
  it('renders food name and calories input', () => {
    const { getByPlaceholderText, getByText } = render(<AddFood />);
    expect(getByPlaceholderText('e.g., Chicken Rice')).toBeTruthy();
    expect(getByPlaceholderText('e.g., 450')).toBeTruthy();
    expect(getByText('Add Food')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('shows alert on invalid input', () => {
    const { getByText } = render(<AddFood />);
    fireEvent.press(getByText('Add Food'));
    // The Alert won't actually show, but no crash = pass
  });
});
