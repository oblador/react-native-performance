#import <UIKit/UIKit.h>
#import <XCTest/XCTest.h>

#import <React/RCTLog.h>
#import <React/RCTRootView.h>

#define TIMEOUT_SECONDS 60

@interface ExampleTests : XCTestCase

@end

@implementation ExampleTests

- (BOOL)findSubviewInView:(UIView *)view matching:(BOOL(^)(UIView *view))test
{
  if (test(view)) {
    return YES;
  }
  for (UIView *subview in [view subviews]) {
    if ([self findSubviewInView:subview matching:test]) {
      return YES;
    }
  }
  return NO;
}

- (BOOL)hasSubview:(UIView *)view withText:(NSString *)text
{
  return [self findSubviewInView:view matching:^BOOL(UIView *view) {
    if ([view.accessibilityLabel containsString:text]) {
      return YES;
    }
    return NO;
  }];
}


- (void)testRendersNativeMarks
{
  UIViewController *vc = [[[RCTSharedApplication() delegate] window] rootViewController];
  NSDate *date = [NSDate dateWithTimeIntervalSinceNow:TIMEOUT_SECONDS];
  NSArray<NSString *>* marks = @[
    @"nativeLaunchStart",
    @"nativeLaunchEnd",
    @"bridgeSetupStart",
    @"bridgeSetupEnd",
    @"contentAppeared"
  ];
  
  BOOL foundElements = NO;

  __block NSString *redboxError = nil;
#ifdef DEBUG
  RCTSetLogFunction(^(RCTLogLevel level, RCTLogSource source, NSString *fileName, NSNumber *lineNumber, NSString *message) {
    if (level >= RCTLogLevelError) {
      redboxError = message;
    }
  });
#endif

  while ([date timeIntervalSinceNow] > 0 && !foundElements && !redboxError) {
    [[NSRunLoop mainRunLoop] runMode:NSDefaultRunLoopMode beforeDate:[NSDate dateWithTimeIntervalSinceNow:0.1]];
    [[NSRunLoop mainRunLoop] runMode:NSRunLoopCommonModes beforeDate:[NSDate dateWithTimeIntervalSinceNow:0.1]];
    for (NSString *mark in marks) {
      foundElements = foundElements || [self hasSubview:vc.view withText:mark];
    }
  }

#ifdef DEBUG
  RCTSetLogFunction(RCTDefaultLogFunction);
#endif

  XCTAssertNil(redboxError, @"RedBox error: %@", redboxError);
  XCTAssertTrue(foundElements, @"Couldn't find all of the following native marks '%@' in %d seconds", [marks componentsJoinedByString:@", "], TIMEOUT_SECONDS);
}

@end
