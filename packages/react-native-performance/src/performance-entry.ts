type MarkOptions = {
  startTime?: number;
  detail?: any;
};

type MetricOptions = {
  startTime: number;
  value: string | number;
  detail?: any;
};

type MeasureOptions = {
  startTime?: number;
  detail?: any;
  duration?: number;
};

export type EntryType =
  | 'mark'
  | 'measure'
  | 'resource'
  | 'metric'
  | 'react-native-mark';

export class PerformanceEntry {
  name: string;
  entryType: EntryType;
  startTime: number;
  duration: number;

  constructor(
    name: string,
    entryType: EntryType,
    startTime: number,
    duration: number
  ) {
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
  detail?: any;

  constructor(markName: string, markOptions: MarkOptions = {}) {
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
  detail?: any;

  constructor(name: string, startTime: number, detail: any) {
    super(name, 'react-native-mark', startTime, 0);
    this.detail = detail;
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

export class PerformanceMetric extends PerformanceEntry {
  value: string | number;
  detail?: any;

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
      detail: this.detail,
      value: this.value,
    };
  }
}

export class PerformanceMeasure extends PerformanceEntry {
  detail?: any;

  constructor(measureName: string, measureOptions: MeasureOptions = {}) {
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
  initiatorType?: string;
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
  workerStart: number;
  workerTiming: number[];

  constructor({
    name,
    startTime,
    duration,
    initiatorType,
    responseEnd,
    transferSize,
  }: {
    name?: string;
    startTime?: number;
    duration?: number;
    initiatorType?: string;
    responseEnd?: number;
    transferSize?: number;
  } = {}) {
    super(name, 'resource', startTime, duration);
    this.initiatorType = initiatorType;
    this.fetchStart = startTime;
    this.responseEnd = responseEnd;
    this.transferSize = transferSize;
    this.connectEnd = 0;
    this.connectStart = 0;
    this.decodedBodySize = 0;
    this.domainLookupEnd = 0;
    this.domainLookupStart = 0;
    this.encodedBodySize = 0;
    this.redirectEnd = 0;
    this.redirectStart = 0;
    this.requestStart = 0;
    this.responseStart = 0;
    this.secureConnectionStart = 0;
    this.serverTiming = [];
    this.transferSize = 0;
    this.workerStart = 0;
    this.workerTiming = [];
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
