# React Native Performance Flipper Reporter

This package feeds metrics, marks and measures collected by the `react-native-performance` library to the `Performance` Flipper plugin.

## Installation

```bash
yarn add react-native-performance react-native-flipper react-native-performance-flipper-reporter
```

## Setup

To enable the reporter in with its default setup, add this to your app entry file:

```js
// index.js
if (__DEV__) {
  require('react-native-performance-flipper-reporter').setupDefaultFlipperReporter();
}
```

## License

MIT © Joel Arvidsson 2021 – present
