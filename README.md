# Flipper React Native Performance Plugin

This is plugin for the debug tool [Flipper](https://fbflipper.com) that measures the startup times of your React Native app. It measures:

- Native startup time
- Script download time
- Script parse time
- React app mount time

Currently only on iOS is supported, but the aim is to further expand profiling capabilities and Android support in the future.

## Installation

```
yarn add flipper-plugin-react-native-performance
```

## Setup

First, make sure you have successfully [setup Flipper with your React Native app](https://fbflipper.com/docs/getting-started.html#setup-your-react-native-app).

### iOS

Edit your `Podfile` by adding the following:

```diff
def flipper_pods()
  ...
+ pod 'flipper-plugin-react-native-performance', :path => "../node_modules/flipper-plugin-react-native-performance/ios", :configuration => 'Debug'
end
```

Edit your `AppDelegate.m` by adding the following:

```diff
+   #if DEBUG
+   #ifdef FB_SONARKIT_ENABLED
+   #import <flipper-plugin-react-native-performance/FlipperReactPerformancePlugin.h>
+   #endif
+   #endif

@implementation AppDelegate

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

#### Setup for React Native Navigation

Edit your `AppDelegate.m` like above, but for the `application:didFinishLaunchingWithOptions` method, add the following instead:

```diff
  - (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
  {
    [self initializeFlipper:application];
    NSURL *jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
    [ReactNativeNavigation bootstrap:jsCodeLocation launchOptions:launchOptions];
+   #if DEBUG
+   #ifdef FB_SONARKIT_ENABLED
+   [[FlipperReactPerformancePlugin sharedInstance] setBridge:[ReactNativeNavigation getBridge]];
+   #endif
+   #endif
    ...
  }
```

## Demo

Run the demo in the `Example` folder, and you'll get something like this:

<img width="536" alt="" src="https://user-images.githubusercontent.com/378279/69907313-539c4980-13d3-11ea-8cb5-cefa1153c0ff.png">

## License

MIT © Joel Arvidsson 2019–present
