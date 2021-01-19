export interface PerformanceEntry {
  name: string;
  entryType: string;
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
  initiatorType: string;
  responseEnd: string;
  fetchStart: string;
  transferSize: string;
  connectEnd: 0;
  connectStart: 0;
  decodedBodySize: 0;
  domainLookupEnd: 0;
  domainLookupStart: 0;
  encodedBodySize: 0;
  redirectEnd: 0;
  redirectStart: 0;
  requestStart: 0;
  responseStart: 0;
  secureConnectionStart: 0;
  serverTiming: [];
  transferSize: 0;
  workerStart: 0;
  workerTiming: [];
}
