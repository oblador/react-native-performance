export class PerformanceEntry {
  constructor(name, entryType, startTime, duration) {
    this.name = name;
    this.entryType = entryType;
    this.startTime = startTime;
    this.duration = duration;
    this.annotations = {};
  }

  annotate(data) {
    this.annotations = { ...this.annotations, ...data };
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
  constructor(name, startTime) {
    super(name, 'mark', startTime, 0);
  }
}

export class PerformanceMeasure extends PerformanceEntry {
  constructor(name, startTime, duration) {
    super(name, 'measure', startTime, duration);
  }
}
