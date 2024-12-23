// LICENSE: see License.md in the package root

#import <Foundation/Foundation.h>
#import <QuickLook/QuickLook.h>

NS_ASSUME_NONNULL_BEGIN

@interface RNDPreviewItem : NSObject <QLPreviewItem>

// must be a file url
@property (readonly, nonatomic, nonnull) NSURL *previewItemURL;
@property (readonly, nonatomic, nullable) NSString *previewItemTitle;

- (instancetype)initWithURL:(NSURL *)url title:(nullable NSString *)title;

@end

NS_ASSUME_NONNULL_END
