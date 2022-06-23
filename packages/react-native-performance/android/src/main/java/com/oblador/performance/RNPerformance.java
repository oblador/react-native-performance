package com.oblador.performance;

import android.os.Build;
import android.os.Bundle;

import androidx.annotation.NonNull;
import com.facebook.proguard.annotations.DoNotStrip;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

public class RNPerformance {

    private RNPerformance() {
    }

    private static class LoadRNPerformance {
        static final RNPerformance instance = new RNPerformance();
    }

    @NonNull
    public static RNPerformance getInstance() {
        return LoadRNPerformance.instance;
    }

    interface MarkerListener {
        void logMarker(PerformanceEntry entry);
    }

    private static final List<MarkerListener> sListeners = new CopyOnWriteArrayList<>();
    private final List<PerformanceEntry> entries = new CopyOnWriteArrayList<>();

    @DoNotStrip
    protected void addListener(MarkerListener listener) {
        if (!sListeners.contains(listener)) {
            sListeners.add(listener);
        }
    }

    @DoNotStrip
    protected void removeListener(MarkerListener listener) {
        if (!sListeners.contains(listener)) {
            sListeners.remove(listener);
        }
    }

    public void mark(@NonNull String markName) {
        mark(markName, true);
    }

    public void mark(@NonNull String markName, boolean ephemeral) {
        mark(markName, null, ephemeral);
    }

    public void mark(@NonNull String markName, Bundle detail) {
        mark(markName, detail, true);
    }

    public void mark(@NonNull String markName, Bundle detail, boolean ephemeral) {
        PerformanceEntry mark = new PerformanceMark(
                markName,
                System.currentTimeMillis(),
                ephemeral,
                detail
        );
        addEntry(mark);
    }

    public void metric(@NonNull String metricName, double value) {
        metric(metricName, value, true);
    }

    public void metric(@NonNull String metricName, double value, boolean ephemeral) {
        metric(metricName, value, null, ephemeral);
    }

    public void metric(@NonNull String metricName, double value, Bundle detail) {
        metric(metricName, value, detail, true);
    }

    public void metric(
            @NonNull String metricName,
            double value,
            Bundle detail,
            boolean ephemeral
    ) {
        PerformanceEntry mark = new PerformanceMetric(
                metricName,
                value,
                System.currentTimeMillis(),
                ephemeral,
                detail
        );
        addEntry(mark);
    }

    private void addEntry(@NonNull PerformanceEntry mark) {
        entries.add(mark);
        emitMark(mark);
    }

    private void emitMark(@NonNull PerformanceEntry entry) {
        for (MarkerListener listener : sListeners) {
            listener.logMarker(entry);
        }
    }

    protected @NonNull List<PerformanceEntry> getEntries() {
        return entries;
    }

    protected void clearEntries() {
        entries.clear();
    }

    protected void clearEntries(String name) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            entries.removeIf((entry) -> entry.getName().equals(name));
        } else {
            for (PerformanceEntry entry : entries) {
                if (entry.getName().equals(name)) {
                    entries.remove(entry);
                }
            }
        }
    }

    protected void clearEphermalEntries() {
        if (sListeners.isEmpty()) {
            return;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            entries.removeIf(PerformanceEntry::isEphemeral);
        } else {
            for (PerformanceEntry entry : entries) {
                if (entry.isEphemeral()) {
                    entries.remove(entry);
                }
            }
        }
    }
}
