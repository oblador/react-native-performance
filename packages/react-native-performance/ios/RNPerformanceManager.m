#import "RNPerformanceManager.h"
#import <sys/sysctl.h>
#include <math.h>
#import <QuartzCore/QuartzCore.h>
#import <React/RCTRootView.h>
#import <React/RCTPerformanceLogger.h>

static CFTimeInterval getProcessStartTime() {
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

static CFTimeInterval sNativeLaunchStart;
static CFTimeInterval sNativeLaunchEnd;

@implementation RNPerformanceManager
{
    bool hasListeners;
}

RCT_EXPORT_MODULE();

+ (void) initialize
{
    [super initialize];
    CFTimeInterval absoluteTimeToRelativeTime =  CACurrentMediaTime() - [NSDate date].timeIntervalSince1970;
    sNativeLaunchStart = getProcessStartTime() + absoluteTimeToRelativeTime;
    sNativeLaunchEnd = CACurrentMediaTime();
}

- (void)setBridge:(RCTBridge *)bridge
{
    [super setBridge:bridge];
    NSNotificationCenter *notificationCenter = NSNotificationCenter.defaultCenter;
    [notificationCenter addObserver:self
                           selector:@selector(contentDidAppear)
                               name:RCTContentDidAppearNotification
                             object:nil];
}

- (void)contentDidAppear
{
    CFTimeInterval startTime = CACurrentMediaTime();
    [self emitMarkNamed:@"nativeLaunchStart" withStartTime:sNativeLaunchStart];
    [self emitMarkNamed:@"nativeLaunchEnd" withStartTime:sNativeLaunchEnd];
    [self emitTag:RCTPLScriptDownload withNamePrefix:@"download"];
    [self emitTag:RCTPLScriptExecution withNamePrefix:@"runJsBundle"];
    [self emitTag:RCTPLBridgeStartup withNamePrefix:@"bridgeSetup"];
    [self emitMarkNamed:@"contentAppeared" withStartTime:startTime];
    [self emitMetricNamed:@"bundleSize" withValue:@([self.bridge.performanceLogger valueForTag:RCTPLBundleSize])];
}

- (NSArray<NSString *> *)supportedEvents
{
    return @[ @"mark", @"metric" ];
}

- (void)invalidate
{
    NSNotificationCenter *notificationCenter = NSNotificationCenter.defaultCenter;
    [notificationCenter removeObserver:self];
}

- (void)startObserving
{
    hasListeners = YES;
}

-(void)stopObserving
{
    hasListeners = NO;
}

- (void)emitTag:(RCTPLTag)tag withNamePrefix:(NSString *)namePrefix
{
    CFTimeInterval duration = ([self.bridge.performanceLogger durationForTag:tag] / 1000.f);
    CFTimeInterval end = [self.bridge.performanceLogger valueForTag:tag] / 1000.f;
    if (duration == 0.0f || end == 0.0f) {
        NSLog(@"Ignoring marks prefixed %@ (%lu) as data is unavailable (duration: %f, end: %f)", namePrefix, (unsigned long)tag, duration, end);
        return;
    }
    CFTimeInterval start = end - duration;
    [self emitMarkNamed:[namePrefix stringByAppendingString:@"Start"] withStartTime:start];
    [self emitMarkNamed:[namePrefix stringByAppendingString:@"End"] withStartTime:end];
}

- (void)emitMarkNamed:(NSString *)name withStartTime:(CFTimeInterval)startTime
{
    if (hasListeners) {
        [self sendEventWithName:@"mark" body:@{
            @"name": name,
            @"startTime": @(startTime * 1000.f)
        }];
    }
}

- (void)emitMetricNamed:(NSString *)name withValue:(NSNumber *)value
{
    if (hasListeners) {
        [self sendEventWithName:@"metric" body:@{
            @"name": name,
            @"startTime": @(CACurrentMediaTime()),
            @"value": value
        }];
    }
}

@end
