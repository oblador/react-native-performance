import { PerformanceEntry } from './performance-entry'

export type EntryType =
  'mark' |
  'measure' |
  'resource' |
  'metric' |
  'react-native-mark';


export type ObserveOptions = {
  entryTypes?: EntryType[];
} | {
  type?: EntryType;
  buffered?: boolean;
};

export interface PerformanceObserverEntryList {
  getEntries(): PerformanceEntry[];
  getEntriesByType(type: EntryType): PerformanceEntry[];
  getEntriesByName(name: string, type: EntryType): PerformanceEntry[];
}

export declare class PerformanceObserver {
  constructor(callback: (list: PerformanceEntry[], observer: PerformanceObserver) => void)
  observe(options: ObserveOptions): void;
  disconnect(): void;
}
