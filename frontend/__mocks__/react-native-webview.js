// Manual mock -- same reasoning as __mocks__/react-native-reanimated.js:
// react-native-webview's native module has nothing to bind to under Jest.
const React = require('react');
const { View } = require('react-native');

const WebView = React.forwardRef((props, ref) => React.createElement(View, { ...props, ref }));

module.exports = {
  __esModule: true,
  default: WebView,
  WebView,
};
