#import "RNPerformanceManager.h"
#import "RNPerformance.h"
#import <sys/sysctl.h>
#import <QuartzCore/QuartzCore.h>
#import <React/RCTRootView.h>
#import <React/RCTPerformanceLogger.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import <RNPerformanceSpec/RNPerformanceSpec.h>
#endif

static int64_t sNativeLaunchStart;
static int64_t sNativeLaunchEnd;

@implementation RNPerformanceManager
{
    bool hasListeners;
    bool didEmit;
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

- (void)setBridge:(RCTBridge *)bridge
{
    [super setBridge:bridge];
    [RNPerformance.sharedInstance clearEphemeralEntries];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(emitIfReady)
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

- (void)emitIfReady
{
    if (!didEmit && hasListeners && [self.bridge.performanceLogger valueForTag:RCTPLTTI] != 0 && [self.bridge.performanceLogger valueForTag:RCTPLScriptExecution] != 0) {
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
    [self emitMarkNamed:@"nativeLaunchStart" withStartTime:sNativeLaunchStart];
    [self emitMarkNamed:@"nativeLaunchEnd" withStartTime:sNativeLaunchEnd];
    [self emitTag:RCTPLScriptDownload withNamePrefix:@"download"];
    [self emitTag:RCTPLScriptExecution withNamePrefix:@"runJsBundle"];
    [self emitTag:RCTPLBridgeStartup withNamePrefix:@"bridgeSetup"];
    [self emitMarkNamed:@"contentAppeared" withMediaTime:[self.bridge.performanceLogger valueForTag:RCTPLTTI]];
    [self emitMetricNamed:@"bundleSize" withValue:@([self.bridge.performanceLogger valueForTag:RCTPLBundleSize]) withStartTime:RNPerformanceGetTimestamp() withDetail:@{ @"unit": @"byte" }];
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
    if (didEmit != YES && [self.bridge.performanceLogger valueForTag:RCTPLTTI] != 0 && [self.bridge.performanceLogger valueForTag:RCTPLScriptExecution] != 0) {
        [self emitEntries];
    }
}

-(void)stopObserving
{
    hasListeners = NO;
}

- (void)emitTag:(RCTPLTag)tag withNamePrefix:(NSString *)namePrefix
{
    int64_t duration = [self.bridge.performanceLogger durationForTag:tag];
    int64_t end = [self.bridge.performanceLogger valueForTag:tag];
    if (duration == 0 || end == 0) {
        NSLog(@"Ignoring marks prefixed %@ (%lu) as data is unavailable (duration: %lld, end: %lld)", namePrefix, (unsigned long)tag, duration, end);
        return;
    }
    [self emitMarkNamed:[namePrefix stringByAppendingString:@"Start"] withMediaTime:end-duration];
    [self emitMarkNamed:[namePrefix stringByAppendingString:@"End"] withMediaTime:end];
}

- (void)emitMarkNamed:(NSString *)name withMediaTime:(int64_t)mediaTime
{
    [self emitMarkNamed:name withStartTime:mediaTime + RNPerformanceGetTimestamp() - (CACurrentMediaTime() * 1000)];
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
