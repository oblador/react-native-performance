import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider


@main
class AppDelegate: RCTAppDelegate {
  override func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
    self.moduleName = "Example"
    self.dependencyProvider = RCTAppDependencyProvider()

    // You can add your custom initial props in the dictionary below.
    // They will be passed down to the ViewController used by React Native.
    self.initialProps = [:]
    RNPerformance.sharedInstance().mark("myCustomMark")
      /*
    [RNPerformance.sharedInstance mark:@"myCustomMark"];
    [RNPerformance.sharedInstance mark:@"myCustomMark" detail:@{ @"extra": @"info" }];
    [RNPerformance.sharedInstance mark:@"myCustomMark" ephemeral:NO];

    [RNPerformance.sharedInstance metric:@"myCustomMetric" value:@(123)];
    [RNPerformance.sharedInstance metric:@"myCustomMetric" value:@(123) detail:@{ @"unit": @"ms" }];
    [RNPerformance.sharedInstance metric:@"myCustomMetric" value:@(123) ephemeral:NO];*/

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

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
