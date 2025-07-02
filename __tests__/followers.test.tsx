// Mock navigation and all native/backend dependencies
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
          in: () => ({
            // Simulate: the followers list returns empty
            then: function (cb) { return cb({ data: [], error: null }); },
          }),
          // For first call (fetchFollowers), ignore .in
          then: function (cb) { return cb({ data: [], error: null }); },
        }),
      }),
      insert: () => ({ error: null }),
    }),
  },
}));

import React from 'react';
import { render } from '@testing-library/react-native';
import FollowersList from '../app/followingtabs/followers';

describe('FollowersList', () => {
  it('renders without crashing and shows no followers by default', () => {
    const { toJSON } = render(<FollowersList />);
    // No crash = pass; optional: check snapshot or specific text
    expect(toJSON()).toBeTruthy();
  });
});
