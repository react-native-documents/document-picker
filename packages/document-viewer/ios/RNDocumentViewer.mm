// LICENSE: see License.md in the package root

#import "RNDocumentViewer.h"
#import <React/RCTUtils.h>
#import "RNDPreviewController.h"
#import <React/RCTConvert.h>

static NSString * const RNDocViewerErrorUnableToOpenFileType = @"UNABLE_TO_OPEN_FILE_TYPE";
static NSString * const RNDocViewerErrorNullPresenter = @"NULL_PRESENTER";

@interface RNDocumentViewer ()
@property(nonatomic, nullable) NSURL *presentedUrl;
@end

@implementation RNDocumentViewer {
}

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(viewDocument:(NSString *)bookmarkOrUri
                  permissions:(NSString *)permissions
                     mimeType:(NSString *)mimeType
                        title:(NSString *)title
         androidApplicationId:(NSString *)androidApplicationId
            presentationStyle:(NSString *)presentationStyle
                      resolve:(RCTPromiseResolveBlock)resolve
                       reject:(RCTPromiseRejectBlock)reject) {
  UIModalPresentationStyle _presentationStyle = [RCTConvert UIModalPresentationStyle:presentationStyle];

  if ([bookmarkOrUri hasPrefix:@"file://"]) {
    NSURL *restoredURL = [[NSURL alloc] initWithString:bookmarkOrUri];
    [self presentPreview:title restoredURL:restoredURL presentationStyle:_presentationStyle resolve:resolve reject:reject];
  } else {
    NSData *bookmarkData = [[NSData alloc] initWithBase64EncodedString:bookmarkOrUri options:0];

    NSError *error = nil;
    BOOL isStale = NO;

    NSURL *restoredURL = [NSURL URLByResolvingBookmarkData:bookmarkData
                                                   options:NSURLBookmarkResolutionWithoutUI
                                             relativeToURL:nil
                                       bookmarkDataIsStale:&isStale
                                                     error:&error];
    if (!error) {
      // TODO error codes
      if (isStale) {
        // TODO On return, if YES, the bookmark data is stale. Your app should create a new bookmark using the returned URL and use it in place of any stored copies of the existing bookmark.
        reject(@"RNDocViewer", @"Bookmark was resolved but it's stale", nil);
        return;
      }
      if ([restoredURL startAccessingSecurityScopedResource]) {
        [self presentPreview:title restoredURL:restoredURL presentationStyle:_presentationStyle resolve:resolve reject:reject];
      } else {
        reject(@"RNDocViewer", @"Could not access the security-scoped resource", nil);
      }
    } else {
      reject(@"RNDocViewer", @"Unable to resolve the bookmark", error);
    }
  }
}

- (void)presentPreview:(NSString *)title
           restoredURL:(NSURL *)restoredURL
     presentationStyle:(UIModalPresentationStyle) presentationStyle
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject {
  RNDPreviewItem *item = [[RNDPreviewItem alloc] initWithURL:restoredURL title:title];
  
  dispatch_async(dispatch_get_main_queue(), ^{
    QLPreviewController *controller = [[RNDPreviewController alloc] initWithPreviewItem:item];
    controller.modalPresentationStyle = presentationStyle;
    controller.delegate = self;

    if ([QLPreviewController canPreviewItem:item]) {
      UIViewController* presenter = RCTPresentedViewController();
      if (presenter) {
        [presenter presentViewController:controller animated:YES completion:nil];
        resolve([NSNull null]);
      } else {
        reject(RNDocViewerErrorNullPresenter, @"RCTPresentedViewController was nil", nil);
      }
    } else {
      [self.presentedUrl stopAccessingSecurityScopedResource];
      reject(RNDocViewerErrorUnableToOpenFileType, @"unsupported file", nil);
    }
  });
}

- (void)previewControllerDidDismiss:(QLPreviewController *)controller {
  [self.presentedUrl stopAccessingSecurityScopedResource];
}

// Thanks to this guard, we won't compile this code when we build for the old architecture.
#ifdef RCT_NEW_ARCH_ENABLED

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
(const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeDocumentViewerSpecJSI>(params);
}

#endif

@end
