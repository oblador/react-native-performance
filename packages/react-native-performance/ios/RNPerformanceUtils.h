#ifndef RNPerformanceUtils_h
#define RNPerformanceUtils_h

#import <React/RCTDefines.h>
#import <QuartzCore/QuartzCore.h>

RCT_EXTERN NSString * _Nonnull const RNPerformanceEntryWasAddedNotification;

static int64_t RNPerformanceGetTimestamp()
{
    // Must be the same clock JS `performance.now()` reads, or every mark is
    // offset against performance.timeOrigin. On Apple platforms React Native
    // resolves HighResTimeStamp::now() to mach_absolute_time(), which is what
    // CACurrentMediaTime() reports -- see chronoNow() in
    // ReactCommon/react/timing/primitives.h.
    //
    // std::chrono::steady_clock is NOT that clock here: on Darwin it maps to
    // CLOCK_MONOTONIC_RAW, which keeps counting while the device is asleep,
    // so marks taken with it run ahead of performance.now() by the device's
    // accumulated sleep time since boot. (Older React Native installed
    // performance.now() from RCTJSIExecutorRuntimeInstaller.mm using
    // steady_clock, which is why the two used to agree.)
    return CACurrentMediaTime() * 1000;
}

#endif /* RNPerformanceUtils_h */
