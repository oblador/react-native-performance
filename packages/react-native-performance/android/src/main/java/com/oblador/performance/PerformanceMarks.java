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

    public static PerformanceMarks getInstance() {
        return LoadPerformanceMarks.instance;
    }

    private static final List<MarkerListener> sListeners = new CopyOnWriteArrayList<>();

    public interface MarkerListener {
        void logMarker(PerformanceMark mark);
    }

    @DoNotStrip
    public static void addListener(MarkerListener listener) {
        if (!sListeners.contains(listener)) {
            sListeners.add(listener);
        }
    }

    @DoNotStrip
    public static void removeListener(MarkerListener listener) {
        sListeners.remove(listener);
    }

    public void setMark(String name) {
        long timestamp = System.currentTimeMillis();
        for (MarkerListener listener : sListeners) {
            listener.logMarker(new PerformanceMark(name, timestamp));
        }
    }
}
