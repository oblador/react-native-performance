package com.oblador.performance;

import android.os.Bundle;

class PerformanceMark extends PerformanceEntry {

    protected PerformanceMark(String name, long startTime) {
        this(name, startTime, true);
    }

    protected PerformanceMark(String name, long startTime, boolean ephemeral) {
        this(name, startTime, ephemeral, null);
    }

    protected PerformanceMark(String name, long startTime, Bundle detail) {
        this(name, startTime, true, detail);
    }

    protected PerformanceMark(String name, long startTime, boolean ephemeral, Bundle detail) {
        this.name = name;
        this.startTime = startTime;
        this.ephemeral = ephemeral;
        this.detail = detail;
    }
}
