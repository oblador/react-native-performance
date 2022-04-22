package com.oblador.performance;

public class PerformanceMark {
    private final String mark;
    private final long timestamp;
    private final boolean persistBuffer;

    public PerformanceMark(String mark, long timestamp) {
        this.mark = mark;
        this.timestamp = timestamp;
        this.persistBuffer = false;
    }

    public PerformanceMark(String mark, long timestamp, boolean persistBuffer) {
        this.mark = mark;
        this.timestamp = timestamp;
        this.persistBuffer = persistBuffer;
    }

    public String getMark() {
        return this.mark;
    }

    public long getTimestamp() {
        return this.timestamp;
    }

    public boolean isPersistBuffer() {
        return persistBuffer;
    }
}