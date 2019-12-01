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
}

- (instancetype)init {
    if (self = [super init]) {
        CFTimeInterval absoluteTimeToRelativeTime =  CACurrentMediaTime() - [NSDate date].timeIntervalSince1970;
        sPreMainStartTimeRelative = getProcessStartTime() + absoluteTimeToRelativeTime;
        _bridge = nil;
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
                           selector:@selector(emitSafely)
                               name:RCTJavaScriptWillStartLoadingNotification
                             object:bridge];
    [notificationCenter addObserver:self
                           selector:@selector(emitSafely)
                               name:RCTJavaScriptDidLoadNotification
                             object:bridge];
    [notificationCenter addObserver:self
                           selector:@selector(emitSafely)
                               name:RCTBridgeDidDownloadScriptNotification
                             object:bridge];
    [notificationCenter addObserver:self
                           selector:@selector(emitSafely)
                               name:RCTContentDidAppearNotification
                             object:nil];
}

- (NSObject *)getDurationForTag:(RCTPLTag)tag {
    int64_t value = [self.bridge.performanceLogger durationForTag:tag];
    if (value > 0) {
        return  @(value);
    }
    return [NSNull null];
}

- (NSObject *)getValueForTag:(RCTPLTag)tag {
    int64_t value = [self.bridge.performanceLogger valueForTag:tag];
    if (value > 0) {
        return  @(value);
    }
    return [NSNull null];
}

- (void)emitSafely {
    if (!self.connection || !self.bridge) {
        return;
    }
    
    [self.connection send:@"measurements" withParams:@{
        @"NativeStartup": @(_nativeStartupDuration * 1000),
        @"BundleSize": [self getValueForTag:RCTPLBundleSize],
        @"ScriptDownload": [self getDurationForTag:RCTPLScriptDownload],
        @"ScriptExecution": [self getDurationForTag:RCTPLScriptExecution],
        @"TTI": [self getDurationForTag:RCTPLTTI],
    }];
}

- (void)didConnect:(id<FlipperConnection>)connection {
    self.connection = connection;
    [self emitSafely];
}

- (void)didDisconnect {
    self.connection = nil;
}

- (NSString *)identifier {
    return @"flipper-plugin-react-native-performance";
}

- (BOOL)runInBackground {
    return NO;
}

- (void)dealloc
{
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

@end
