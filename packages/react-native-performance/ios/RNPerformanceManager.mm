#import "RNPerformanceManager.h"
#import "RNPerformance.h"
#import <sys/sysctl.h>
#import <QuartzCore/QuartzCore.h>
#import <React/RCTRootView.h>
#import <React/RCTPerformanceLogger.h>

#import "RNPerformanceUtils.h"

#ifdef RCT_NEW_ARCH_ENABLED
#import <RNPerformanceSpec/RNPerformanceSpec.h>
#endif

static int64_t sNativeLaunchStart;
static int64_t sNativeLaunchEnd;

// RCTPerformanceLogger keeps a { start, stop } pair of CACurrentMediaTime() * 1000
// timestamps per tag, flattened by -valuesForTags into [2 * tag, 2 * tag + 1].
// Either slot is 0 when the corresponding marker was never logged.
static int64_t RNPerformanceStartTimeForTag(NSArray<NSNumber *> *values, RCTPLTag tag)
{
    NSUInteger index = 2 * (NSUInteger)tag;
    return index < values.count ? values[index].longLongValue : 0;
}

static int64_t RNPerformanceEndTimeForTag(NSArray<NSNumber *> *values, RCTPLTag tag)
{
    NSUInteger index = 2 * (NSUInteger)tag + 1;
    return index < values.count ? values[index].longLongValue : 0;
}

@implementation RNPerformanceManager
{
    bool hasListeners;
    bool didEmit;
    int64_t contentAppeared;
}

RCT_EXPORT_MODULE();

+ (void) initialize
{
    [super initialize];
    struct timespec tp;
    clock_gettime(CLOCK_THREAD_CPUTIME_ID, &tp);
    sNativeLaunchEnd = RNPerformanceGetTimestamp();
    sNativeLaunchStart = sNativeLaunchEnd - (tp.tv_sec * 1e3 + tp.tv_nsec / 1e6);
}

- (instancetype)init
{
    if (self = [super init]) {
        hasListeners = NO;
        didEmit = NO;
        contentAppeared = -1;
    }
    return self;
}

- (void)setBridge:(RCTBridge *)bridge
{
    [super setBridge:bridge];
    [RNPerformance.sharedInstance clearEphemeralEntries];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(contentAppeared)
                                                 name:RCTContentDidAppearNotification
                                               object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(emitIfReady)
                                                 name:RCTJavaScriptDidLoadNotification
                                               object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(customEntryWasAdded:)
                                                 name:RNPerformanceEntryWasAddedNotification
                                               object:nil];
}

- (BOOL)isReady
{
    // -valueForTag: returns the stop timestamp, or 0 while the bundle is still executing.
    return contentAppeared != -1 && [self.bridge.performanceLogger valueForTag:RCTPLScriptExecution] != 0;
}

- (void) contentAppeared
{
    contentAppeared = RNPerformanceGetTimestamp();
    [self emitIfReady];
}

- (void)emitIfReady
{
    if (!didEmit && hasListeners && [self isReady]) {
        [self emitEntries];
    }
}

- (void)customEntryWasAdded:(NSNotification *)notification
{
    if(didEmit == YES) {
        [self emitEntry:notification.userInfo[@"entry"]];
    }
}

- (void)emitEntries
{
    didEmit = YES;
    RCTPerformanceLogger *performanceLogger = self.bridge.performanceLogger;
    NSArray<NSNumber *> *values = [performanceLogger valuesForTags];
    [self emitMarkNamed:@"nativeLaunchStart" withStartTime:sNativeLaunchStart];
    [self emitMarkNamed:@"nativeLaunchEnd" withStartTime:sNativeLaunchEnd];
    [self emitMarkNamed:@"runJsBundleStart" withMediaTime:RNPerformanceStartTimeForTag(values, RCTPLScriptExecution)];
    [self emitMarkNamed:@"runJsBundleEnd" withMediaTime:RNPerformanceEndTimeForTag(values, RCTPLScriptExecution)];
    [self emitMarkNamed:@"appStartupStart" withMediaTime:RNPerformanceStartTimeForTag(values, RCTPLAppStartup)];
    [self emitMarkNamed:@"appStartupEnd" withMediaTime:RNPerformanceEndTimeForTag(values, RCTPLAppStartup)];
    [self emitMarkNamed:@"initReactRuntimeStart" withMediaTime:RNPerformanceStartTimeForTag(values, RCTPLInitReactRuntime)];
    [self emitMarkNamed:@"initReactRuntimeEnd" withMediaTime:RNPerformanceEndTimeForTag(values, RCTPLInitReactRuntime)];
    [self emitMarkNamed:@"contentAppeared" withStartTime:contentAppeared];
    [self emitMetricNamed:@"bundleSize" withValue:@([performanceLogger valueForTag:RCTPLBundleSize]) withStartTime:RNPerformanceGetTimestamp() withDetail:@{ @"unit": @"byte" }];
    [[RNPerformance.sharedInstance getEntries]
     enumerateObjectsUsingBlock:^(RNPerformanceEntry * _Nonnull entry, NSUInteger idx, BOOL * _Nonnull stop) {
        [self emitEntry:entry];
    }];
}

- (void)emitEntry:(nonnull RNPerformanceEntry *)entry
{
    switch (entry.type) {
        case kMark:
            [self emitMarkNamed:entry.name withStartTime:entry.startTime withDetail:entry.detail];
            break;
            
        case kMetric:
            RNPerformanceMetric *metric = (RNPerformanceMetric *)entry;
            [self emitMetricNamed:metric.name withValue:metric.value withStartTime:metric.startTime withDetail:metric.detail];
            break;
    }
}

- (NSArray<NSString *> *)supportedEvents
{
    return @[ @"mark", @"metric" ];
}

- (void)invalidate
{
    [super invalidate];
    [NSNotificationCenter.defaultCenter removeObserver:self];
}

- (void)startObserving
{
    hasListeners = YES;
    if (didEmit != YES && [self isReady]) {
        [self emitEntries];
    }
}

-(void)stopObserving
{
    hasListeners = NO;
}

- (void)emitMarkNamed:(NSString *)name withMediaTime:(int64_t)mediaTime
{
    if (mediaTime == 0) {
        NSLog(@"Ignoring mark named %@ as timestamp is not set", name);
        return;
    }
    // RCTPerformanceLogger records CACurrentMediaTime() * 1000, the same clock
    // RNPerformanceGetTimestamp() reads, so no rebasing is needed.
    [self emitMarkNamed:name withStartTime:mediaTime];
}

- (void)emitMarkNamed:(NSString *)name withStartTime:(int64_t)startTime
{
    [self emitMarkNamed:name withStartTime:startTime withDetail:nil];
}

- (void)emitMarkNamed:(NSString *)name withStartTime:(int64_t)startTime withDetail:(NSDictionary *)detail
{
    if (hasListeners) {
        [self sendEventWithName:@"mark" body:@{
            @"name": name,
            @"startTime": @(startTime),
            @"detail": detail == nil ? [NSNull null] : detail
        }];
    }
}

- (void)emitMetricNamed:(NSString *)name withValue:(NSNumber *)value withStartTime:(int64_t)startTime withDetail:(NSDictionary *)detail
{
    if (hasListeners) {
        [self sendEventWithName:@"metric" body:@{
            @"name": name,
            @"startTime": @(startTime),
            @"value": value,
            @"detail": detail == nil ? [NSNull null] : detail
        }];
    }
}

#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeRNPerformanceManagerSpecJSI>(params);
}
#endif

@end
