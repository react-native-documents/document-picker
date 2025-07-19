// LICENSE: see License.md in the package root

#import <React/RCTConvert.h>

// When using use_frameworks! :linkage => :static in Podfile
#if __has_include(<react_native_document_picker/react_native_document_picker-Swift.h>)
#import <react_native_document_picker/react_native_document_picker-Swift.h>
#else
#import "react_native_document_picker-Swift.h"
#endif

@interface RCTConvert (RNDocumentPicker)

+ (PickerOptions *)PickerOptions:(id)json;
+ (SaverOptions *)SaverOptions:(id)json;

@end