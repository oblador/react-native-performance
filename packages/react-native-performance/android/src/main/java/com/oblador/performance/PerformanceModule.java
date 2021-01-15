package com.oblador.performance;

import android.os.Process;
import android.os.SystemClock;
import android.system.Os;
import android.system.OsConstants;
import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMarker;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;

public class PerformanceModule extends ReactContextBaseJavaModule {
    public static final String PERFORMANCE_MODULE = "RNPerformanceManager";
    private static double NANOSECONDS_IN_MILLISECOND = 1000000.0;

    private double sessionStartTime;
    private double nativeLaunchStart = 0;
    private double nativeLaunchEnd = 0;
    private double scriptExecutionStart = 0;
    private double scriptExecutionEnd = 0;
    private double contentAppeared = 0;
    private double bundleSize;

    public PerformanceModule(@NonNull final ReactApplicationContext reactContext) {
        super(reactContext);

        sessionStartTime = getTimestamp();

        measureNativeStartupTime();

        addReactMarkers();
    }

    @Override
    @NonNull
    public String getName() {
      return PERFORMANCE_MODULE;
    }

    private double getTimestamp() {
        return (double) SystemClock.elapsedRealtimeNanos() / NANOSECONDS_IN_MILLISECOND;
    }

    private void measureNativeStartupTime() {
        try {
            nativeLaunchStart = PerformanceModule.getStartTime(Process.myPid());
            nativeLaunchEnd = getTimestamp();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void addReactMarkers() {
        ReactMarker.addListener(
                (name, tag, instanceKey) -> {
                    switch (name) {
                        case RUN_JS_BUNDLE_START:
                            scriptExecutionStart = getTimestamp();
                            break;
                        case RUN_JS_BUNDLE_END:
                            scriptExecutionEnd = getTimestamp();
                            break;
                        case CONTENT_APPEARED:
                            contentAppeared = getTimestamp();
                            emitMark("contentAppear", getTimestamp());
                            sendMeasurements();
                            break;
                        case RELOAD:
                            sessionStartTime = getTimestamp();
                            scriptExecutionStart = 0;
                            scriptExecutionEnd = 0;
                            contentAppeared = 0;
                            break;
                    }
                });
    }

    private static long getStartTime(final int pid) throws IOException {
        final String path = "/proc/" + pid + "/stat";
        final BufferedReader reader = new BufferedReader(new FileReader(path));
        final String stat;
        try {
            stat = reader.readLine();
        } finally {
            reader.close();
        }
        final String field2End = ") ";
        final String fieldSep = " ";
        final int fieldStartTime = 20;
        final int msInSec = 1000;
        try {
            final String[] fields = stat.substring(stat.lastIndexOf(field2End)).split(fieldSep);
            final long t = Long.parseLong(fields[fieldStartTime]);
            final long tck;
            tck = Os.sysconf(OsConstants._SC_CLK_TCK);
            return (t * msInSec) / tck;
        } catch (final Exception e) {
            throw new IOException(e);
        }
    }


    private void sendMeasurements() {
        emitTiming("nativeLaunchStart", nativeLaunchStart);
        emitTiming("nativeLaunchEnd", nativeLaunchEnd);
        emitTiming("scriptExecutionStart", scriptExecutionStart);
        emitTiming("scriptExecutionEnd", scriptExecutionEnd);
    }

    private void emitTiming(String name,
                            double startTime) {
        emit("timing", name, startTime);
    }

    private void emitMark(String name,
                          double startTime) {
        emit("mark", name, startTime);
    }

    private void emit(String eventName,
                      String name,
                      double startTime) {
        WritableMap params = Arguments.createMap();
        params.putString("name", name);
        params.putDouble("startTime", startTime);
        getReactApplicationContext()
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(eventName, params);
    }
}
