// LICENSE: see License.md in the package root


#import <Foundation/Foundation.h>
#import "RNDPreviewController.h"

@implementation RNDPreviewController

- (instancetype)initWithPreviewItem:(RNDPreviewItem *)previewItem {
  if (self = [super init]) {
    _previewItem = previewItem;
    self.dataSource = self;
  }
  return self;
}

- (NSInteger)numberOfPreviewItemsInPreviewController:(QLPreviewController *)controller {
  return 1;
}

- (id <QLPreviewItem>)previewController:(QLPreviewController *)controller previewItemAtIndex:(NSInteger)index {
  return self.previewItem;
}

@end
