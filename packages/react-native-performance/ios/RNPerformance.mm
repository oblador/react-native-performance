#import "RNPerformance.h"
#import "RNPerformanceEntry.h"

@implementation RNPerformance
{
    NSMutableArray<RNPerformanceEntry *> *_entries;
}

static RNPerformance *_sharedInstance = nil;

+ (RNPerformance *)sharedInstance
{
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        _sharedInstance = [[self alloc] init];

    });

    return _sharedInstance;
}

- (id)init
{
 if (self = [super init]) {
     _entries = [NSMutableArray new];
 }
  return self;
}

- (void)mark:(nonnull NSString *)name
{
    [self mark:name detail:nil];
}

- (void)mark:(nonnull NSString *)name ephemeral:(BOOL)ephemeral
{
    [self mark:name detail:nil ephemeral:ephemeral];
}

- (void)mark:(nonnull NSString *)name detail:(nullable NSDictionary *)detail
{
    [self mark:name detail:detail ephemeral:YES];
}

- (void)mark:(nonnull NSString *)name detail:(nullable NSDictionary *)detail ephemeral:(BOOL)ephemeral
{
    RNPerformanceMark *mark = [[RNPerformanceMark alloc] initWithName:name startTime:RNPerformanceGetTimestamp() detail:detail ephemeral:ephemeral];
    [self addEntry:mark];
}

- (void)metric:(nonnull NSString *)name value:(nonnull NSNumber *)value
{
    [self metric:name value:value detail:nil];
}

- (void)metric:(nonnull NSString *)name value:(nonnull NSNumber *)value ephemeral:(BOOL)ephemeral
{
    [self metric:name value:value detail:nil ephemeral:ephemeral];
}

- (void)metric:(nonnull NSString *)name value:(nonnull NSNumber *)value detail:(nullable NSDictionary *)detail
{
    [self metric:name value:value detail:detail ephemeral:YES];
}

- (void)metric:(nonnull NSString *)name value:(nonnull NSNumber *)value detail:(nullable NSDictionary *)detail ephemeral:(BOOL)ephemeral
{
    RNPerformanceMetric *metric = [[RNPerformanceMetric alloc] initWithName:name value:value startTime:RNPerformanceGetTimestamp() detail:detail ephemeral:ephemeral];
    [self addEntry:metric];
}

- (void)addEntry:(nonnull RNPerformanceEntry *)entry
{
    [_entries addObject:entry];
    NSNotification *notification = [[NSNotification alloc] initWithName:RNPerformanceEntryWasAddedNotification object:nil userInfo:@{ @"entry": entry }];
    [NSNotificationCenter.defaultCenter postNotification:notification];
}

- (NSArray<RNPerformanceMark *>*)getEntries
{
    return [[NSArray alloc] initWithArray:_entries];
}

- (void)clearEntries
{
    [_entries removeAllObjects];
}

- (void)clearEntries:(nonnull NSString *)name
{
    [_entries enumerateObjectsUsingBlock:^(RNPerformanceEntry * _Nonnull entry, NSUInteger idx, BOOL * _Nonnull stop) {
        if([entry.name isEqualToString:name]) {
            [_entries removeObject:entry];
        }
    }];
}

- (void)clearEphemeralEntries
{
    [_entries enumerateObjectsUsingBlock:^(RNPerformanceEntry * _Nonnull entry, NSUInteger idx, BOOL * _Nonnull stop) {
        if(entry.ephemeral) {
            [_entries removeObject:entry];
        }
    }];
}

@end
