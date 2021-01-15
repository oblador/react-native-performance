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

    private long sessionStartTime;
    private long nativeLaunchStart = 0;
    private long nativeLaunchEnd = 0;
    private long scriptExecutionStart = 0;
    private long scriptExecutionEnd = 0;
    private long contentAppeared = 0;
    private long bundleSize;

    public PerformanceModule(@NonNull final ReactApplicationContext reactContext) {
        super(reactContext);

        sessionStartTime = System.currentTimeMillis();

        measureNativeStartupTime();

        addReactMarkers();
    }

    @Override
    @NonNull
    public String getName() {
      return PERFORMANCE_MODULE;
    }

    private void measureNativeStartupTime() {
        try {
            nativeLaunchStart = PerformanceModule.getStartTime(Process.myPid());
            nativeLaunchEnd = SystemClock.elapsedRealtime();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void addReactMarkers() {
        ReactMarker.addListener(
                (name, tag, instanceKey) -> {
                    switch (name) {
                        case RUN_JS_BUNDLE_START:
                            scriptExecutionStart = SystemClock.elapsedRealtime();
                            break;
                        case RUN_JS_BUNDLE_END:
                            scriptExecutionEnd = SystemClock.elapsedRealtime();
                            break;
                        case CONTENT_APPEARED:
                            contentAppeared = SystemClock.elapsedRealtime();
                            emitMark("contentAppear", SystemClock.elapsedRealtime());
                            sendMeasurements();
                            break;
                        case RELOAD:
                            sessionStartTime = SystemClock.elapsedRealtime();
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
                            long startTime) {
        emit("timing", name, startTime);
    }

    private void emitMark(String name,
                          long startTime) {
        emit("mark", name, startTime);
    }

    private void emit(String eventName,
                      String name,
                      long startTime) {
        WritableMap params = Arguments.createMap();
        params.putString("name", name);
        params.putDouble("startTime", (double)startTime);
        getReactApplicationContext()
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(eventName, params);
    }
}
