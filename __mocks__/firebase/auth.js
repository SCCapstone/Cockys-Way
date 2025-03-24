module.exports = {
  getAuth: jest.fn(() => ({
    currentUser: {
      uid: 'test-user',
      email: 'test@example.com',
    },
  })),

  onAuthStateChanged: jest.fn((auth, callback) => {
    callback({
      uid: 'test-user',
      email: 'test@example.com',
    });
    return () => {}; // noop unsubscribe
  }),

  initializeAuth: jest.fn(),

  getReactNativePersistence: jest.fn(() => 'mockedPersistence'),
};
