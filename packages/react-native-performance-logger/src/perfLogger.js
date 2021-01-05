const getCurrentTimestamp = () => {
  const date = new Date();
  return date.getTime();
}

export class PerformanceLogger {
  _groupedTimespans = {}

  _groupedPoints = {}

  _outputs = []

  _metrics = []

  addMetric(metric) {
    this._metrics.push(metric);

    this._outputs.forEach((output) => {
      output.addMetric(metric);
    });
  }

  markPoint(event) {
    const group = event.group || '';
    const key = event.key;
    const extra = event.extra;
    const timeStamp = getCurrentTimestamp();
    if (this._groupedPoints[group] === undefined) this._groupedPoints[group] = {};
    if (this._groupedPoints[group][key]) {
      // It is already logged!
      return;
    }
    this._groupedPoints[group][key] = {
      time: timeStamp,
      extra,
    };

    const pointArgs = {
      key,
      group,
      time: timeStamp,
      extra,
    };
    this._outputs.forEach((output) => {
      output.addPoint(pointArgs);
    });
  }

  startTimespan(timespanEvent) {
    const group = timespanEvent.group || '';
    const key = timespanEvent.key;
    const timeStamp = timespanEvent.timestamp || getCurrentTimestamp();
   
    if (this._groupedTimespans[group] === undefined) this._groupedTimespans[group] = {};
    if (this._groupedTimespans[group][key]) {
      // It is already logged!
      return;
    }
    this._groupedTimespans[group][key] = {
      timespan: { startTime: timeStamp },
      extra: timespanEvent.extra,
    };
  }

  stopTimespan(timespanEvent) {
    const group = timespanEvent.group || '';
    const key = timespanEvent.key;
    const timeStamp = timespanEvent.timestamp || getCurrentTimestamp();
    const log = this._groupedTimespans[group][key];
    if (!log || log.timespan.startTime == null) {
      // Start of the event doesn't exist!
      return;
    }
    if (log.timespan.stopTime != null) {
      // Stop of the event already logged!
      return;
    }
    const timespan = log.timespan;
    timespan.stopTime = timeStamp;
    timespan.duration = timespan.stopTime - (timespan.startTime || 0);
    const duration = timeStamp - timespan.startTime;
    
    const timeStampArgs = {
      key,
      group,
      startTime: timespan.startTime,
      stopTime: timespan.stopTime,
      duration,
      extra: log.extra,
    };
    this._outputs.forEach((output) => {
      output.addTimespan(timeStampArgs);
    });
  }

  getTimespans() {
    return this._groupedTimespans;
  }

  hasTimespan(group, key) {
    if (this._groupedTimespans[group] === undefined) return false;
    return !!this._groupedTimespans[group][key];
  }

  getMetrics() {
    return this._metrics;
  }

  getPoints() {
    return this._groupedPoints;
  }

  hasPoint(group, key) {
    if (this._groupedPoints[group] === undefined) return false;
    return !!this._groupedPoints[group][key];
  }

  addOutputs(outputs) {
    this._outputs.push(...outputs);
  }

  clear() {
    this._groupedTimespans = {};
    this._groupedPoints = {};
    this._metrics = [];
  }

  clearOutputs() {
    this._outputs = [];
  }

  clearCompleted() {
    for (const group in this._groupedTimespans) {
      for (const key in this._groupedTimespans[group]) {
        if (this._groupedTimespans[group][key]?.timespan.duration != null) {
          delete this._groupedTimespans[group][key];
        }
      }
    }
    this._groupedPoints = {};
    this._metrics = [];
  }
}
