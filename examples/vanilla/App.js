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

const Entry = ({ name, value }) => (
  <Text style={styles.entry}>
    {name}: {value.toFixed(1)}ms
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

  const [timings, setTimings] = React.useState([]);
  const [measures, setMeasures] = React.useState([]);
  const [resources, setResources] = React.useState([]);
  React.useEffect(() => {
    new PerformanceObserver((list, observer) => {
      if (list.getEntries().find(entry => entry.name === 'contentAppear')) {
        observer.disconnect();
        setTimings(
          Object.entries(performance.timing).sort((a, b) => a[1] - b[1])
        );
      }
    }).observe({ type: 'mark', buffered: true });

    new PerformanceObserver((list, observer) => {
      setMeasures(performance.getEntriesByType('measure'));
    }).observe({ type: 'measure', buffered: true });
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
          <Text style={styles.sectionTitle}>performance.timing</Text>
          {timings.map(([name, startTime]) => (
            <Entry
              key={name}
              name={name}
              value={startTime - performance.timeOrigin}
            />
          ))}
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>performance.measure()</Text>
          {measures.map(({ name, duration, startTime }) => (
            <Entry key={startTime} name={name} value={duration} />
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
