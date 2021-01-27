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

### [`flipper-plugin-performance`](https://github.com/oblador/react-native-performance/blob/master/packages/flipper-plugin-performance/README.md)

Visualize performance tracing on a timeline and generic metrics in the debug tool Flipper.

### [`react-native-performance-flipper-reporter`](https://github.com/oblador/react-native-performance/blob/master/packages/react-native-performance-flipper-reporter/README.md)

Connect the `react-native-performance` library with the `flipper-plugin-performance` visualization tool in development.

## Demo

See the projects in the [`examples`](https://github.com/oblador/flipper-plugin-react-native-performance/tree/master/examples) folder.

## Development

Make sure to have [`yarn`](https://classic.yarnpkg.com/lang/en/) v1 installed and run `yarn` in the root folder to install dependencies for all packages.

Uninstall the Flipper Performance plugin if previously installed. Then edit your `~/.flipper/config.json` to look something like this:

```
{
  "pluginPaths": ["/path/to/react-native-performance/packages"]
}
```

Continously compile the plugin as you edit with:

```bash
yarn workspace flipper-plugin-performance run watch
```

Run the example app with:

```bash
cd examples/vanilla
yarn start # important to run this before the next step!
yarn ios # or yarn android
```

## License

MIT © Joel Arvidsson 2019 – present
