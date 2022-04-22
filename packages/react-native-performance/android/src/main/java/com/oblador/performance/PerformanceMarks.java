package com.oblador.performance;

import com.facebook.proguard.annotations.DoNotStrip;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

public class PerformanceMarks {
    private PerformanceMarks() {
    }

    private static class LoadPerformanceMarks {
        static final PerformanceMarks instance = new PerformanceMarks();
    }

    protected static PerformanceMarks getInstance() {
        return LoadPerformanceMarks.instance;
    }

    private static final List<MarkerListener> sListeners = new CopyOnWriteArrayList<>();

    protected interface MarkerListener {
        void logMarker(PerformanceMark mark);
    }

    @DoNotStrip
    protected void addListener(MarkerListener listener) {
        if (!sListeners.contains(listener)) {
            sListeners.add(listener);
        }
    }

    @DoNotStrip
    protected void removeListener(MarkerListener listener) {
        sListeners.remove(listener);
    }

    protected void setMark(String name) {
        setMark(name, false);
    }

    protected void setMark(String name, boolean resetOnLoad) {
        long timestamp = System.currentTimeMillis();
        for (MarkerListener listener : sListeners) {
            listener.logMarker(new PerformanceMark(name, timestamp, resetOnLoad));
        }
    }
}
