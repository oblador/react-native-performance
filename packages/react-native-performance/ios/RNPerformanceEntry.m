#import "RNPerformanceEntry.h"

@implementation RNPerformanceEntry
- (id)initWithName:(nonnull NSString *)name type:(EntryType)type startTime:(int64_t)startTime detail:(nullable NSDictionary *)detail ephemeral:(BOOL)ephemeral
{
 if (self = [super init]) {
     _name = name;
     _type = type;
     _startTime = startTime;
     _detail = detail;
     _ephemeral = ephemeral;
 }
  return self;
}
@end

@implementation RNPerformanceMark
- (id)initWithName:(nonnull NSString *)name startTime:(int64_t)startTime detail:(nullable NSDictionary *)detail ephemeral:(BOOL)ephemeral
{
  self = [super initWithName:name type:kMark startTime:startTime detail:detail ephemeral:ephemeral];
  return self;
}
@end

@implementation RNPerformanceMetric
- (id)initWithName:(nonnull NSString *)name value:(nonnull NSNumber *)value startTime:(int64_t)startTime detail:(nullable NSDictionary *)detail ephemeral:(BOOL)ephemeral
{
  if (self = [super initWithName:name type:kMetric startTime:startTime detail:detail ephemeral:ephemeral]) {
      _value = value;
  }
  return self;
}
@end
