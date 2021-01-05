export type Point = {
    key: string,
    group: string,
    extra?: string
}

export type Metric = {
    key: string,
    value: string
}

type Timespan = {
    startTime: number,
    stopTime?: number,
    duration?: number
}

export type GroupedTimeSpan = {
    [key: string]: {
        timespan: Timespan,
        extra?: string
    }
}

export type StartTimespan = {
    key: string,
    timestamp?: number,
    group?: string,
    extra?: string
}

export type StopTimespan = {
    key: string,
    timestamp?: number,
    group?: string
}

export type TimespanArgs = {
    key: string,
    startTime: number,
    stopTime: number,
    duration: number,
    group: string,
    extra?: string
}

export type PointArgs = {
    key: string,
    time: number,
    group: string,
    extra?: string
}

export type MetricArgs = {
    key: string,
    value: string
}

export declare class PerformanceLogger {
    constructor();

    markPoint(point: Point): void;
    addMetric(metric: Metric): void;
    startTimespan(timespanEvent: StartTimespan): void;
    stopTimespan(timespanEvent: StopTimespan): void;
    addOutputs(outputs: Output[]): void;
    clear(): void;
    clearCompleted(): void;
    getTimespans(): { [group: string]: GroupedTimeSpan };
    hasTimespan(group: string, key: string): boolean;
    getMetrics(): Metric[];
    getPoints(): { [group: string]: Point };
    hasPoint(group: string, key: string): boolean;
}

export interface Output {
    addTimespan(args: TimespanArgs): void,
    addPoint(args: PointArgs): void,
    addMetric(metric: MetricArgs): void
}
