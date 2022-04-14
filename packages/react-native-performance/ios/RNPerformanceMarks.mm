#import "RNPerformanceMarks.h"

@implementation RNPerformanceMarks
{
    NSMutableDictionary<NSString *, NSNumber *>* _marks;
}

static RNPerformanceMarks *_sharedInstance = nil;

+ (RNPerformanceMarks *)sharedInstance
{
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        _sharedInstance = [[self alloc] init];

    });

    return _sharedInstance;
}

- (id)init
{
 if (self = [super init]) {
     _marks = [NSMutableDictionary new];
 }
  return self;
}

- (void)setMarkNamed:(nonnull NSString *)name
{
    NSNumber *startTime = @(RNPerformanceGetTimestamp());
    [_marks setValue:startTime forKey:name];
    NSNotification *notification = [[NSNotification alloc] initWithName:RNPerformanceMarkWasSetNotification object:nil userInfo:@{@"name": name, @"startTime": startTime}];
    [NSNotificationCenter.defaultCenter postNotification:notification];
}

- (NSDictionary<NSString *, NSNumber *>*)marks
{
    return [[NSDictionary alloc] initWithDictionary:_marks];
}

@end
