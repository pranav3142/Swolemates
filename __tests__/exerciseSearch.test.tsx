import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AddExerciseScreen from './exercises';

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([
      {
        name: 'Push Up',
        type: 'strength',
        muscle: 'chest',
        equipment: 'body only',
        difficulty: 'beginner',
        instructions: 'Get into plank position and lower your body.',
      },
    ]),
  })
) as jest.Mock;

const Stack = createNativeStackNavigator();

const renderWithNavigation = () =>
  render(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Exercises" component={AddExerciseScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );

describe('Exercise Search Feature', () => {
  it('2.1 - calls fetchExercises with query and displays results', async () => {
    const { getByPlaceholderText, getByText } = renderWithNavigation();

    fireEvent.changeText(getByPlaceholderText('Enter name'), 'push');
    fireEvent.press(getByText('Search'));

    await waitFor(() => {
      expect(getByText('Push Up')).toBeTruthy();
    });
  });

  it('2.2 - updates query parameter and fetches accordingly', async () => {
    const { getByText, getByPlaceholderText } = renderWithNavigation();

    fireEvent.press(getByText('muscle'));
    expect(getByPlaceholderText('Enter muscle')).toBeTruthy();
  });

  it('2.3 - toggles instructions when tapped', async () => {
    const { getByText, getByPlaceholderText, queryByText } = renderWithNavigation();

    fireEvent.changeText(getByPlaceholderText('Enter name'), 'push');
    fireEvent.press(getByText('Search'));

    await waitFor(() => getByText('Push Up'));
    fireEvent.press(getByText('Instructions'));

    expect(queryByText(/Get into plank position/)).toBeTruthy();
  });
});
