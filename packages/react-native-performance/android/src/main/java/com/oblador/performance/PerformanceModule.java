package com.oblador.performance;

import android.os.SystemClock;
import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMarker;
import com.facebook.react.bridge.ReactMarkerConstants;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.turbomodule.core.interfaces.TurboModule;

import java.util.Iterator;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;

// Should extend NativeRNPerformanceManagerSpec when codegen for old architecture is solved
public class PerformanceModule extends ReactContextBaseJavaModule implements TurboModule, RNPerformance.MarkerListener {
    public static final String PERFORMANCE_MODULE = "RNPerformanceManager";
    public static final String BRIDGE_SETUP_START = "bridgeSetupStart";

    private static boolean eventsBuffered = true;
    private static final Queue<PerformanceEntry> markBuffer = new ConcurrentLinkedQueue<>();
    private static boolean didEmit = false;

    public PerformanceModule(@NonNull final ReactApplicationContext reactContext) {
        super(reactContext);
        setupMarkerListener();
        setupNativeMarkerListener();
    }

    private void setupNativeMarkerListener() {
        RNPerformance.getInstance().addListener(this);
    }

    // Need to set up the marker listener before the react module is initialized
    // to capture all events
    public static void setupListener() {
        ReactMarker.addListener(
                (name, tag, instanceKey) -> {
                    switch (name) {
                        case RELOAD:
                            clearMarkBuffer();
                            addMark(new PerformanceMark(BRIDGE_SETUP_START, SystemClock.uptimeMillis()));
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
                            long startTime = SystemClock.uptimeMillis();
                            addMark(new PerformanceMark(getMarkName(name), startTime));
                            break;

                    }
                }
        );
    }

    private static void clearMarkBuffer() {
        RNPerformance.getInstance().clearEphermalEntries();

        Iterator<PerformanceEntry> iterator = markBuffer.iterator();
        while (iterator.hasNext()) {
            PerformanceEntry entry = iterator.next();
            if (entry.isEphemeral()) {
                iterator.remove();
            }
        }
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

    @Override
    @NonNull
    public String getName() {
        return PERFORMANCE_MODULE;
    }

    private void emitNativeStartupTime() {
        safelyEmitMark(new PerformanceMark("nativeLaunchStart", StartTimeProvider.getStartTime()));
        safelyEmitMark(new PerformanceMark("nativeLaunchEnd", StartTimeProvider.getEndTime()));
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

    private void safelyEmitMark(PerformanceEntry entry) {
        if (eventsBuffered) {
            addMark(entry);
        } else {
            emitMark(entry);
        }
    }

    private static void addMark(PerformanceEntry entry) {
        markBuffer.add(entry);
    }

    private void emitBufferedMarks() {
        didEmit = true;
        Iterator<PerformanceEntry> iterator = markBuffer.iterator();
        while (iterator.hasNext()) {
            PerformanceEntry entry = iterator.next();
            emitMark(entry);
        }
        emitNativeBufferedMarks();
    }

    private void emitNativeBufferedMarks() {
        Iterator<PerformanceEntry> iterator = RNPerformance.getInstance().getEntries().iterator();
        while (iterator.hasNext()) {
            PerformanceEntry entry = iterator.next();
            emitMark(entry);
        }
    }

    private void emitMark(PerformanceEntry entry) {
        if (entry instanceof PerformanceMark) {
            emit((PerformanceMark) entry);
        } else if (entry instanceof PerformanceMetric) {
            emit((PerformanceMetric) entry);
        }
    }

    private void emit(PerformanceMetric metric) {
        WritableMap params = Arguments.createMap();
        params.putString("name", metric.getName());
        params.putDouble("startTime", metric.getStartTime());
        params.putDouble("value", metric.getValue());
        if (metric.getDetail() != null) {
            WritableMap map = Arguments.fromBundle(metric.getDetail());
            params.putMap("detail", map);
        }
        getReactApplicationContext()
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("metric", params);
    }

    private void emit(PerformanceMark mark) {
        WritableMap params = Arguments.createMap();
        params.putString("name", mark.getName());
        params.putDouble("startTime", mark.getStartTime());
        if (mark.getDetail() != null) {
            WritableMap map = Arguments.fromBundle(mark.getDetail());
            params.putMap("detail", map);
        }
        getReactApplicationContext()
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("mark", params);
    }

    @Override
    public void logMarker(PerformanceEntry entry) {
        if (didEmit) {
            emitMark(entry);
        }
    }

    @Override
    public void onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy();
        RNPerformance.getInstance().removeListener(this);
    }
}
