#import "FlipperReactPerformancePlugin.h"
#import <sys/sysctl.h>
#include <math.h>
#import <QuartzCore/QuartzCore.h>
#import <FlipperKit/FlipperClient.h>
#import <FlipperKit/FlipperConnection.h>
#import <FlipperKit/FlipperResponder.h>
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

static CFTimeInterval sPreMainStartTimeRelative;

@interface FlipperReactPerformancePlugin ()

@property (strong, nonatomic) id<FlipperConnection> connection;
@property (weak, nonatomic) RCTBridge *bridge;

@end

@implementation FlipperReactPerformancePlugin
{
    CFTimeInterval _nativeStartupDuration;
    NSTimeInterval _sessionStartTime;
}

- (instancetype)init {
    if (self = [super init]) {
        CFTimeInterval absoluteTimeToRelativeTime =  CACurrentMediaTime() - [NSDate date].timeIntervalSince1970;
        sPreMainStartTimeRelative = getProcessStartTime() + absoluteTimeToRelativeTime;
        _bridge = nil;
        _sessionStartTime = [NSDate date].timeIntervalSince1970;
        _nativeStartupDuration = CACurrentMediaTime() - sPreMainStartTimeRelative;
    }
    return self;
}

+ (instancetype)sharedInstance {
    static FlipperReactPerformancePlugin *sInstance = nil;
    
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sInstance = [FlipperReactPerformancePlugin new];
    });
    
    return sInstance;
}

- (void)setBridge:(RCTBridge *)bridge {
    _bridge = bridge;
    NSNotificationCenter *notificationCenter = NSNotificationCenter.defaultCenter;
    [notificationCenter addObserver:self
                           selector:@selector(scriptWillLoad)
                               name:RCTJavaScriptWillStartLoadingNotification
                             object:bridge];
    [notificationCenter addObserver:self
                           selector:@selector(sendMeasurements)
                               name:RCTJavaScriptDidLoadNotification
                             object:bridge];
    [notificationCenter addObserver:self
                           selector:@selector(sendMeasurements)
                               name:RCTBridgeDidDownloadScriptNotification
                             object:bridge];
    [notificationCenter addObserver:self
                           selector:@selector(sendMeasurements)
                               name:RCTContentDidAppearNotification
                             object:nil];
}

- (void)scriptWillLoad {
    _sessionStartTime = [NSDate date].timeIntervalSince1970;
    [self sendMeasurements];
}

- (NSObject *)getDurationForTag:(RCTPLTag)tag {
    if (self.bridge) {
        int64_t value = [self.bridge.performanceLogger durationForTag:tag];
        if (value > 0) {
            return  @(value);
        }
    }
    return [NSNull null];
}

- (NSObject *)getValueForTag:(RCTPLTag)tag {
    if (self.bridge) {
        int64_t value = [self.bridge.performanceLogger valueForTag:tag];
        if (value > 0) {
            return  @(value);
        }
    }
    return [NSNull null];
}

- (void)sendSafely:(NSString *)method withParams:(NSDictionary *)params {
    if (!self.connection) {
        return;
    }
    [self.connection send:method withParams:params];
}

- (void)sendMeasurements {
    [self sendSafely:@"measurements" withParams:@{
        @"sessionStartedAt": @(ceil(_sessionStartTime * 1000)),
        @"nativeStartup": @(_nativeStartupDuration * 1000),
        @"bundleSize": [self getValueForTag:RCTPLBundleSize],
        @"scriptDownload": [self getDurationForTag:RCTPLScriptDownload],
        @"scriptExecution": [self getDurationForTag:RCTPLScriptExecution],
        @"tti": [self getDurationForTag:RCTPLTTI],
    }];
}

- (void)didConnect:(id<FlipperConnection>)connection {
    self.connection = connection;
    [self sendMeasurements];
}

- (void)didDisconnect {
    self.connection = nil;
}

- (NSString *)identifier {
    return @"flipper-plugin-react-native-performance";
}

- (BOOL)runInBackground {
    return YES;
}

- (void)dealloc {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

@end
