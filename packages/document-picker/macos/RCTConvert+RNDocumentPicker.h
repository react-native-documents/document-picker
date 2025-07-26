// LICENSE: see License.md in the package root

#import <React/RCTConvert.h>

// Forward declarations for Swift classes
@class PickerOptions;
@class SaverOptions;

@interface RCTConvert (RNDocumentPicker)

+ (PickerOptions *)PickerOptions:(id)json;
+ (SaverOptions *)SaverOptions:(id)json;

@end