// LICENSE: see License.md in the package root

#import "RNDocumentViewer.h"
#import <React/RCTUtils.h>
#import "RNDPreviewItem.h"

@interface RNDocumentViewer ()
@property(nonatomic, nullable) NSURL *presentedUrl;
@property(nonatomic, nullable) QLPreviewPanel *previewPanel;
@property(nonatomic, nullable) RNDPreviewItem *currentPreviewItem;
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
            presentationStyle:(NSString *)presentationStyle
                      resolve:(RCTPromiseResolveBlock)resolve
                       reject:(RCTPromiseRejectBlock)reject) {
  
  if ([bookmarkOrUri hasPrefix:@"file://"]) {
    NSURL *restoredURL = [[NSURL alloc] initWithString:bookmarkOrUri];
    [self presentPreview:title restoredURL:restoredURL resolve:resolve reject:reject];
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
        [self presentPreview:title restoredURL:restoredURL resolve:resolve reject:reject];
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
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject {
  
  self.currentPreviewItem = [[RNDPreviewItem alloc] initWithURL:restoredURL title:title];
  self.presentedUrl = restoredURL;
  
  dispatch_async(dispatch_get_main_queue(), ^{
    if ([QLPreviewPanel canPreviewItem:self.currentPreviewItem]) {
      self.previewPanel = [QLPreviewPanel sharedPreviewPanel];
      self.previewPanel.delegate = self;
      self.previewPanel.dataSource = self;
      
      [self.previewPanel makeKeyAndOrderFront:nil];
      resolve([NSNull null]);
    } else {
      [self.presentedUrl stopAccessingSecurityScopedResource];
      reject(@"UNABLE_TO_OPEN_FILE_TYPE", @"unsupported file", nil);
    }
  });
}

#pragma mark - QLPreviewPanelDelegate

- (void)previewPanelDidClose:(QLPreviewPanel *)panel {
  [self.presentedUrl stopAccessingSecurityScopedResource];
  self.previewPanel = nil;
  self.currentPreviewItem = nil;
  self.presentedUrl = nil;
}

#pragma mark - QLPreviewPanelDataSource

- (NSInteger)numberOfPreviewItemsInPreviewPanel:(QLPreviewPanel *)panel {
  return self.currentPreviewItem ? 1 : 0;
}

- (id <QLPreviewItem>)previewPanel:(QLPreviewPanel *)panel previewItemAtIndex:(NSInteger)index {
  return self.currentPreviewItem;
}

// Thanks to this guard, we won't compile this code when we build for the old architecture.
#ifdef RCT_NEW_ARCH_ENABLED

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
(const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeDocumentViewerSpecJSI>(params);
}

#endif

@end