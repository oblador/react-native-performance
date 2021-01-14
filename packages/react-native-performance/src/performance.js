import { createEventEmitter } from './event-emitter';
import { createPerformanceObserver } from './performance-observer';
import { PerformanceMark, PerformanceMeasure } from './performance-entry';

export const now = () => global.nativePerformanceNow();

export const createPerformance = () => {
  const { addEventListener, removeEventListener, emit } = createEventEmitter();

  const marks = new Map();
  const timing = {};
  let entries = [];

  function setTiming(name, startTime) {
    timing[name] = startTime;
    marks.set(name, startTime);
  }

  setTiming('performanceStart', now());

  function addEntry(entry) {
    entries.push(entry);
    if (entry.entryType === 'mark') {
      marks.set(entry.name, entry.startTime);
    }
    emit(entry);
  }

  const removeEntries = (type, name) => {
    entries = entries.filter(entry => {
      if (entry.entryType === type && (!name || entry.name === name)) {
        marks.delete(entry.name);
        return false;
      }
      return true;
    });
  };

  const mark = name => addEntry(new PerformanceMark(name, now()));

  const annotate = (name, data = {}) => {
    if (!marks.has(name)) {
      throw new Error(
        `Failed to execute 'annotate' on 'Performance': The entry '${name}' does not exist.`
      );
    }
    const entry = marks.get(name);
    entry.annotate(data);
  };

  const clearMarks = name => removeEntries('mark', name);

  const clearMeasures = name => removeEntries('measure', name);

  const measure = (name, startMark, endMark) => {
    let startTime = 0;
    let endTime = 0;

    if (!startMark) {
      startTime = timing.performanceStart;
    } else if (marks.has(startMark)) {
      startTime = marks.get(startMark);
    } else {
      throw new Error(
        `Failed to execute 'measure' on 'Performance': The mark '${startMark}' does not exist.`
      );
    }

    if (!endMark) {
      endTime = now();
    } else if (marks.has(endMark)) {
      endTime = marks.get(endMark);
    } else {
      throw new Error(
        `Failed to execute 'measure' on 'Performance': The mark '${endMark}' does not exist.`
      );
    }

    addEntry(new PerformanceMeasure(name, startTime, endTime - startTime));
  };

  const getEntries = () => entries.slice(0);

  const getEntriesByName = (name, type) =>
    entries.filter(
      entry => entry.name === name && (!type || entry.entryType === type)
    );

  const getEntriesByType = type =>
    entries.filter(entry => entry.entryType === type);

  const PerformanceObserver = createPerformanceObserver({
    addEventListener,
    removeEventListener,
    getEntriesByType,
  });

  return {
    PerformanceObserver,
    addEntry,
    setTiming,
    performance: {
      timing,
      now,
      mark,
      clearMarks,
      measure,
      annotate,
      clearMeasures,
      getEntries,
      getEntriesByName,
      getEntriesByType,
    },
  };
};
