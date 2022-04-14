#import "RNPerformanceManager.h"
#import <sys/sysctl.h>
#include <math.h>
#include <chrono>
#import <QuartzCore/QuartzCore.h>
#import <React/RCTRootView.h>
#import <React/RCTPerformanceLogger.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import <RNPerformanceSpec/RNPerformanceSpec.h>
#endif

static CFTimeInterval RNPerformanceGetProcessStartTime()
{
    size_t len = 4;
    int mib[len];
    struct kinfo_proc kp;

    sysctlnametomib("kern.proc.pid", mib, &len);
    mib[3] = getpid();
    len = sizeof(kp);
    sysctl(mib, 4, &kp, &len, NULL, 0);

    struct timeval startTime = kp.kp_proc.p_un.__p_starttime;
    return startTime.tv_sec + startTime.tv_usec / 1e6;
}

static int64_t RNPerformanceGetTimestamp()
{
    return std::chrono::system_clock::now().time_since_epoch() / std::chrono::milliseconds(1);
}

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
    sNativeLaunchStart = (RNPerformanceGetProcessStartTime() - [NSDate date].timeIntervalSince1970) * 1000 + RNPerformanceGetTimestamp();
    sNativeLaunchEnd = RNPerformanceGetTimestamp();
}

- (void)setBridge:(RCTBridge *)bridge
{
    [super setBridge:bridge];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(contentDidAppear)
                                                 name:RCTContentDidAppearNotification
                                               object:nil];
}

- (void)contentDidAppear
{
    if(didEmit != YES) {
        [self emitMarks];
    }
}

- (void)emitMarks
{
    didEmit = YES;
    [self emitMarkNamed:@"nativeLaunchStart" withStartTime:sNativeLaunchStart];
    [self emitMarkNamed:@"nativeLaunchEnd" withStartTime:sNativeLaunchEnd];
    [self emitTag:RCTPLScriptDownload withNamePrefix:@"download"];
    [self emitTag:RCTPLScriptExecution withNamePrefix:@"runJsBundle"];
    [self emitTag:RCTPLBridgeStartup withNamePrefix:@"bridgeSetup"];
    [self emitMarkNamed:@"contentAppeared" withMediaTime:[self.bridge.performanceLogger valueForTag:RCTPLTTI]];
    [self emitMetricNamed:@"bundleSize" withValue:@([self.bridge.performanceLogger valueForTag:RCTPLBundleSize])];
}

- (NSArray<NSString *> *)supportedEvents
{
    return @[ @"mark", @"metric" ];
}

- (void)invalidate
{
    [super invalidate];
    NSNotificationCenter *notificationCenter = NSNotificationCenter.defaultCenter;
    [notificationCenter removeObserver:self];
}

- (void)startObserving
{
    hasListeners = YES;
    if (didEmit != YES && [self.bridge.performanceLogger valueForTag:RCTPLTTI] != 0) {
        [self emitMarks];
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
    if (hasListeners) {
        [self sendEventWithName:@"mark" body:@{
            @"name": name,
            @"startTime": @(startTime)
        }];
    }
}

- (void)emitMetricNamed:(NSString *)name withValue:(NSNumber *)value
{
    if (hasListeners) {
        [self sendEventWithName:@"metric" body:@{
            @"name": name,
            @"startTime": @(RNPerformanceGetTimestamp()),
            @"value": value
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
