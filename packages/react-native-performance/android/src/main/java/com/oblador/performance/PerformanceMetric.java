package com.oblador.performance;

import android.os.Bundle;

class PerformanceMetric extends PerformanceEntry {

    private final double value;

    protected PerformanceMetric(String name, double value, long startTime) {
        this(name, value, startTime, true);
    }

    protected PerformanceMetric(String name, double value, long startTime, boolean ephemeral) {
        this(name, value, startTime, ephemeral, null);
    }

    protected PerformanceMetric(String name, double value, long startTime, Bundle detail) {
        this(name, value, startTime, true, detail);
    }

    protected PerformanceMetric(String name, double value, long startTime, boolean ephemeral, Bundle detail) {
        this.name = name;
        this.value = value;
        this.startTime = startTime;
        this.ephemeral = ephemeral;
        this.detail = detail;
    }

    protected double getValue() {
        return value;
    }
}
