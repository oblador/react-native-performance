package com.oblador.flipperperformanceplugin;

import androidx.annotation.NonNull;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.JavaScriptModule;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.Collections;
import java.util.List;

@SuppressWarnings("unused")
public class FlipperPerformancePackage implements ReactPackage {

  public FlipperPerformancePackage() {

  }

  @Override
  @NonNull
  public List<NativeModule> createNativeModules(@NonNull final ReactApplicationContext reactContext) {
    return Collections.emptyList();
  }

  @NonNull
  public List<Class<? extends JavaScriptModule>> createJSModules() {
    return Collections.emptyList();
  }

  @Override
  @NonNull
  public List<ViewManager> createViewManagers(@NonNull final ReactApplicationContext reactContext) {
    return Collections.emptyList();
  }
}
