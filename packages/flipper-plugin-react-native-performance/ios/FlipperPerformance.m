//
//  FlipperPerformance.m
//

#import "FlipperPerformance.h"

@implementation FlipperPerformance
{
  FlipperPerformanceLogger _logger;
}

RCT_EXPORT_MODULE(RNFlipperReactPerformance);

RCT_EXPORT_METHOD(logMetric:(NSString *)name value:(NSString *)value type:(NSString *)type)
{
  if (_logger) {
    _logger(@"metric", @{@"name": name, @"value": value, @"type": type});
  }
}

RCT_EXPORT_METHOD(logPoint:(NSString *)eventName groupName:(NSString *)groupName timeStamp:(NSNumber *)timeStamp)
{
  if (_logger) {
    _logger(@"point", @{@"name": eventName, @"groupName": groupName, @"timeStamp": timeStamp});
  }
}

RCT_EXPORT_METHOD(logTimeSpan:(NSString *)eventName groupName:(NSString *)groupName startTime:(NSNumber *)startTime stopTime:(NSNumber *)stopTime duration:(NSNumber *)duration)
{
  if (_logger) {
    _logger(@"timeSpan", @{@"name": eventName, @"groupName": groupName, @"startTime": startTime, @"stopTime": stopTime, @"duration": duration});
  }
}

- (void) addLogger:(FlipperPerformanceLogger)logger {
  _logger = logger;
}

@end
