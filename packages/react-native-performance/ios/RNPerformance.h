#import "RNPerformanceEntry.h"

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
