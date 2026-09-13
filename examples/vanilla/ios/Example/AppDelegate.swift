import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "Example",
      in: window,
      launchOptions: launchOptions
    )

    RNPerformance.sharedInstance().mark("myCustomMark", ephemeral: false)
    /*
    [RNPerformance.sharedInstance mark:@"myCustomMark"];
    [RNPerformance.sharedInstance mark:@"myCustomMark" detail:@{ @"extra": @"info" }];
    [RNPerformance.sharedInstance mark:@"myCustomMark" ephemeral:NO];

    [RNPerformance.sharedInstance metric:@"myCustomMetric" value:@(123)];
    [RNPerformance.sharedInstance metric:@"myCustomMetric" value:@(123) detail:@{ @"unit": @"ms" }];
    [RNPerformance.sharedInstance metric:@"myCustomMetric" value:@(123) ephemeral:NO];*/

    return true
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
