#import "RCTConvert+RNDocumentPicker.h"

@implementation RCTConvert (RNDocumentPicker)

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
