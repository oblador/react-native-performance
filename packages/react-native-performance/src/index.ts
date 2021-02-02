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

const { RNPerformanceManager } = NativeModules;
const { PerformanceObserver, addEntry, performance } = createPerformance();

if (Platform.OS === 'android' || RNPerformanceManager) {
  const emitter = new NativeEventEmitter(RNPerformanceManager);

  emitter.addListener('mark', data => {
    addEntry(new PerformanceReactNativeMark(data.name, data.startTime));
  });

  emitter.addListener('metric', data => {
    addEntry(
      new PerformanceMetric(data.name, {
        startTime: data.startTime,
        value: data.value,
      })
    );
  });
}

export default performance;

export const setResourceLoggingEnabled = (enabled = true) => {
  if (enabled) {
    //@ts-ignore
    installResourceLogger(globalThis, performance, addEntry);
  } else {
    uninstallResourceLogger(globalThis);
  }
};

export { PerformanceObserver };
