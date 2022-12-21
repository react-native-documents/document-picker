#import <React/RCTConvert.h>

#if __has_include(<UIKit/UIKit.h>)
@import UIKit;
#endif

@interface RCTConvert(RNDocumentPicker)

#if __has_include(<UIKit/UIKit.h>)
+ (UIModalPresentationStyle)UIModalPresentationStyle:(NSString*)value;
+ (UIModalTransitionStyle)UIModalTransitionStyle:(NSString*)value;
#endif
@end
