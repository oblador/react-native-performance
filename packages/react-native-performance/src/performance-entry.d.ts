export type EntryType =
  'mark' |
  'measure' |
  'resource' |
  'metric' |
  'react-native-mark';

export interface PerformanceEntry {
  name: string;
  entryType: EntryType;
  startTime: number;
  duration: number;
}

export interface PerformanceMark extends PerformanceEntry {
  entryType: 'mark';
}

export interface PerformanceMeasure extends PerformanceEntry {
  entryType: 'measure';
  detail: string;
}

export interface PerformanceReactNativeMark extends PerformanceEntry {
  entryType: 'react-native-mark';
  duration: 0;
}

export interface PerformanceMetric extends PerformanceEntry {
  entryType: 'measure';
  value: string;
  duration: 0;
}

export interface PerformanceResourceTiming extends PerformanceEntry {
  entryType: 'resource';
  initiatorType: string;
  responseEnd: string;
  fetchStart: string;
  transferSize: string;
  connectEnd: number;
  connectStart: number;
  decodedBodySize: number;
  domainLookupEnd: number;
  domainLookupStart: number;
  encodedBodySize: number;
  redirectEnd: number;
  redirectStart: number;
  requestStart: number;
  responseStart: number;
  secureConnectionStart?: number;
  serverTiming: number[];
  workerStart?: number;
  workerTiming: number[];
}
