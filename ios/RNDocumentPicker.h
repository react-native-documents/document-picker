#ifdef RCT_NEW_ARCH_ENABLED
#import <rndocumentpicker/rndocumentpicker.h>
#else
#import <React/RCTBridgeModule.h>
#endif

#import <UIKit/UIKit.h>

@interface RNDocumentPicker : NSObject <
#ifdef RCT_NEW_ARCH_ENABLED
        NativeDocumentPickerSpec
#else
        RCTBridgeModule
#endif
    >

@end
