typedef enum EntryType : NSUInteger {
    kMark,
    kMetric
} EntryType;

@interface RNPerformanceEntry: NSObject

@property (nonatomic, copy, readonly) NSString * _Nonnull name;
@property (nonatomic, assign, readonly) EntryType type;
@property (nonatomic, assign, readonly) int64_t startTime;
@property (nonatomic, assign, readonly) BOOL ephemeral;
@property (nonatomic, copy, readonly) NSDictionary * _Nullable detail;

@end

@interface RNPerformanceMark: RNPerformanceEntry

- (id)initWithName:(nonnull NSString *)name startTime:(int64_t)startTime detail:(nullable NSDictionary *)detail ephemeral:(BOOL)ephemeral;

@end

@interface RNPerformanceMetric: RNPerformanceEntry

@property (nonatomic, copy, readonly) NSNumber * _Nonnull value;

- (id)initWithName:(nonnull NSString *)name value:(nonnull NSNumber *)value startTime:(int64_t)startTime detail:(nullable NSDictionary *)detail ephemeral:(BOOL)ephemeral;

@end
