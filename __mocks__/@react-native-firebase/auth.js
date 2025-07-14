const mockAuth = {
  currentUser: {
    uid: 'mock-user-id',
    email: 'mock@example.com',
  },
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
};

export default jest.fn(() => mockAuth);
