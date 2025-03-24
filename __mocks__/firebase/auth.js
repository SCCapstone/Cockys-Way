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

  updateEmail: jest.fn(() => Promise.resolve()),
  updatePassword: jest.fn(() => Promise.resolve()),
  reauthenticateWithCredential: jest.fn(() => Promise.resolve()),
  EmailAuthProvider: {
    credential: jest.fn((email, password) => ({
      email,
      password,
    })),
  },
  sendEmailVerification: jest.fn(() => Promise.resolve()),
};
