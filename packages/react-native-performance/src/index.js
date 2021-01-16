import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import { createPerformance } from './performance';
import { installResourceLogger } from './resource';
import { PerformanceReactNativeMark } from './performance-entry';
const { RNPerformanceManager } = NativeModules;

const { PerformanceObserver, addEntry, performance } = createPerformance();

if (Platform.OS === 'android' || RNPerformanceManager) {
  const emitter = new NativeEventEmitter(RNPerformanceManager);

  emitter.addListener('mark', data => {
    addEntry(new PerformanceReactNativeMark(data.name, data.startTime));
  });
}

export default performance;

export const setResourceLoggingEnabled = (enabled = true) => {
  if (enabled) {
    installResourceLogger(globalThis, performance, addEntry);
  } else {
    uninstallResourceLogger(globalThis);
  }
};

export { PerformanceObserver };
