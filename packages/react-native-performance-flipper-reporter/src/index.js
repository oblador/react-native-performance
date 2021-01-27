import { addPlugin } from 'react-native-flipper';
import performance, { PerformanceObserver } from 'react-native-performance';

const IDENTIFIER = 'flipper-plugin-performance';
const SCHEMA_VERSION = 1;

const getNativeMarkMap = () =>
  performance
    .getEntriesByType('react-native-mark')
    .reduce((acc, item) => acc.set(item.name, item), new Map());

// The bundle download trace can be very long but has no real impact on
// perf so we try to alter the marks to act as if it wasn't there
const subtractDownloadDuration = (entries, entryMap) =>
  entries.map(entry => {
    const downloadEnd = entryMap.get('downloadEnd');
    let transformed = entry.toJSON ? entry.toJSON() : { ...entry };
    if (
      downloadEnd &&
      entry.name !== 'downloadEnd' &&
      entry.startTime <= downloadEnd.startTime
    ) {
      const downloadStart = entryMap.get('downloadStart');
      transformed.startTime += downloadEnd.startTime - downloadStart.startTime;
    }
    return transformed;
  });

const calculateNativeMeasures = (newEntries, entryMap = getNativeMarkMap()) =>
  newEntries
    .filter(
      entry =>
        entry.name.endsWith('End') &&
        entry.name !== 'nativeLaunchEnd' &&
        entry.name !== 'downloadEnd'
    )
    .map(end => {
      const name = end.name.replace(/End$/, '');
      const { startTime } = entryMap.get(`${name}Start`);
      const duration = end.startTime - startTime;
      return {
        name,
        startTime,
        duration,
        category: 'Native',
      };
    });

const calculateNativeMetrics = (newEntries, entryMap = getNativeMarkMap()) =>
  newEntries
    .filter(entry => entry.name === 'nativeLaunchEnd')
    .map(end => {
      const name = end.name.replace(/End$/, '');
      const { startTime } = entryMap.get(`${name}Start`);
      const value = end.startTime - startTime;
      return {
        name,
        startTime,
        value,
        unit: 'milliseconds',
      };
    });

const calculateNativeMarks = (newEntries, entryMap = getNativeMarkMap()) =>
  newEntries
    .filter(entry => !isMeasureMark(entry))
    .map(entry => ({
      name: entry.name,
      startTime: entry.startTime,
    }));

const isMeasureMark = entry =>
  entry.name.endsWith('End') || entry.name.endsWith('Start');

const getResourceName = url => {
  const [urlSansQuery] = url.split('?');
  return urlSansQuery.replace(/^https?:\/\//i, '');
};

export function setupDefaultFlipperReporter() {
  let observers = [];
  const sessionStartedAt = Date.now();

  const addObserver = (callback, options) => {
    const observer = new PerformanceObserver(callback);
    observer.observe(options);
    observers.push(observer);
  };

  addPlugin({
    getId() {
      return IDENTIFIER;
    },
    onConnect(connection) {
      connection.send('setSession', {
        schemaVersion: SCHEMA_VERSION,
        sessionStartedAt,
      });

      const appendMeasures = measures => {
        connection.send('appendMeasures', {
          schemaVersion: SCHEMA_VERSION,
          measures,
        });
      };

      const appendMarks = marks => {
        connection.send('appendMarks', {
          schemaVersion: SCHEMA_VERSION,
          marks,
        });
      };

      const setMetrics = metrics => {
        connection.send('setMetrics', {
          schemaVersion: SCHEMA_VERSION,
          metrics,
        });
      };

      addObserver(
        list => {
          const entryMap = getNativeMarkMap();
          const entries = subtractDownloadDuration(list.getEntries(), entryMap);
          const measures = calculateNativeMeasures(entries, entryMap);
          if (measures.length !== 0) {
            appendMeasures(measures);
          }
          const marks = calculateNativeMarks(entries, entryMap);
          if (marks.length !== 0) {
            appendMarks(marks);
          }
          const metrics = calculateNativeMetrics(entries, entryMap);
          if (metrics.length !== 0) {
            setMetrics(metrics);
          }
        },
        {
          type: 'react-native-mark',
          buffered: true,
        }
      );
      addObserver(
        list => {
          appendMeasures(
            list.getEntries().map(entry => ({
              name: getResourceName(entry.name),
              startTime: entry.startTime,
              duration: entry.duration,
              category: 'Network',
            }))
          );
        },
        {
          type: 'resource',
          buffered: true,
        }
      );
      addObserver(
        list => {
          appendMeasures(
            list.getEntries().map(entry => ({
              name: entry.name,
              startTime: entry.startTime,
              duration: entry.duration,
              category: 'App',
            }))
          );
        },
        {
          type: 'measure',
          buffered: true,
        }
      );
      addObserver(
        list => {
          setMetrics(
            list.getEntries().map(entry => ({
              name: entry.name,
              startTime: entry.startTime,
              value: entry.value,
              unit: entry.name === 'bundleSize' ? 'bytes' : undefined,
            }))
          );
        },
        {
          type: 'metric',
          buffered: true,
        }
      );
    },
    onDisconnect() {
      observers.forEach(observer => observer.disconnect());
      observers = [];
    },
  });
}
