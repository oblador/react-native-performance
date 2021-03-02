/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { Profiler, ProfilerOnRenderCallback } from 'react';
import { StyleSheet, ScrollView, View, Text } from 'react-native';

import { Header, Colors } from 'react-native/Libraries/NewAppScreen';

import performance, {
  setResourceLoggingEnabled,
  PerformanceObserver,
} from 'react-native-performance';
import type {
  PerformanceMetric,
  PerformanceResourceTiming,
  PerformanceReactNativeMark,
} from 'react-native-performance';

declare const global: { HermesInternal: null | {} };

setResourceLoggingEnabled(true);

const traceRender: ProfilerOnRenderCallback = (
  id, // the "id" prop of the Profiler tree that has just committed
  phase, // either "mount" (if the tree just mounted) or "update" (if it re-rendered)
  actualDuration, // time spent rendering the committed update
  baseDuration, // estimated time to render the entire subtree without memoization
  startTime, // when React began rendering this update
  commitTime, // when React committed this update
  interactions // the Set of interactions belonging to this update
) =>
  performance.measure(id, {
    start: performance.timeOrigin + startTime,
    duration: actualDuration,
  });

const formatValue = (value: number, unit?: string) => {
  switch (unit) {
    case 'ms':
      return `${value.toFixed(1)}ms`;
    case 'byte':
      return `${(value / 1024 / 1024).toFixed(1)}MB`;
    default:
      return value.toFixed(1);
  }
};

const Entry = ({
  name,
  value,
  unit = 'ms',
}: {
  name: string;
  value: number;
  unit?: string;
}) => (
  <Text style={styles.entry}>
    {name}: {formatValue(value, unit)}
  </Text>
);

const App = () => {
  const [metrics, setMetrics] = React.useState<PerformanceMetric[]>([]);
  const [nativeMarks, setNativeMarks] = React.useState<
    PerformanceReactNativeMark[]
  >([]);
  const [resources, setResources] = React.useState<PerformanceResourceTiming[]>(
    []
  );
  React.useEffect(() => {
    new PerformanceObserver(() => {
      setNativeMarks(
        performance
          .getEntriesByType('react-native-mark')
          .sort(
            (a: PerformanceReactNativeMark, b: PerformanceReactNativeMark) =>
              a.startTime - b.startTime
          )
      );
    }).observe({ type: 'react-native-mark', buffered: true });

    new PerformanceObserver(() => {
      setMetrics(performance.getEntriesByType('metric'));
    }).observe({ type: 'metric', buffered: true });
    new PerformanceObserver(() => {
      setResources(performance.getEntriesByType('resource'));
    }).observe({ type: 'resource', buffered: true });
  }, []);

  React.useEffect(() => {
    // @ts-ignore
    fetch('https://xkcd.com/info.0.json', { cache: 'no-cache' });
  }, []);

  return (
    <Profiler id="App.render()" onRender={traceRender}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.scrollView}
      >
        <Header />
        {global.HermesInternal == null ? null : (
          <View style={styles.engine}>
            <Text style={styles.footer}>Engine: Hermes</Text>
          </View>
        )}
        <View style={styles.body}>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>
              performance.getEntriesByType('metric')
            </Text>
            {metrics.map(({ name, startTime, value }) => (
              <Entry
                key={startTime}
                name={name}
                value={value as number}
                unit={name === 'bundleSize' ? 'byte' : undefined}
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
            {nativeMarks.map(({ name, startTime }) => (
              <Entry
                key={`${name}:${startTime}`}
                name={name}
                value={startTime - performance.timeOrigin}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </Profiler>
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
