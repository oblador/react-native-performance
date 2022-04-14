#include <math.h>
#include <chrono>

static int64_t RNPerformanceGetTimestamp()
{
    return std::chrono::system_clock::now().time_since_epoch() / std::chrono::milliseconds(1);
}

NSString * _Nonnull const RNPerformanceMarkWasSetNotification = @"RNPerformanceMarkWasSetNotification";

@interface RNPerformanceMarks: NSObject

+ (RNPerformanceMarks *_Nonnull)sharedInstance;
- (void)setMarkNamed:(nonnull NSString *)markName;
- (NSDictionary<NSString *, NSNumber *>*_Nonnull) marks;

@end
