#import <Foundation/Foundation.h>
#import <FlipperKit/FlipperPlugin.h>
#import <React/RCTBridge.h>

@interface FlipperReactPerformancePlugin : NSObject<FlipperPlugin>

+ (instancetype)sharedInstance;
- (instancetype)init NS_UNAVAILABLE;
- (void)setBridge:(RCTBridge *)bridge;

@end
