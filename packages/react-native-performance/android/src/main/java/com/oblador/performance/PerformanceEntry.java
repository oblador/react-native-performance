package com.oblador.performance;

import android.os.Bundle;

abstract class PerformanceEntry {
    protected String name;
    protected long startTime;
    protected boolean ephemeral = true;
    protected Bundle detail = null;

    protected String getName() {
        return name;
    }

    protected long getStartTime() {
        return startTime;
    }

    protected boolean isEphemeral() {
        return ephemeral;
    }

    protected Bundle getDetail() {
        return detail;
    }
}


