type MarkOptions = {
  startTime: number;
  detail?: string;
}

type MetricOptions = {
  startTime: number;
  value: string | number;
  detail?: string;
}

type MeasureOptions = {
  startTime: number;
  detail: string;
  duration?: number;
}

type TimingOptions = {
  initiatorType?: string;
  responseEnd?: number;
  fetchStart?: number;
  transferSize?: number;
  connectEnd?: number;
  connectStart?: number;
  decodedBodySize?: number;
  domainLookupEnd?: number;
  domainLookupStart?: number;
  encodedBodySize?: number;
  redirectEnd?: number;
  redirectStart?: number;
  requestStart?: number;
  responseStart?: number;
  secureConnectionStart?: number;
  serverTiming?: number[];
  workerStart?: number;
  workerTiming?: number[];
}

export type EntryType =
  'mark' |
  'measure' |
  'resource' |
  'metric' |
  'react-native-mark';

export class PerformanceEntry {
  name: string;
  entryType: EntryType;
  startTime: number;
  duration: number;

  constructor(name: string, entryType: EntryType, startTime: number, duration: number) {
    this.name = name;
    this.entryType = entryType;
    this.startTime = startTime;
    this.duration = duration;
  }

  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
    };
  }
}

export class PerformanceMark extends PerformanceEntry {
  detail?: string;

  constructor(markName: string, markOptions: MarkOptions) {
    super(markName, 'mark', markOptions.startTime, 0);
    this.detail = markOptions.detail;
  }

  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail,
    };
  }
}

export class PerformanceReactNativeMark extends PerformanceEntry {
  constructor(name: string, startTime: number) {
    super(name, 'react-native-mark', startTime, 0);
  }
}

export class PerformanceMetric extends PerformanceEntry {
  value: string | number;
  detail?: string;

  constructor(name: string, metricOptions: MetricOptions) {
    super(name, 'metric', metricOptions.startTime, 0);
    this.value = metricOptions.value;
    this.detail = metricOptions.detail;
  }

  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      value: this.value,
    };
  }
}

export class PerformanceMeasure extends PerformanceEntry {
  detail?: string;

  constructor(measureName: string, measureOptions: MeasureOptions) {
    super(
      measureName,
      'measure',
      measureOptions.startTime,
      measureOptions.duration
    );
    this.detail = measureOptions.detail;
  }

  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail,
    };
  }
}

export class PerformanceResourceTiming extends PerformanceEntry {
  initiatorType: string;
  responseEnd: number;
  fetchStart: number;
  transferSize: number;
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

  constructor({
    name,
    startTime,
    duration,
    ...params
  }: { 
    name: string;
    startTime: number;
    duration: number
  } & TimingOptions) {
    super(name, 'resource', startTime, duration);
    this.initiatorType = params.initiatorType;
    this.fetchStart = startTime;
    this.responseEnd = params.responseEnd;
    this.transferSize = params.transferSize;
    this.connectEnd = params.connectEnd;
    this.connectStart = params.connectStart;
    this.decodedBodySize = params.decodedBodySize;
    this.domainLookupEnd = params.domainLookupEnd;
    this.domainLookupStart = params.domainLookupStart;
    this.encodedBodySize = params.encodedBodySize;
    this.redirectEnd = params.redirectEnd;
    this.redirectStart = params.redirectStart;
    this.requestStart = params.requestStart;
    this.responseStart = params.responseStart;
    this.secureConnectionStart = params.secureConnectionStart;
    this.serverTiming = params.serverTiming;
    this.workerStart = params.workerStart;
    this.workerTiming = params.workerTiming;
  }

  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      initiatorType: this.initiatorType,
      fetchStart: this.fetchStart,
      responseEnd: this.responseEnd,
      transferSize: this.transferSize,
      connectEnd: this.connectEnd,
      connectStart: this.connectStart,
      decodedBodySize: this.decodedBodySize,
      domainLookupEnd: this.domainLookupEnd,
      domainLookupStart: this.domainLookupStart,
      encodedBodySize: this.encodedBodySize,
      redirectEnd: this.redirectEnd,
      redirectStart: this.redirectStart,
      requestStart: this.requestStart,
      responseStart: this.responseStart,
      secureConnectionStart: this.secureConnectionStart,
      serverTiming: this.serverTiming,
      workerStart: this.workerStart,
      workerTiming: this.workerTiming,
    };
  }
}
