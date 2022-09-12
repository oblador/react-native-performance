import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import { createPerformance } from './performance';
import {
  PerformanceReactNativeMark,
  PerformanceMetric,
} from './performance-entry';
import {
  installResourceLogger,
  uninstallResourceLogger,
} from './resource-logger';
const { PerformanceObserver, addEntry, performance } = createPerformance();

declare const global: { __turboModuleProxy: null | {} };

const isTurboModuleEnabled = global.__turboModuleProxy != null;

const RNPerformanceManager = isTurboModuleEnabled
  ? require('./NativeRNPerformanceManager').default
  : NativeModules.RNPerformanceManager;

if (Platform.OS === 'android' || RNPerformanceManager) {
  const emitter = new NativeEventEmitter(RNPerformanceManager);

  emitter.addListener('mark', (data) => {
    addEntry(
      new PerformanceReactNativeMark(data.name, data.startTime, data.detail)
    );
  });

  emitter.addListener('metric', (data) => {
    addEntry(
      new PerformanceMetric(data.name, {
        startTime: data.startTime,
        value: data.value,
        detail: data.detail,
      })
    );
  });
}

export default performance;
export type Performance = typeof performance;

export const setResourceLoggingEnabled = (enabled = true) => {
  if (enabled) {
    //@ts-ignore
    installResourceLogger(globalThis, performance, addEntry);
  } else {
    uninstallResourceLogger(globalThis);
  }
};

export { PerformanceObserver };
export type {
  EntryType,
  PerformanceMark,
  PerformanceMeasure,
  PerformanceMetric,
  PerformanceEntry,
  PerformanceReactNativeMark,
  PerformanceResourceTiming,
} from './performance-entry';
