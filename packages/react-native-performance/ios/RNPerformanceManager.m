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

static int64_t sNativeLaunchStart;
static int64_t sNativeLaunchEnd;

@implementation RNPerformanceManager
{
    bool hasListeners;
}

RCT_EXPORT_MODULE();

+ (void) initialize
{
    [super initialize];
    CFTimeInterval absoluteTimeToRelativeTime =  CACurrentMediaTime() - [NSDate date].timeIntervalSince1970;
    sNativeLaunchStart = (getProcessStartTime() + absoluteTimeToRelativeTime) * 1000;
    sNativeLaunchEnd = CACurrentMediaTime() * 1000;
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
    int64_t startTime = CACurrentMediaTime() * 1000;
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
    int64_t duration = [self.bridge.performanceLogger durationForTag:tag];
    int64_t end = [self.bridge.performanceLogger valueForTag:tag];
    if (duration == 0 || end == 0) {
        NSLog(@"Ignoring marks prefixed %@ (%lu) as data is unavailable (duration: %lld, end: %lld)", namePrefix, (unsigned long)tag, duration, end);
        return;
    }
    [self emitMarkNamed:[namePrefix stringByAppendingString:@"Start"] withStartTime:end-duration];
    [self emitMarkNamed:[namePrefix stringByAppendingString:@"End"] withStartTime:end];
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
            @"startTime": @(CACurrentMediaTime() * 1000),
            @"value": value
        }];
    }
}

@end
