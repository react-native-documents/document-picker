// LICENSE: see License.md in the package root

#import <UIKit/UIKit.h>
#import <QuickLook/QuickLook.h>
#import "RNDPreviewItem.h"

NS_ASSUME_NONNULL_BEGIN

@interface RNDPreviewController : QLPreviewController <QLPreviewControllerDataSource>

@property (nonatomic) RNDPreviewItem *previewItem;

- (instancetype)initWithPreviewItem:(RNDPreviewItem *)previewItem;

@end

NS_ASSUME_NONNULL_END
