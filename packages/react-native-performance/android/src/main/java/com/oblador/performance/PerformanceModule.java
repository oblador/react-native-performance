package com.oblador.performance;

import android.os.Build;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMarker;
import com.facebook.react.bridge.ReactMarkerConstants;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.turbomodule.core.interfaces.TurboModule;

import java.util.HashMap;
import java.util.Map;

// Should extend NativeRNPerformanceManagerSpec when codegen for old architecture is solved
public class PerformanceModule extends ReactContextBaseJavaModule implements TurboModule, PerformanceMarks.MarkerListener {
    public static final String PERFORMANCE_MODULE = "RNPerformanceManager";
    public static final String BRIDGE_SETUP_START = "bridgeSetupStart";

    private static boolean eventsBuffered = true;
    private static final Map<String, PerformanceMark> markBuffer = new HashMap<>();

    public PerformanceModule(@NonNull final ReactApplicationContext reactContext) {
        super(reactContext);
        setupMarkerListener();
        setupNativeMarkerListener();
    }

    private void setupNativeMarkerListener() {
        PerformanceMarks.getInstance().addListener(this);
    }

    public static void setMark(String name) {
        setMark(name, false);
    }

    public static void setMark(String name, boolean resetOnLoad) {
        if (eventsBuffered) {
            markBuffer.put(name, new PerformanceMark(name, System.currentTimeMillis(), resetOnLoad));
        } else {
            PerformanceMarks.getInstance().setMark(name, resetOnLoad);
        }
    }

    // Need to set up the marker listener before the react module is initialized
    // to capture all events
    public static void setupListener() {
        ReactMarker.addListener(
                (name, tag, instanceKey) -> {
                    switch (name) {
                        case RELOAD:
                            clearMarkBuffer();
                            addMark(new PerformanceMark(BRIDGE_SETUP_START, System.currentTimeMillis()));
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
                            long startTime = System.currentTimeMillis();
                            addMark(new PerformanceMark(getMarkName(name), startTime));
                            break;

                    }
                }
        );
    }

    private static void clearMarkBuffer() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            markBuffer.entrySet().removeIf(entry -> entry.getValue().shouldResetOnLoad());
        } else {
            for (Map.Entry<String, PerformanceMark> entry : markBuffer.entrySet()) {
                if (entry.getValue().shouldResetOnLoad()) {
                    markBuffer.remove(entry.getKey());
                }
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
        safelyEmitMark(new PerformanceMark("nativeLaunchStart", StartTimeProvider.getStartTime(), false));
        safelyEmitMark(new PerformanceMark("nativeLaunchEnd", StartTimeProvider.getEndTime(), false));
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

    private void safelyEmitMark(PerformanceMark mark) {
        if (eventsBuffered) {
            addMark(mark);
        } else {
            emitMark(mark.getMark(), mark.getTimestamp());
        }
    }

    private static void addMark(PerformanceMark mark) {
        markBuffer.put(mark.getMark(), mark);
    }

    private void emitBufferedMarks() {
        for (Map.Entry<String, PerformanceMark> entry : markBuffer.entrySet()) {
            emitMark(entry.getKey(), entry.getValue().getTimestamp());
        }
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
        params.putDouble("startTime", startTime);
        getReactApplicationContext()
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    @Override
    public void logMarker(PerformanceMark mark) {
        safelyEmitMark(mark);
    }

    @Override
    public void onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy();
        PerformanceMarks.getInstance().removeListener(this);
    }
}
