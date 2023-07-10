import { createEventEmitter } from './event-emitter';
import { createPerformanceObserver } from './performance-observer';
import {
  EntryType,
  PerformanceMark,
  PerformanceMeasure,
  PerformanceMetric,
  PerformanceEntry,
  PerformanceReactNativeMark,
  PerformanceResourceTiming,
} from './performance-entry';

// @ts-ignore
export const defaultNow: () => number = global.performance.now.bind(
  // @ts-ignore
  global.performance
);

export type MarkOptions = {
  startTime?: number;
  detail?: any;
};

export type MeasureOptions = {
  start?: string | number;
  end?: string | number;
  duration?: number;
  detail?: any;
};

export type StartOrMeasureOptions = string | MeasureOptions | undefined;

export type MetricOptions = {
  startTime: number;
  detail: any;
  value: number | string;
};

export type ValueOrOptions = number | string | MetricOptions;

export const createPerformance = (now: () => number = defaultNow) => {
  const timeOrigin = now();
  const { addEventListener, removeEventListener, emit } =
    createEventEmitter<PerformanceEntry>();
  const marks = new Map<string, number>();
  let entries: PerformanceEntry[] = [];

  function addEntry<T extends PerformanceEntry>(entry: T): T {
    entries.push(entry);
    if (entry.entryType === 'mark' || entry.entryType === 'react-native-mark') {
      marks.set(entry.name, entry.startTime);
    }
    emit(entry);
    return entry;
  }

  const removeEntries = (type: EntryType, name?: string) => {
    entries = entries.filter((entry) => {
      if (entry.entryType === type && (!name || entry.name === name)) {
        marks.delete(entry.name);
        return false;
      }
      return true;
    });
  };

  const mark = (markName: string, markOptions: MarkOptions = {}) =>
    addEntry(
      new PerformanceMark(markName, {
        startTime:
          'startTime' in markOptions && markOptions.startTime !== undefined
            ? markOptions.startTime
            : now(),
        detail: markOptions.detail,
      })
    );

  const clearMarks = (name?: string) => removeEntries('mark', name);

  const clearMeasures = (name?: string) => removeEntries('measure', name);

  const clearMetrics = (name?: string) => removeEntries('metric', name);

  const convertMarkToTimestamp = (markOrTimestamp: string | number) => {
    switch (typeof markOrTimestamp) {
      case 'string': {
        if (!marks.has(markOrTimestamp)) {
          throw new Error(
            `Failed to execute 'measure' on 'Performance': The mark '${markOrTimestamp}' does not exist.`
          );
        }
        return marks.get(markOrTimestamp);
      }
      case 'number': {
        return markOrTimestamp;
      }
      default:
        throw new TypeError(
          `Failed to execute 'measure' on 'Performance': Expected mark name or timestamp, got '${markOrTimestamp}'.`
        );
    }
  };

  const measure = (
    measureName: string,
    startOrMeasureOptions?: StartOrMeasureOptions,
    endMark?: string | number
  ) => {
    let start = 0;
    let end = 0;
    let detail: any;

    if (
      startOrMeasureOptions &&
      typeof startOrMeasureOptions === 'object' &&
      startOrMeasureOptions.constructor == Object
    ) {
      if (endMark) {
        throw new TypeError(
          `Failed to execute 'measure' on 'Performance': The measureOptions and endMark arguments may not be combined.`
        );
      }
      if (!startOrMeasureOptions.start && !startOrMeasureOptions.end) {
        throw new TypeError(
          `Failed to execute 'measure' on 'Performance': At least one of the start and end option must be passed.`
        );
      }
      if (
        startOrMeasureOptions.start &&
        startOrMeasureOptions.end &&
        startOrMeasureOptions.duration
      ) {
        throw new TypeError(
          `Failed to execute 'measure' on 'Performance': Cannot send start, end and duration options together.`
        );
      }

      detail = startOrMeasureOptions.detail;

      if (startOrMeasureOptions && startOrMeasureOptions.end) {
        end = convertMarkToTimestamp(startOrMeasureOptions.end);
      } else if (
        startOrMeasureOptions &&
        startOrMeasureOptions.start &&
        startOrMeasureOptions.duration
      ) {
        end =
          convertMarkToTimestamp(startOrMeasureOptions.start) +
          convertMarkToTimestamp(startOrMeasureOptions.duration);
      } else {
        end = now();
      }

      if (startOrMeasureOptions && startOrMeasureOptions.start) {
        start = convertMarkToTimestamp(startOrMeasureOptions.start);
      } else if (
        startOrMeasureOptions &&
        startOrMeasureOptions.end &&
        startOrMeasureOptions.duration
      ) {
        start =
          convertMarkToTimestamp(startOrMeasureOptions.end) -
          convertMarkToTimestamp(startOrMeasureOptions.duration);
      } else {
        start = timeOrigin;
      }
    } else {
      if (endMark) {
        end = convertMarkToTimestamp(endMark);
      } else {
        end = now();
      }

      if (typeof startOrMeasureOptions === 'string') {
        start = convertMarkToTimestamp(startOrMeasureOptions);
      } else {
        start = timeOrigin;
      }
    }

    return addEntry(
      new PerformanceMeasure(measureName, {
        detail,
        startTime: start,
        duration: end - start,
      })
    );
  };

  const metric = (name: string, valueOrOptions: ValueOrOptions) => {
    let value: string | number;
    let startTime: number | undefined;
    let detail: any;

    if (
      typeof valueOrOptions === 'object' &&
      valueOrOptions.constructor == Object
    ) {
      if (!valueOrOptions.value) {
        throw new TypeError(
          `Failed to execute 'metric' on 'Performance': The value option must be passed.`
        );
      }
      value = valueOrOptions.value;
      startTime = valueOrOptions.startTime;
      detail = valueOrOptions.detail;
    } else if (
      typeof valueOrOptions === 'undefined' ||
      valueOrOptions === null
    ) {
      throw new TypeError(
        `Failed to execute 'metric' on 'Performance': The value option must be passed.`
      );
    } else {
      value = valueOrOptions as string | number;
    }

    return addEntry(
      new PerformanceMetric(name, {
        startTime: startTime ? startTime : now(),
        value,
        detail,
      })
    );
  };

  const getEntries = () => entries.slice(0);

  const getEntriesByName = (name: string, type?: EntryType) =>
    entries.filter(
      (entry) => entry.name === name && (!type || entry.entryType === type)
    );

  function getEntriesByType(type: 'measure'): PerformanceMeasure[];
  function getEntriesByType(type: 'mark'): PerformanceMark[];
  function getEntriesByType(type: 'resource'): PerformanceResourceTiming[];
  function getEntriesByType(type: 'metric'): PerformanceMetric[];
  function getEntriesByType(
    type: 'react-native-mark'
  ): PerformanceReactNativeMark[];
  function getEntriesByType(type: EntryType) {
    return entries.filter((entry) => entry.entryType === type);
  }

  const PerformanceObserver = createPerformanceObserver({
    addEventListener,
    removeEventListener,
    getEntriesByType,
  });

  return {
    PerformanceObserver,
    addEntry,
    performance: {
      timeOrigin,
      now,
      mark,
      clearMarks,
      measure,
      clearMeasures,
      metric,
      clearMetrics,
      getEntries,
      getEntriesByName,
      getEntriesByType,
    },
  };
};

export type Performance = ReturnType<typeof createPerformance>['performance'];
