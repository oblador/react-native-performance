export class PerformanceObserverEntryList {
  constructor(entries) {
    this.entries = entries;
  }

  getEntries() {
    return this.entries.slice(0);
  }

  getEntriesByType(type) {
    return this.entries.filter(entry => entry.entryType === type);
  }

  getEntriesByName(name, type) {
    return this.entries.filter(
      entry => entry.name === name && (!type || entry.entryType === type)
    );
  }
}

const SUPPORTED_ENTRY_TYPES = [
  'mark',
  'measure',
  'resource',
  'react-native-mark',
];

export const createPerformanceObserver = ({
  addEventListener,
  removeEventListener,
  getEntriesByType,
}) =>
  class PerformanceObserver {
    constructor(callback) {
      this.callback = callback;
      this.buffer = [];
      this.timer = null;
      this.entryTypes = new Set();
    }

    emitRecords = () => {
      this.callback(this.takeRecords(), this);
    };

    receiveRecord = entry => {
      if (this.entryTypes.has(entry.entryType)) {
        this.buffer.push(entry);
        if (this.timer === null) {
          this.timer = requestAnimationFrame(() => {
            this.timer = null;
            this.emitRecords();
          });
        }
      }
    };

    observe(options) {
      if (!options || (!options.entryTypes && !options.type)) {
        throw new TypeError(
          "Failed to execute 'observe' on 'PerformanceObserver': An observe() call must include either entryTypes or type arguments."
        );
      }

      if (options.entryTypes) {
        this.entryTypes = new Set(options.entryTypes);
        this.buffer = [];
        if (options.buffered) {
          console.warn(
            'The PerformanceObserver does not support buffered flag with the entryTypes argument.'
          );
        }
      } else {
        this.entryTypes = new Set([options.type]);
        if (options.buffered) {
          this.buffer = getEntriesByType(options.type);
        }
      }

      this.entryTypes.forEach(entryType => {
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
    }

    takeRecords() {
      const entries = new PerformanceObserverEntryList(this.buffer);
      this.buffer = [];
      return entries;
    }
  };
