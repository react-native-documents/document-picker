#import <React/RCTConvert.h>

#if __has_include(<UIKit/UIKit.h>)
@import UIKit;
#endif

@interface RCTConvert(RNDocumentPicker)

+ (UIModalPresentationStyle)UIModalPresentationStyle:(NSString*)value;
+ (UIModalTransitionStyle)UIModalTransitionStyle:(NSString*)value;

@end
