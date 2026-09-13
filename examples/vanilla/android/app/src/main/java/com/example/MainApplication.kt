package com.example

import android.app.Application
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.oblador.performance.RNPerformance

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
        },
    )
  }

  override fun onCreate() {
    RNPerformance.getInstance().mark("onCreateStart")
    super.onCreate()
    loadReactNative(this)
    RNPerformance.getInstance().mark("onCreateEnd")
    var detail = Bundle()
    detail.putString("unit", "byte")
    RNPerformance.getInstance().metric("bundleSize", 1337.0, detail)
    Handler(Looper.getMainLooper()).postDelayed({ RNPerformance.getInstance().mark("Delayed Mark") }, 3000L)
  }
}
