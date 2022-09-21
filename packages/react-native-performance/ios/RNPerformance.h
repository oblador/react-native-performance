#import "RNPerformanceEntry.h"
#include <chrono>

static int64_t RNPerformanceGetTimestamp()
{
    // Copied from https://github.com/facebook/react-native/blob/main/React/CxxBridge/RCTJSIExecutorRuntimeInstaller.mm#L25
    auto time = std::chrono::steady_clock::now();
    auto duration = std::chrono::duration_cast<std::chrono::nanoseconds>(
                        time.time_since_epoch())
                        .count();

    constexpr double NANOSECONDS_IN_MILLISECOND = 1000000.0;

    return duration / NANOSECONDS_IN_MILLISECOND;
}

NSString * _Nonnull const RNPerformanceEntryWasAddedNotification = @"RNPerformanceEntryWasAdded";

@interface RNPerformance: NSObject

+ (RNPerformance *_Nonnull)sharedInstance;
- (void)mark:(nonnull NSString *)markName;
- (void)mark:(nonnull NSString *)markName ephemeral:(BOOL)ephemeral;
- (void)mark:(nonnull NSString *)markName detail:(nullable NSDictionary *)detail;
- (void)mark:(nonnull NSString *)markName detail:(nullable NSDictionary *)detail ephemeral:(BOOL)ephemeral;
- (void)metric:(nonnull NSString *)metricName value:(nonnull NSNumber *)value;
- (void)metric:(nonnull NSString *)metricName value:(nonnull NSNumber *)value ephemeral:(BOOL)ephemeral;
- (void)metric:(nonnull NSString *)metricName value:(nonnull NSNumber *)value detail:(nullable NSDictionary *)detail;
- (void)metric:(nonnull NSString *)metricName value:(nonnull NSNumber *)value detail:(nullable NSDictionary *)detail ephemeral:(BOOL)ephemeral;
- (NSArray<RNPerformanceEntry *>*_Nonnull)getEntries;
- (void)clearEntries;
- (void)clearEntries:(nonnull NSString *)name;
- (void)clearEphemeralEntries;

@end
