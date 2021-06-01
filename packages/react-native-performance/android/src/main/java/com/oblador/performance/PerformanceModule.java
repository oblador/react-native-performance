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

import java.util.HashMap;
import java.util.Map;

public class PerformanceModule extends ReactContextBaseJavaModule {
    public static final String PERFORMANCE_MODULE = "RNPerformanceManager";
    public static final String BRIDGE_SETUP_START = "bridgeSetupStart";

    private boolean eventsBuffered = true;
    private static final Map<String, Long> markBuffer = new HashMap<>();

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
                            markBuffer.put(BRIDGE_SETUP_START, SystemClock.uptimeMillis());
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

    @Override
    @NonNull
    public String getName() {
        return PERFORMANCE_MODULE;
    }

    private void emitNativeStartupTime() {
        safelyEmitMark("nativeLaunchStart", StartTimeProvider.getStartTime());
        safelyEmitMark("nativeLaunchEnd", StartTimeProvider.getEndTime());
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

    private void safelyEmitMark(String name, long startTime) {
        if (eventsBuffered) {
            markBuffer.put(name, startTime);
        } else {
            emitMark(name, startTime);
        }
    }

    private void emitBufferedMarks() {
        for (Map.Entry<String, Long> entry : markBuffer.entrySet()) {
            emitMark(entry.getKey(), entry.getValue());
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
        params.putInt("startTime", (int) startTime);
        getReactApplicationContext()
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }
}
