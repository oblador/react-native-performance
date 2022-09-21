# React Native Performance API

This is an implementation of the [`Performance` API](https://developer.mozilla.org/en-US/docs/Web/API/Performance) for React Native based on the [User Timing Level 3](https://www.w3.org/TR/user-timing-3/) and [Performance Timeline Level 2](https://www.w3.org/TR/performance-timeline-2/) drafts.

_Note_: The timestamps used are high resolution (fractions of milliseconds) and monotonically increasing, meaning that they are independent of system clock adjustments. To convert a performance timestamp to a unix epoch timestamp do like this:

```js
const timestamp = Date.now() - performance.timeOrigin + entry.startTime;
```

## Installation

**Yarn**: `yarn add --dev react-native-performance`

**NPM**: `npm install --save-dev react-native-performance`

### Manual integration

If your project is not set up with autolinking you need to link manually.

#### iOS

Add the following to your `Podfile` and run `pod install`:

```ruby
pod 'react-native-performance', :path => '../node_modules/react-native-performance/ios'
```

## Usage

See [`examples/vanilla`](https://github.com/oblador/flipper-plugin-react-native-performance/tree/master/examples/vanilla) for a demo of the different features.

### Basic measure example

Marking timeline events, measuring the duration between them and fetching these entries [works just like on the web](https://developer.mozilla.org/en-US/docs/Web/API/Performance):

```js
import performance from 'react-native-performance';

performance.mark('myMark');
performance.measure('myMeasure', 'myMark');
performance.getEntriesByName('myMeasure');
-> [{ name: "myMeasure", entryType: "measure", startTime: 98, duration: 123 }]
```

### Meta data

If you want to add some additional details to your measurements or marks, you may pass a second options object argument with a `detail` entry per the [User Timing Level 3](https://www.w3.org/TR/user-timing-3/) draft:

```js
import performance from 'react-native-performance';

performance.mark('myMark', {
  detail: {
    screen: 'settings',
    ...
  }
});
performance.measure('myMeasure', {
  start: 'myMark',
  detail: {
    category: 'render',
    ...
  }
});
performance.getEntriesByType('measure');
-> [{ name: "myMeasure", entryType: "measure", startTime: 98, duration: 123, detail: { ... } }]
```

### Subscribing to entries

The `PerformanceObserver` API enables subscribing to different types of performance entries. The handler is called in batches.

Passing `buffered: true` would include entries produced before the `observe()` call which is useful to delay handing of measurements until after performance critical startup processing.

```js
import { PerformanceObserver } from 'react-native-performance';
const measureObserver = new PerformanceObserver((list, observer) => {
  list.getEntries().forEach((entry) => {
    console.log(`${entry.name} took ${entry.duration}ms`);
  });
});
measureObserver.observe({ type: 'measure', buffered: true });
```

### Network resources

Resource logging is disabled by default and currently will only cover `fetch`/`XMLHttpRequest` uses.

```js
import performance, {
  setResourceLoggingEnabled,
} from 'react-native-performance';

setResourceLoggingEnabled(true);

await fetch('https://domain.com');
performance.getEntriesByType('resource');
-> [{
  name: "https://domain.com",
  entryType: "resource",
  startTime: 98,
  duration: 123,
  initiatorType: "xmlhttprequest", // fetch is a polyfill on top of XHR in react-native
  fetchStart: 98,
  responseEnd: 221,
  transferSize: 456,
  ...
}]
```

### Custom metrics

If you want to collect custom metrics not based on time, this module provides an extension of the `Performance` API called `.metric()` that produces entries with the type `metric`.

```js
import performance from 'react-native-performance';

performance.metric('myMetric', 123);
performance.getEntriesByType('metric');
-> [{ name: "myMetric", entryType: "metric", startTime: 98, duration: 0, value: 123 }]
```

### Native marks

This library exposes a set of native timeline events and metrics such as native app startup time, script execution time etc under the entryType `react-native-mark`.

To install the native iOS dependency required, simply run `pod install` in `ios/` directory and rebuild the project. For android it should be enough by just rebuilding.

If you wish to _opt out_ of autolinking of the native dependency, you may create or alter the `react-native.config.js` file to look something like this:

```js
// react-native.config.js

module.exports = {
  dependencies: {
    'react-native-performance': {
      platforms: {
        android: null,
        ios: null,
      },
    },
  },
};
```

Note that the native marks are not available immediately upon creation of the JS context, so it's best to set up an observer for the relevant end event before making measurements.

```js
import performance, { PerformanceObserver } from 'react-native-performance';

new PerformanceObserver((list, observer) => {
  if (list.getEntries().find((entry) => entry.name === 'runJsBundleEnd')) {
    performance.measure('nativeLaunch', 'nativeLaunchStart', 'nativeLaunchEnd');
    performance.measure('runJsBundle', 'runJsBundleStart', 'runJsBundleEnd');
  }
}).observe({ type: 'react-native-mark', buffered: true });
```

#### Custom marks

`ephemeral` is an optional parameter to `mark/metric` functions which if set to `NO/false` will retain the entries when the React Native bridge is (re)loaded.

##### iOS

```objc
#import <react-native-performance/RNPerformance.h>

[RNPerformance.sharedInstance mark:@"myCustomMark"];
[RNPerformance.sharedInstance mark:@"myCustomMark" detail:@{ @"extra": @"info" }];
[RNPerformance.sharedInstance mark:@"myCustomMark" ephemeral:NO];

[RNPerformance.sharedInstance metric:@"myCustomMetric" value:@(123)];
[RNPerformance.sharedInstance metric:@"myCustomMetric" value:@(123) detail:@{ @"unit": @"ms" }];
[RNPerformance.sharedInstance metric:@"myCustomMetric" value:@(123) ephemeral:NO];
```

##### Android

```java
import com.oblador.performance.RNPerformance;

RNPerformance.getInstance().mark("myCustomMark");
RNPerformance.getInstance().mark("myCustomMark", false); // ephermal flag to disable resetOnReload
Bundle bundle = new Bundle();
bundle.putString("extra", "info");
RNPerformance.getInstance().mark("myCustomMark", bundle); // Bundle to pass some detail payload

RNPerformance.getInstance().metric("myCustomMetric", 123);
RNPerformance.getInstance().metric("myCustomMetric", 123, false); // ephermal flag to disable resetOnReload
Bundle bundle = new Bundle();
bundle.putString("unit", "ms");
RNPerformance.getInstance().metric("myCustomMetric", 123, bundle); // Bundle to pass some detail payload
```

#### Supported marks

| Name                                  | Platforms | Description                                                                 |
| ------------------------------------- | --------- | --------------------------------------------------------------------------- |
| `nativeLaunchStart`                   | Both      | Native process initialization started                                       |
| `nativeLaunchEnd`                     | Both      | Native process initialization ended                                         |
| `downloadStart`                       | Both      | **Only available in development.** Development bundle download started      |
| `downloadEnd`                         | Both      | **Only available in development.** Development bundle download ended        |
| `runJsBundleStart`                    | Both      | **Not available with debugger.** Parse and execution of the bundle started. |
| `runJsBundleEnd`                      | Both      | **Not available with debugger.** Parse and execution of the bundle ended    |
| `contentAppeared`                     | Both      | Initial component mounted and presented to the user.                        |
| `bridgeSetupStart`                    | Both      |                                                                             |
| `bridgeSetupEnd`                      | iOS       |                                                                             |
| `reactContextThreadStart`             | Android   |                                                                             |
| `reactContextThreadEnd`               | Android   |                                                                             |
| `vmInit`                              | Android   |                                                                             |
| `createReactContextStart`             | Android   |                                                                             |
| `processCoreReactPackageStart`        | Android   |                                                                             |
| `processCoreReactPackageEnd`          | Android   |                                                                             |
| `buildNativeModuleRegistryStart`      | Android   |                                                                             |
| `buildNativeModuleRegistryEnd`        | Android   |                                                                             |
| `createCatalystInstanceStart`         | Android   |                                                                             |
| `createCatalystInstanceEnd`           | Android   |                                                                             |
| `preRunJsBundleStart`                 | Android   |                                                                             |
| `createReactContextEnd`               | Android   |                                                                             |
| `preSetupReactContextStart`           | Android   |                                                                             |
| `preSetupReactContextEnd`             | Android   |                                                                             |
| `setupReactContextStart`              | Android   |                                                                             |
| `attachMeasuredRootViewsStart`        | Android   |                                                                             |
| `createUiManagerModuleStart`          | Android   |                                                                             |
| `createViewManagersStart`             | Android   |                                                                             |
| `createViewManagersEnd`               | Android   |                                                                             |
| `createUiManagerModuleConstantsStart` | Android   |                                                                             |
| `createUiManagerModuleConstantsEnd`   | Android   |                                                                             |
| `createUiManagerModuleEnd`            | Android   |                                                                             |
| `attachMeasuredRootViewsEnd`          | Android   |                                                                             |
| `setupReactContextEnd`                | Android   |                                                                             |

## License

MIT © Joel Arvidsson 2021 – present
