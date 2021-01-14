export class PerformanceEntry {
  constructor(name, entryType, startTime, duration) {
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
  constructor(markName, markOptions = {}) {
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

export class PerformanceMeasure extends PerformanceEntry {
  constructor(measureName, measureOptions = {}) {
    super(
      measureName,
      'measure',
      measureOptions.start,
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
  constructor({
    name,
    startTime,
    duration,
    initiatorType,
    responseEnd,
    transferSize,
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
      transferSize: this.transferSize,
      workerStart: this.workerStart,
      workerTiming: this.workerTiming,
    };
  }
}
