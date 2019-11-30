#import "FlipperReactPerformancePlugin.h"
#import <sys/sysctl.h>
#include <math.h>
#import <QuartzCore/QuartzCore.h>
#import <FlipperKit/FlipperClient.h>
#import <FlipperKit/FlipperConnection.h>
#import <FlipperKit/FlipperResponder.h>
#import <React/RCTRootView.h>

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
{
    CFTimeInterval nativeStartTime;
    CFTimeInterval javascriptLoadTime;
    CFTimeInterval contentAppearTime;
}
@property (strong, nonatomic) id<FlipperConnection> connection;

@end

@implementation FlipperReactPerformancePlugin

- (instancetype)init {
    if (self = [super init]) {
        CFTimeInterval absoluteTimeToRelativeTime =  CACurrentMediaTime() - [NSDate date].timeIntervalSince1970;
        sPreMainStartTimeRelative = getProcessStartTime() + absoluteTimeToRelativeTime;
        nativeStartTime = CACurrentMediaTime() - sPreMainStartTimeRelative;
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
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(bridgeDidReload)
                                                 name:RCTJavaScriptWillStartLoadingNotification
                                               object:bridge];

    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(javaScriptDidLoad)
                                                 name:RCTJavaScriptDidLoadNotification
                                               object:bridge];

    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(contentDidAppear)
                                                 name:RCTContentDidAppearNotification
                                               object:UIApplication.sharedApplication.keyWindow.rootViewController.view];

}

- (void)bridgeDidReload {
    javascriptLoadTime = 0;
    contentAppearTime = 0;
}

- (void)javaScriptDidLoad {
    javascriptLoadTime = CACurrentMediaTime();
    contentAppearTime = 0;
    [self emitMeasurements];
}

- (void)contentDidAppear {
    contentAppearTime = CACurrentMediaTime();
    [self emitMeasurements];
}

- (void)emitMeasurements {
    if (!self.connection) {
        return;
    }
    CFTimeInterval reactStartTime = contentAppearTime - javascriptLoadTime;
    [self.connection send:@"measurements" withParams:@{
        @"nativeStartTime": @(nativeStartTime * 1000),
        @"reactStartTime": reactStartTime > 0 ? @(reactStartTime * 1000) : [NSNull null]
    }];
}

- (void)didConnect:(id<FlipperConnection>)connection {
    self.connection = connection;
    [self emitMeasurements];
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

@end
