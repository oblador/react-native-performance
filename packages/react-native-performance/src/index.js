import { NativeModules, NativeEventEmitter } from 'react-native';
import { createPerformance } from './performance';
import { installResourceLogger } from './resource';
import { PerformanceReactNativeMark } from './performance-entry';

const { PerformanceObserver, addEntry, performance } = createPerformance();

const emitter = new NativeEventEmitter(NativeModules.RNPerformanceManager);

console.log('emitter.addListener');
emitter.addListener('mark', data => {
  addEntry(new PerformanceReactNativeMark(data.name, data.startTime));
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
