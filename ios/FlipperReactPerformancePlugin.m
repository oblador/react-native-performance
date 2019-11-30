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

@property (strong, nonatomic) id<FlipperConnection> connection;

@end

@implementation FlipperReactPerformancePlugin
{
    CFTimeInterval _nativeStartTime;
    CFTimeInterval _javascriptDownloadStart;
    CFTimeInterval _javascriptDownloadEnd;
    CFTimeInterval _javascriptLoadEnd;
    CFTimeInterval _contentAppearTime;
}

- (instancetype)init {
    if (self = [super init]) {
        CFTimeInterval absoluteTimeToRelativeTime =  CACurrentMediaTime() - [NSDate date].timeIntervalSince1970;
        sPreMainStartTimeRelative = getProcessStartTime() + absoluteTimeToRelativeTime;
        _nativeStartTime = CACurrentMediaTime() - sPreMainStartTimeRelative;
        _javascriptDownloadStart = 0;
        _javascriptDownloadEnd = 0;
        _javascriptLoadEnd = 0;
        _contentAppearTime = 0;
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
    [self javaScriptWillDownload];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                              selector:@selector(bridgeDidReload)
                                                  name:RCTJavaScriptWillStartLoadingNotification
                                                object:bridge];
    
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(javaScriptDidLoad)
                                                 name:RCTJavaScriptDidLoadNotification
                                               object:bridge];

    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(javaScriptWillDownload)
                                                 name:RCTBridgeWillDownloadScriptNotification
                                               object:bridge];

    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(javaScriptDidDownload)
                                                 name:RCTBridgeDidDownloadScriptNotification
                                               object:bridge];

    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(contentDidAppear)
                                                 name:RCTContentDidAppearNotification
                                               object:UIApplication.sharedApplication.keyWindow.rootViewController.view];
}

- (void)bridgeDidReload {
    _javascriptDownloadStart = 0;
    _javascriptDownloadEnd = 0;
    _javascriptLoadEnd = 0;
    _contentAppearTime = 0;
    [self emitMeasurements];
}

- (void)javaScriptWillDownload {
    _javascriptDownloadStart = CACurrentMediaTime();
    _javascriptDownloadEnd = 0;
}

- (void)javaScriptDidDownload {
    _javascriptDownloadEnd = CACurrentMediaTime();
    [self emitMeasurements];
}

- (void)javaScriptDidLoad {
    _javascriptLoadEnd = CACurrentMediaTime();
    [self emitMeasurements];
}

- (void)contentDidAppear {
    _contentAppearTime = CACurrentMediaTime();
    [self emitMeasurements];
}

- (void)emitMeasurements {
    if (!self.connection) {
        return;
    }
    NSObject *javascriptDownloadDuration = _javascriptDownloadEnd > 0 && _javascriptDownloadStart > 0 ? @((_javascriptDownloadEnd - _javascriptDownloadStart) * 1000) : [NSNull null];
    NSObject *javascriptParseDuration = _javascriptDownloadEnd > 0 && _javascriptLoadEnd > 0 ? @((_javascriptLoadEnd - _javascriptDownloadEnd) * 1000) : [NSNull null];
    NSObject *reactStartDuration = _javascriptLoadEnd > 0 && _contentAppearTime > 0 ? @((_contentAppearTime - _javascriptLoadEnd) * 1000) : [NSNull null];

    [self.connection send:@"measurements" withParams:@{
        @"nativeStartDuration": @(_nativeStartTime * 1000),
        @"javascriptDownloadDuration": javascriptDownloadDuration,
        @"javascriptParseDuration": javascriptParseDuration,
        @"reactStartDuration": reactStartDuration
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
        
- (void)dealloc
{
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

@end
