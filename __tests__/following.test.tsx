// Mock all dependencies to avoid native/network issues
jest.mock('expo-router', () => ({
  useNavigation: () => ({ setOptions: jest.fn() }),
}));
jest.mock('@react-native-firebase/auth', () => () => ({
  currentUser: { uid: 'mock-user' },
}));
jest.mock('../../utils/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          // The main fetchFollowing query
          // Simulate: data is an empty array, no error
          then: function (cb) { return cb({ data: [], error: null }); },
        }),
      }),
      delete: () => ({
        eq: () => ({}),
      }),
    }),
  },
}));

import React from 'react';
import { render } from '@testing-library/react-native';
import FollowingList from './following';

describe('FollowingList', () => {
  it('shows empty state message if not following anyone', () => {
    const { getByText } = render(<FollowingList />);
    expect(getByText("You're not following anyone yet.")).toBeTruthy();
  });
});
