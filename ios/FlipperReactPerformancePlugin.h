#import <Foundation/Foundation.h>
#import <FlipperKit/FlipperPlugin.h>
#import <React/RCTBridge.h>

@protocol FlipperReactPerformanceCommunicationResponderDelegate
- (void)messageReceived:(NSString *)msg;
@end

@interface FlipperReactPerformancePlugin : NSObject<FlipperPlugin>
@property (weak, nonatomic) id<FlipperReactPerformanceCommunicationResponderDelegate> delegate;

- (instancetype)init NS_UNAVAILABLE;
+ (instancetype) sharedInstance;
- (void)setBridge:(RCTBridge *)bridge;

@end
