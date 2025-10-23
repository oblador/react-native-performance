# React Native Performance tooling

Toolchain to measure and monitor the performance of your React Native app in development, pipeline and in production.

## Packages

### [`react-native-performance`](https://github.com/oblador/react-native-performance/blob/master/packages/react-native-performance/README.md)

An implementation of the [`Performance` API](https://developer.mozilla.org/en-US/docs/Web/API/Performance) for React Native.

- Integrates well with `React.Profiler` API
- Trace arbitrary events in your app such as component render time
- Capture network traffic
- Collect native traces such as script execution and time to interactive of root view
- Collect native metrics in development such as JS bundle size

### [`isomorphic-performance`](https://github.com/oblador/react-native-performance/blob/master/packages/isomorphic-performance/README.md)

Isomorphic Performance API for Node, Browser & React Native. Useful if your app targets both web and native.

## Demo

See the projects in the [`examples`](https://github.com/oblador/react-native-performance/tree/master/examples) folder.

## Devtools integration

With Flipper deprecated, the best replacement is currently [Rozenite](https://www.rozenite.dev) that supports `react-native-performance` out of the box with an [official plugin](https://www.rozenite.dev/docs/official-plugins/performance-monitor).

## Development

Make sure to have [`yarn`](https://classic.yarnpkg.com/lang/en/) v1 installed and run `yarn` in the root folder to install dependencies for all packages.

Run the example app with:

```bash
cd examples/vanilla
yarn start # important to run this before the next step!
yarn ios # or yarn android
```

Run the unit tests with:

```bash
yarn test
```

## License

MIT © Joel Arvidsson 2019 – present
