package com.oblador.flipperperformanceplugin;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.flipper.core.FlipperObject;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class FlipperPerformanceModule extends ReactContextBaseJavaModule {

    FlipperLogger flipperLogger;

    public FlipperPerformanceModule(@Nullable ReactApplicationContext reactContext, FlipperLogger flipperLogger) {
        super(reactContext);
        this.flipperLogger = flipperLogger;
    }

    /**
     *
     * @param name metric name
     * @param value metric value
     * @param type byte, ms or count
     */
    @ReactMethod
    public void logMetric(String name, String value, String type) {
        if (flipperLogger == null) {
            return;
        }
        flipperLogger.send("metric", new FlipperObject.Builder()
                .put(name, value)
                .put("type", type)
                .build());
    }

    @ReactMethod
    public void logPoint(String eventName, String groupName, long timeStamp) {
        if (flipperLogger == null) {
            return;
        }
        flipperLogger.send("point", new FlipperObject.Builder()
                .put("eventName", eventName)
                .put("timeStamp", timeStamp)
                .put("groupName", groupName)
                .build());
    }

    @ReactMethod
    public void logTimeSpan(String eventName, String groupName, long startTime, long stopTime, int duration) {
        if (flipperLogger == null) {
            return;
        }
        flipperLogger.send("timeSpan", new FlipperObject.Builder()
                .put("eventName", eventName)
                .put("groupName", groupName)
                .put("startTime", startTime)
                .put("stopTime", stopTime)
                .put("duration", duration)
                .build());
    }

    @NonNull
    @Override
    public String getName() {
        return "RNFlipperReactPerformance";
    }
}
