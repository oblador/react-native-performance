# Flipper Performance Plugin

This is a plugin for the debug tool [Flipper](https://fbflipper.com) that provides a UI for visualizing performance tracing on a timeline and generic metrics.

<img width="846" alt="" src="https://user-images.githubusercontent.com/378279/105892056-9f677480-6011-11eb-895a-f3f8653449c8.png">

It can be used as a generic profiler, or used together with the `react-native-performance` library, where the `react-native-performance-flipper-reporter` acts as the middleman transforming and filtering the data collected into something suitable for visualization.

## Setup

### Flipper Desktop

1. Go to **Manage Plugins** by pressing the button in the lower left corner of the Flipper app, or in the **View** menu
2. Select **Install Plugins** and search for `flipper-plugin-performance`
3. Press the **Install** button

### Optional: React Native Performance

#### Install dependencies

```bash
yarn add react-native-performance react-native-flipper react-native-performance-flipper-reporter
```

#### Enable integration

```js
// index.js
if (__DEV__) {
  require('react-native-performance-flipper-reporter').setupDefaultFlipperReporter();
}
```

## License

MIT © Joel Arvidsson 2021 – present
