#import "RCTConvert+RNDocumentPicker.h"

@implementation RCTConvert (RNDocumentPicker)
// TODO how to de-duplicate from https://github.com/facebook/react-native/blob/v0.66.0/React/Views/RCTModalHostViewManager.m?
RCT_ENUM_CONVERTER(
    UIModalPresentationStyle,
    (@{
      @"fullScreen" : @(UIModalPresentationFullScreen),
      @"pageSheet" : @(UIModalPresentationPageSheet),
      @"formSheet" : @(UIModalPresentationFormSheet),
      @"overFullScreen" : @(UIModalPresentationOverFullScreen),
    }),
    UIModalPresentationFullScreen,
    integerValue)


RCT_ENUM_CONVERTER(
    UIModalTransitionStyle,
    (@{
      @"coverVertical" : @(UIModalTransitionStyleCoverVertical),
      @"flipHorizontal" : @(UIModalTransitionStyleFlipHorizontal),
      @"crossDissolve" : @(UIModalTransitionStyleCrossDissolve),
      @"partialCurl" : @(UIModalTransitionStylePartialCurl),
    }),
    UIModalTransitionStyleCoverVertical,
    integerValue)

@end
