// LICENSE: see License.md in the package root


#ifdef RCT_NEW_ARCH_ENABLED
#import <rndocumentpickerCGen/rndocumentpickerCGen.h>
#else
#import <React/RCTBridgeModule.h>
#endif

@interface RNDocumentPicker : NSObject <
#ifdef RCT_NEW_ARCH_ENABLED
        NativeDocumentPickerSpec
#else
        RCTBridgeModule
#endif
    >


@end
