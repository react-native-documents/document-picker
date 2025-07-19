// LICENSE: see License.md in the package root

#import "RCTConvert+RNDocumentPicker.h"
#import <UniformTypeIdentifiers/UniformTypeIdentifiers.h>

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