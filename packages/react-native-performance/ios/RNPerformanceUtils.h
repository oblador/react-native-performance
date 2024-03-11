#ifndef RNPerformanceUtils_h
#define RNPerformanceUtils_h

#import <React/RCTDefines.h>

RCT_EXTERN NSString * _Nonnull const RNPerformanceEntryWasAddedNotification;

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

#endif /* RNPerformanceUtils_h */
