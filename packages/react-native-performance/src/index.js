import { NativeModules, NativeEventEmitter } from 'react-native';
import { createPerformance } from './performance';
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
  addEntry(new PerformanceMark(data.name, data.startTime));
});

export default performance;

export { PerformanceObserver };
