// Mocks to avoid native/Supabase/Firebase calls
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('react-native-progress/Circle', () => 'ProgressCircle');
jest.mock('react-native-gesture-handler/Swipeable', () => 'Swipeable');
jest.mock('@react-native-firebase/auth', () => () => ({
  currentUser: { uid: 'mock-user' },
}));
jest.mock('@react-navigation/native', () => ({
  useIsFocused: () => true,
}));
jest.mock('../../utils/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            limit: () => ({
              single: () => ({ data: { target: 2000 } }),
            }),
          }),
        }),
      }),
      insert: () => ({}),
      delete: () => ({ eq: () => ({}) }),
    }),
  },
}));

import React from 'react';
import { render } from '@testing-library/react-native';
import CalorieTracker from './calorietracker';

describe('CalorieTracker', () => {
  it('renders dashboard and add food button', () => {
    const { getByText } = render(<CalorieTracker />);
    expect(getByText(/kcal/)).toBeTruthy(); // Looks for "kcal" label
    expect(getByText('+ Add Food')).toBeTruthy();
  });
});
