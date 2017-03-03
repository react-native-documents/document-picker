#if __has_include(<React/RCTBridgeModule.h>)
#import <React/RCTBridgeModule.h>
#else // back compatibility for RN version < 0.40
#import "RCTBridgeModule.h"
#endif

@import UIKit;

@interface RNDocumentPicker : NSObject <RCTBridgeModule>

@end
