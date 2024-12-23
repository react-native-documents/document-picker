// LICENSE: see License.md in the package root

#ifdef RCT_NEW_ARCH_ENABLED
#import <rndocumentviewerCGen/rndocumentviewerCGen.h>
#else
#import <React/RCTBridgeModule.h>
#endif

#import <QuickLook/QuickLook.h>

@interface RNDocumentViewer : NSObject <
#ifdef RCT_NEW_ARCH_ENABLED
        NativeDocumentViewerSpec, QLPreviewControllerDelegate
#else
        RCTBridgeModule, QLPreviewControllerDelegate
#endif
    >


@end
