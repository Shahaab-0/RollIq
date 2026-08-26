// Manual mock -- under Jest there's no native module bridge, so the real
// package throws "Native module NativeRNFBTurboApp is not registered" the
// moment it's imported. src/lib/pushNotifications.ts already treats every
// Firebase call as best-effort (try/catch), so a inert stub is enough to
// let the module graph load during tests.
module.exports = {
  AuthorizationStatus: {
    NOT_DETERMINED: -1,
    DENIED: 0,
    AUTHORIZED: 1,
    PROVISIONAL: 2,
    EPHEMERAL: 3,
  },
  getMessaging: jest.fn(() => ({})),
  getToken: jest.fn(() => Promise.resolve('mock-device-token')),
  onMessage: jest.fn(() => () => {}),
  onTokenRefresh: jest.fn(() => () => {}),
  requestPermission: jest.fn(() => Promise.resolve(1)),
};
