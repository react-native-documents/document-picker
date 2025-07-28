// LICENSE: see License.md in the package root

#import "RCTConvert+RNDocumentPicker.h"
#import <UniformTypeIdentifiers/UniformTypeIdentifiers.h>

// Import Swift module header with multiple fallback options
#if __has_include("react_native_document_picker-Swift.h")
#import "react_native_document_picker-Swift.h"
#elif __has_include(<react_native_document_picker/react_native_document_picker-Swift.h>)
#import <react_native_document_picker/react_native_document_picker-Swift.h>
#elif __has_include("react-native-document-picker-Swift.h")
#import "react-native-document-picker-Swift.h"
#elif __has_include(<react-native-document-picker/react-native-document-picker-Swift.h>)
#import <react-native-document-picker/react-native-document-picker-Swift.h>
#else
#warning "Swift bridging header not found. Make sure Swift files are compiled and module is properly configured."
#endif

@implementation RCTConvert (RNDocumentPicker)

+ (PickerOptions *)PickerOptions:(id)json
{
  NSDictionary *options = [RCTConvert NSDictionary:json];
  PickerOptions *pickerOptions = [[PickerOptions alloc] init];
  
  // Set default values
  pickerOptions.allowMultiSelection = NO;
  pickerOptions.mode = @"open";
  pickerOptions.copyTo = @"cachesDirectory";
  
  if (options[@"allowMultiSelection"]) {
    pickerOptions.allowMultiSelection = [RCTConvert BOOL:options[@"allowMultiSelection"]];
  }
  
  if (options[@"mode"]) {
    pickerOptions.mode = [RCTConvert NSString:options[@"mode"]];
  }
  
  if (options[@"copyTo"]) {
    pickerOptions.copyTo = [RCTConvert NSString:options[@"copyTo"]];
  }
  
  if (options[@"type"]) {
    NSArray *types = [RCTConvert NSArray:options[@"type"]];
    NSMutableArray<UTType *> *utTypes = [[NSMutableArray alloc] init];
    
    for (NSString *typeString in types) {
      UTType *utType = [UTType typeWithIdentifier:typeString];
      if (utType) {
        [utTypes addObject:utType];
      }
    }
    
    pickerOptions.allowedTypes = [utTypes copy];
  }
  
  return pickerOptions;
}

+ (SaverOptions *)SaverOptions:(id)json
{
  NSDictionary *options = [RCTConvert NSDictionary:json];
  SaverOptions *saverOptions = [[SaverOptions alloc] init];
  
  if (options[@"fileName"]) {
    saverOptions.fileName = [RCTConvert NSString:options[@"fileName"]];
  }
  
  if (options[@"data"]) {
    saverOptions.data = [RCTConvert NSString:options[@"data"]];
  }
  
  if (options[@"uri"]) {
    saverOptions.uri = [RCTConvert NSString:options[@"uri"]];
  }
  
  return saverOptions;
}

@end