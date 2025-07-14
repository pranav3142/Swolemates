// ✅ Mocks
jest.mock('expo-router', () => ({
  useNavigation: () => ({ setOptions: jest.fn() }),
}));

jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(),
}));

// ✅ Imports
import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import NewsScreen from './news';
import { Linking } from 'react-native';

// ✅ Mock fetch response
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve({
        articles: [
          {
            title: 'Gym Breakthrough: New Fitness Tech',
            description: 'Revolutionary tech changing how we work out.',
            url: 'https://example.com/article1',
            urlToImage: 'https://example.com/image1.jpg',
            publishedAt: '2024-07-13T12:00:00Z',
            source: { name: 'FitNews' },
          },
        ],
      }),
  })
) as jest.Mock;

// ✅ Tests
describe('News Feature', () => {
  it('11.1 - fetches and displays news articles correctly', async () => {
    const { getByText } = render(<NewsScreen />);
    await waitFor(() => {
      expect(getByText('Gym Breakthrough: New Fitness Tech')).toBeTruthy();
      expect(getByText('Revolutionary tech changing how we work out.')).toBeTruthy();
      expect(getByText(/FitNews/)).toBeTruthy();
    });
  });

  
});
