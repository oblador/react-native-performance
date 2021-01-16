/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import performance, {
  setResourceLoggingEnabled,
  PerformanceObserver,
} from 'react-native-performance';

setResourceLoggingEnabled(true);

const formatValue = (value, unit) => {
  switch (unit) {
    case 'ms':
      return `${value.toFixed(1)}ms`;
    case 'byte':
      return `${(value / 1024 / 1024).toFixed(1)}MB`;
    default:
      value.toFixed(1);
  }
};

const Entry = ({ name, value, unit = 'ms' }) => (
  <Text style={styles.entry}>
    {name}: {formatValue(value, unit)}
  </Text>
);

const App: () => React$Node = () => {
  performance.mark('appRender');
  const didMeasureInitialLayout = React.useRef(false);
  const handleLayout = React.useCallback(() => {
    if (!didMeasureInitialLayout.current) {
      didMeasureInitialLayout.current = true;
      performance.measure('appMount', 'appRender');
    }
  }, []);

  const [metrics, setMetrics] = React.useState([]);
  const [nativeMarks, setNativeMarks] = React.useState([]);
  const [measures, setMeasures] = React.useState([]);
  const [resources, setResources] = React.useState([]);
  React.useEffect(() => {
    new PerformanceObserver((list, observer) => {
      setNativeMarks(
        performance
          .getEntriesByType('react-native-mark')
          .sort((a, b) => a.startTime - b.startTime)
      );
      if (list.getEntries().find(entry => entry.name === 'runJsBundleEnd')) {
        performance.measure(
          'nativeLaunch',
          'nativeLaunchStart',
          'nativeLaunchEnd'
        );
        performance.measure(
          'runJsBundle',
          'runJsBundleStart',
          'runJsBundleEnd'
        );
      }
    }).observe({ type: 'react-native-mark', buffered: true });

    new PerformanceObserver((list, observer) => {
      setMeasures(performance.getEntriesByType('measure'));
    }).observe({ type: 'measure', buffered: true });
    new PerformanceObserver((list, observer) => {
      setMetrics(performance.getEntriesByType('metric'));
      console.log(performance.getEntriesByType('metric'));
    }).observe({ type: 'metric', buffered: true });
    new PerformanceObserver((list, observer) => {
      setResources(performance.getEntriesByType('resource'));
    }).observe({ type: 'resource', buffered: true });
  }, []);

  React.useEffect(() => {
    fetch('https://xkcd.com/info.0.json');
  }, []);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={styles.scrollView}
      onLayout={handleLayout}
    >
      <Header />
      {global.HermesInternal == null ? null : (
        <View style={styles.engine}>
          <Text style={styles.footer}>Engine: Hermes</Text>
        </View>
      )}
      <View style={styles.body}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>performance.measure()</Text>
          {measures.map(({ name, duration, startTime }) => (
            <Entry key={startTime} name={name} value={duration} />
          ))}
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            performance.getEntriesByType('metric')
          </Text>
          {metrics.map(({ name, startTime, value }) => (
            <Entry
              key={startTime}
              name={name}
              value={value}
              unit={name === 'bundleSize' ? 'byte' : null}
            />
          ))}
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            performance.getEntriesByType('resource')
          </Text>
          {resources.map(({ name, duration, startTime }) => (
            <Entry key={startTime} name={name} value={duration} />
          ))}
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            performance.getEntriesByType('react-native-mark')
          </Text>
          {nativeMarks.map(({ name, duration, startTime }) => (
            <Entry
              key={`${name}:${startTime}`}
              name={name}
              value={startTime - performance.timeOrigin}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.black,
    fontFamily: 'Courier',
    marginTop: 20,
    marginBottom: 10,
  },
  entry: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '400',
    color: Colors.dark,
    fontFamily: 'Courier',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

export default App;
