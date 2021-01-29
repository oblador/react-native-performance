import { PerformanceEntry, EntryType } from './performance-entry'

export type MarkOptions = {
  startTime?: string,
  detail?: string
}

export type MeasureOptions = {
  start?: string | number,
  end?: string | number,
  duration?: string
}

export type StartOrMeasureOptions = number | string | MeasureOptions | undefined;

export type MetricOptions = {
  startTime: number,
  detail: string,
  value: number | string
}

export type ValueOrOptions = number | string | MetricOptions;

export interface Performance {
  timeOrigin: number,
  now(): number,
  mark(markName: string, markOptions?: MarkOptions): void,
  clearMarks(name: string): void,
  measure(measureName: string, startOrMeasureOptions: StartOrMeasureOptions, endMark?: string | number): void,
  clearMeasures(name: string): void,
  metric(name: string, valueOrOptions: ValueOrOptions): void,
  clearMetrics(name: string): void,
  getEntries(): PerformanceEntry[],
  getEntriesByName(name: string, type: EntryType): PerformanceEntry[],
  getEntriesByType(type: EntryType): PerformanceEntry[],
}
