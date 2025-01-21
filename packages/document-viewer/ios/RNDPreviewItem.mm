// LICENSE: see License.md in the package root

#import "RNDPreviewItem.h"

@implementation RNDPreviewItem

- (instancetype)initWithURL:(NSURL *)url title:(nullable NSString *)title {
  if ((self = [super init])) {
    _previewItemURL = url;
    _previewItemTitle = title;
  }
  return self;
}

@end
