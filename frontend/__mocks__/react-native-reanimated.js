// Manual mock for Jest. The package's own "mock.js" (recommended by its
// docs) still imports its real entry point for a handful of re-exported
// constants, which eagerly initializes the native worklets runtime and
// crashes under Jest ("[Worklets] `createShareable` is not supported on
// web") -- react-native-reanimated 4 + react-native-worklets doesn't have a
// working Jest story yet for the New Architecture. This app never calls
// Reanimated APIs directly; it's only pulled in transitively by
// @react-navigation/drawer's slide animation, so a small inert stand-in for
// the handful of exports drawer-layout actually uses is enough.
const React = require('react');
const { View, ScrollView, FlatList, Text, Image } = require('react-native');

const NOOP = () => {};
const ID = value => value;

const useSharedValue = initial => {
  const value = { value: initial };
  return new Proxy(value, {
    get(target, prop) {
      if (prop === 'value') return target.value;
      if (prop === 'get') return () => target.value;
      if (prop === 'set') {
        return next => {
          target.value = typeof next === 'function' ? next(target.value) : next;
        };
      }
      return undefined;
    },
    set(target, prop, next) {
      if (prop === 'value') {
        target.value = next;
        return true;
      }
      return false;
    },
  });
};

const Animated = {
  View,
  ScrollView,
  FlatList,
  Text,
  Image,
  createAnimatedComponent: ID,
};

module.exports = {
  __esModule: true,
  default: Animated,
  ReduceMotion: { System: 'system', Always: 'always', Never: 'never' },
  Extrapolation: { EXTEND: 'extend', CLAMP: 'clamp', IDENTITY: 'identity' },
  interpolate: () => 0,
  runOnJS:
    fn =>
    (...args) =>
      fn(...args),
  runOnUI: fn => fn,
  useAnimatedProps: factory => (typeof factory === 'function' ? factory() : {}),
  useAnimatedStyle: factory => (typeof factory === 'function' ? factory() : {}),
  useAnimatedRef: () => React.useRef(null),
  useDerivedValue: factory =>
    useSharedValue(typeof factory === 'function' ? factory() : undefined),
  useSharedValue,
  withSpring: (toValue, _config, callback) => {
    callback?.(true);
    return toValue;
  },
  withTiming: (toValue, _config, callback) => {
    callback?.(true);
    return toValue;
  },
  withDelay: (_delay, next) => next,
  withSequence: () => 0,
  withRepeat: ID,
  cancelAnimation: NOOP,
  Easing: {
    linear: ID,
    ease: ID,
    in: ID,
    out: ID,
    inOut: ID,
    bezier: () => ID,
  },
};
