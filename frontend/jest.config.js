// The default preset's transformIgnorePatterns only allow-lists
// "react-native"/"@react-native(-community)?" -- several other dependencies
// here also ship ESM-only builds that Jest can't require() untransformed,
// so they need to be added explicitly.
const ESM_PACKAGES = [
  '(jest-)?react-native',
  'react-native-.*',
  '@react-native(-community)?',
  '@react-native-firebase',
  '@react-native-async-storage',
  '@react-navigation',
  'react-redux',
  '@reduxjs',
  'immer',
  '@tanstack',
  'lucide-react-native',
  '@sentry',
];

module.exports = {
  preset: '@react-native/jest-preset',
  resolver: '<rootDir>/jest/resolver.js',
  transformIgnorePatterns: [`node_modules/(?!(${ESM_PACKAGES.join('|')})/)`],
  // The preset's own `transform` only covers .js/.ts/.tsx -- lucide-react-native
  // ships its ESM build as .mjs, which needs the same babel-jest transform.
  transform: {
    '^.+\\.mjs$': 'babel-jest',
  },
  // react-navigation's own docs call for this -- gesture-handler's native
  // module has nothing to bind to under Jest otherwise.
  setupFiles: ['<rootDir>/node_modules/react-native-gesture-handler/jestSetup.js'],
};
