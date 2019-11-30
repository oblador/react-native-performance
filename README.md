# Flipper React Native Performance Plugin

This is plugin for the debug tool [Flipper](https://fbflipper.com) that measures the startup times of your React Native app. It measures both the native and JavaScript parts, but only on iOS so far.

The aim is to further expand profiling capabilities and Android support in the future.

## Installation

```
yarn add flipper-plugin-react-native-performance
```

## Setup

First, make sure you have successfully [setup Flipper with your React Native app](https://fbflipper.com/docs/getting-started.html#setup-your-react-native-app). Then edit your `AppDelegate.m` with the following:

```diff
  - (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
  {
    [self initializeFlipper:application];
    RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
+   #if DEBUG
+   #ifdef FB_SONARKIT_ENABLED
+   [[FlipperReactPerformancePlugin sharedInstance] setBridge:bridge];
+   #endif
+   #endif
    ...
  }

  - (void) initializeFlipper:(UIApplication *)application {
    ...
+   [client addPlugin: [FlipperReactPerformancePlugin sharedInstance]];
    [client start];
    ...
  }
```

## Demo

Run the demo in the `Example` folder, and you'll get something like this:

<img width="531" alt="" src="https://user-images.githubusercontent.com/378279/69906815-b557b600-13c9-11ea-9566-0d74abb392ed.png">

## License

MIT © Joel Arvidsson 2019–present
