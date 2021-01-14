import { NativeModules, NativeEventEmitter } from 'react-native';
import { createPerformance } from './performance';
import { installResourceLogger } from './resource';
import { PerformanceMark } from './performance-entry';

const {
  PerformanceObserver,
  addEntry,
  setTiming,
  performance,
} = createPerformance();

const emitter = new NativeEventEmitter(NativeModules.RNPerformanceManager);

emitter.addListener('timing', data => {
  setTiming(data.name, data.startTime);
});

emitter.addListener('mark', data => {
  performance.mark(data.name, { startTime: data.startTime });
});

export default performance;

export const setResourceLoggingEnabled = (enabled = true) => {
  if (enabled) {
    installResourceLogger(globalThis, performance, addEntry);
  } else {
    uninstallResourceLogger(globalThis);
  }
};

export { PerformanceObserver };
