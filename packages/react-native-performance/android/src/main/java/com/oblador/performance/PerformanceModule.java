package com.oblador.performance;

import android.os.Process;
import android.os.SystemClock;
import android.system.Os;
import android.system.OsConstants;
import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMarker;
import com.facebook.react.bridge.ReactMarkerConstants;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.lang.StringBuffer;
import java.util.Map;
import java.util.HashMap;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;

public class PerformanceModule extends ReactContextBaseJavaModule {
    public static final String PERFORMANCE_MODULE = "RNPerformanceManager";
    private static final double NANOSECONDS_IN_MILLISECOND = 1000000.0;
    private static final long MODULE_INITIALIZED_AT = SystemClock.elapsedRealtimeNanos();

    private boolean eventsBuffered = true;
    private static Map<String, Double> markBuffer = new HashMap();

    public PerformanceModule(@NonNull final ReactApplicationContext reactContext) {
        super(reactContext);

        setupMarkerListener();
    }

    // Need to set up the marker listener before the react module is initialized 
    // to capture all events
    public static void setupListener() {
        ReactMarker.addListener(
            (name, tag, instanceKey) -> {
                switch (name) {
                    case RELOAD:
                        markBuffer.clear();
                        break;
                    case ATTACH_MEASURED_ROOT_VIEWS_END:
                    case ATTACH_MEASURED_ROOT_VIEWS_START:
                    case BUILD_NATIVE_MODULE_REGISTRY_END:
                    case BUILD_NATIVE_MODULE_REGISTRY_START:
                    case CONTENT_APPEARED:
                    case CREATE_CATALYST_INSTANCE_END:
                    case CREATE_CATALYST_INSTANCE_START:
                    case CREATE_REACT_CONTEXT_END:
                    case CREATE_REACT_CONTEXT_START:
                    case CREATE_UI_MANAGER_MODULE_CONSTANTS_END:
                    case CREATE_UI_MANAGER_MODULE_CONSTANTS_START:
                    case CREATE_UI_MANAGER_MODULE_END:
                    case CREATE_UI_MANAGER_MODULE_START:
                    case CREATE_VIEW_MANAGERS_END:
                    case CREATE_VIEW_MANAGERS_START:
                    case DOWNLOAD_END:
                    case DOWNLOAD_START:
                    case LOAD_REACT_NATIVE_SO_FILE_END:
                    case LOAD_REACT_NATIVE_SO_FILE_START:
                    case PRE_RUN_JS_BUNDLE_START:
                    case PRE_SETUP_REACT_CONTEXT_END:
                    case PRE_SETUP_REACT_CONTEXT_START:
                    case PROCESS_CORE_REACT_PACKAGE_END:
                    case PROCESS_CORE_REACT_PACKAGE_START:
                    case REACT_CONTEXT_THREAD_END:
                    case REACT_CONTEXT_THREAD_START:
                    case RUN_JS_BUNDLE_END:
                    case RUN_JS_BUNDLE_START:
                    case SETUP_REACT_CONTEXT_END:
                    case SETUP_REACT_CONTEXT_START:
                    case VM_INIT:
                        double startTime = getTimestamp();
                        markBuffer.put(getMarkName(name), startTime);
                    break;

                }
            }
        );
    }

    private static String getMarkName(ReactMarkerConstants name) {
        StringBuffer sb = new StringBuffer();
        for (String s : name.toString().toLowerCase().split("_")) {
            if (sb.length() == 0) {
                sb.append(s);
            } else {
                sb.append(Character.toUpperCase(s.charAt(0)));
                if (s.length() > 1) {
                    sb.append(s.substring(1, s.length()));
                }
            }
        }
        return sb.toString();
    }

    private static double getTimestamp() {
        return SystemClock.elapsedRealtimeNanos() / NANOSECONDS_IN_MILLISECOND;
    }

    @Override
    @NonNull
    public String getName() {
      return PERFORMANCE_MODULE;
    }

    private void emitNativeStartupTime() {
        try {
            safelyEmitMark("nativeLaunchStart", PerformanceModule.getStartTime(Process.myPid()));
            safelyEmitMark("nativeLaunchEnd", MODULE_INITIALIZED_AT / NANOSECONDS_IN_MILLISECOND);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void setupMarkerListener() {
        ReactMarker.addListener(
            (name, tag, instanceKey) -> {
                switch (name) {
                    case CONTENT_APPEARED:
                        eventsBuffered = false;
                        emitNativeStartupTime();
                        emitBufferedMarks();
                        break;
                    case RELOAD:
                        eventsBuffered = true;
                        break;
                }
            }
        );
    }

    private void safelyEmitMark(String name, double startTime) {
        if (eventsBuffered) {
            markBuffer.put(name, startTime);
        } else {
            emitMark(name, startTime);
        }
    }

    private void emitBufferedMarks() {
        for (Map.Entry<String, Double> entry : markBuffer.entrySet()) {
            emitMark(entry.getKey(), entry.getValue());
        }
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
