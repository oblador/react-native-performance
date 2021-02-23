import type { EntryType, PerformanceEntry } from './performance-entry';

type ObserveOptionType1 = {
  entryTypes: EntryType[];
};

type ObserveOptionType2 = {
  type: EntryType;
  buffered?: boolean;
};

export class PerformanceObserverEntryList {
  entries: PerformanceEntry[];

  constructor(entries: PerformanceEntry[]) {
    this.entries = entries;
  }

  getEntries() {
    return this.entries.slice(0);
  }

  getEntriesByType(type: EntryType) {
    return this.entries.filter((entry) => entry.entryType === type);
  }

  getEntriesByName(name: string, type?: EntryType) {
    return this.entries.filter(
      (entry) => entry.name === name && (!type || entry.entryType === type)
    );
  }
}

const SUPPORTED_ENTRY_TYPES = [
  'mark',
  'measure',
  'metric',
  'react-native-mark',
  'resource',
];

const sortByStartTime = (a, b) => a.startTime - b.startTime;

const OBSERVER_TYPE_SINGLE = 'single';
const OBSERVER_TYPE_MULTIPLE = 'multiple';

export const createPerformanceObserver = ({
  addEventListener,
  removeEventListener,
  getEntriesByType,
}) =>
  class PerformanceObserver {
    callback: (
      list: PerformanceObserverEntryList,
      observer: PerformanceObserver
    ) => void;
    buffer: PerformanceEntry[];
    entryTypes: Set<EntryType>;
    timer?: number;
    observerType:
      | null
      | typeof OBSERVER_TYPE_SINGLE
      | typeof OBSERVER_TYPE_MULTIPLE;

    static supportedEntryTypes = SUPPORTED_ENTRY_TYPES;

    constructor(
      callback: (
        list: PerformanceObserverEntryList,
        observer: PerformanceObserver
      ) => void
    ) {
      this.callback = callback;
      this.buffer = [];
      this.timer = null;
      this.entryTypes = new Set();
      this.observerType = null;
    }

    emitRecords = () => {
      this.callback(new PerformanceObserverEntryList(this.takeRecords()), this);
    };

    scheduleEmission() {
      if (this.timer === null) {
        this.timer = requestAnimationFrame(() => {
          this.timer = null;
          this.emitRecords();
        });
      }
    }

    receiveRecord = (entry: PerformanceEntry) => {
      if (this.entryTypes.has(entry.entryType)) {
        this.buffer.push(entry);
        this.scheduleEmission();
      }
    };

    observe(options: ObserveOptionType1): void;
    observe(options: ObserveOptionType2): void;

    observe(options: any) {
      if (!options || (!options.entryTypes && !options.type)) {
        throw new TypeError(
          "Failed to execute 'observe' on 'PerformanceObserver': An observe() call must include either entryTypes or type arguments."
        );
      }
      if (options.entryTypes && options.type) {
        throw new TypeError(
          "Failed to execute 'observe' on 'PerformanceObserver': An observe() call must not include both entryTypes and type arguments."
        );
      }

      if (options.entryTypes) {
        if (this.observerType === OBSERVER_TYPE_SINGLE) {
          throw new Error(
            'This PerformanceObserver has performed observe({type:...}, therefore it cannot perform observe({entryTypes:...})'
          );
        }
        if (!Array.isArray(options.entryTypes)) {
          throw new TypeError('entryTypes argument must be an array');
        }
        this.observerType = OBSERVER_TYPE_MULTIPLE;
        this.entryTypes = new Set(options.entryTypes);
        this.buffer = [];
        if (options.buffered) {
          console.warn(
            'The PerformanceObserver does not support buffered flag with the entryTypes argument.'
          );
        }
      } else {
        if (this.observerType === OBSERVER_TYPE_MULTIPLE) {
          throw new Error(
            'This PerformanceObserver has performed observe({entryTypes:...}, therefore it cannot perform observe({type:...})'
          );
        }
        this.observerType = OBSERVER_TYPE_SINGLE;
        this.entryTypes.add(options.type);
        if (options.buffered) {
          this.buffer = getEntriesByType(options.type);
          this.scheduleEmission();
        }
      }

      this.entryTypes.forEach((entryType) => {
        if (!SUPPORTED_ENTRY_TYPES.includes(entryType)) {
          console.warn(
            `The entry type '${entryType}' does not exist or isn't supported.`
          );
        }
      });

      addEventListener(this.receiveRecord);
    }

    disconnect() {
      removeEventListener(this.receiveRecord);
      this.entryTypes = new Set();
      this.observerType = null;
      this.buffer = [];
      if (this.timer !== null) {
        cancelAnimationFrame(this.timer);
        this.timer = null;
      }
    }

    takeRecords() {
      const entries = this.buffer.sort(sortByStartTime);
      this.buffer = [];
      return entries;
    }
  };
