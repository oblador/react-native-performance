# Flipper React Native Performance Plugin

This is plugin for the debug tool [Flipper](https://fbflipper.com) that measures the startup of your React Native app. It provides the following metrics:

- Native startup time
- Script download time
- Script execution time
- Script bundle size
- Time to interactive of root view

Currently only these standard metrics on iOS is supported, but the aim is to further expand profiling capabilities and add Android support in the future.

## Installation

```
yarn add --dev flipper-plugin-react-native-performance
```

## Setup

### Flipper

First, make sure you have successfully [setup Flipper with your React Native app](https://fbflipper.com/docs/getting-started.html#setup-your-react-native-app).

### Flipper Desktop

1. Go to **Manage Plugins** by pressing the button in the lower left corner of the Flipper app, or in the **View** menu
2. Select **Install Plugins** and search for `react-native-performance`
3. Press the **Install** button

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

Run one of the demos in the `examples` folder, and you'll get something like this:

<img width="761" alt="" src="https://user-images.githubusercontent.com/378279/70002854-9b50db80-1561-11ea-861c-6b160f08d721.png">

## License

MIT © Joel Arvidsson 2019 – present
