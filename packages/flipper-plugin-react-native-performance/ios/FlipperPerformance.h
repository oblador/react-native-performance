//
//  FlipperPerformanceModule.h
//

#import <React/RCTBridgeModule.h>

typedef void (^FlipperPerformanceLogger)(NSString* name, NSDictionary* value);

@interface FlipperPerformance : NSObject <RCTBridgeModule>
- (void) addLogger:(FlipperPerformanceLogger)logger;
@end
