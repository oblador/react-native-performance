package com.oblador.performance;

public class PerformanceMark {
    private final String mark;
    private final long timestamp;
    private final boolean resetOnLoad;

    public PerformanceMark(String mark, long timestamp) {
        this.mark = mark;
        this.timestamp = timestamp;
        this.resetOnLoad = true;
    }

    public PerformanceMark(String mark, long timestamp, boolean resetOnLoad) {
        this.mark = mark;
        this.timestamp = timestamp;
        this.resetOnLoad = resetOnLoad;
    }

    public String getMark() {
        return this.mark;
    }

    public long getTimestamp() {
        return this.timestamp;
    }

    public boolean shouldResetOnLoad() {
        return resetOnLoad;
    }
}