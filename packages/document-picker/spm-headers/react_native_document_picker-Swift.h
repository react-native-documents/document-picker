// Private SwiftPM declarations used by RNDocumentPicker.mm. Keep this narrow
// interface in sync with the @objc APIs pinned by SwiftHeaderPin.swift.
#pragma once

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

NS_ASSUME_NONNULL_BEGIN

__attribute__((objc_runtime_name("_TtC28react_native_document_picker9DocPicker")))
@interface DocPicker : NSObject
- (instancetype)init;
- (void)presentWithOptionsDict:(NSDictionary *)optionsDict
                       resolve:(RCTPromiseResolveBlock)resolve
                        reject:(RCTPromiseRejectBlock)reject;
- (void)stopAccessingOpenedUrls:(NSArray<NSString *> *)urlStrings;
@end

__attribute__((objc_runtime_name("_TtC28react_native_document_picker8DocSaver")))
@interface DocSaver : NSObject
- (instancetype)init;
- (void)presentWithOptionsDict:(NSDictionary *)optionsDict
                       resolve:(RCTPromiseResolveBlock)resolve
                        reject:(RCTPromiseRejectBlock)reject;
@end

__attribute__((objc_runtime_name("_TtC28react_native_document_picker14FileOperations")))
@interface FileOperations : NSObject
+ (void)keepLocalCopyAtUniqueDestinationFrom:(NSArray<NSDictionary<NSString *, NSString *> *> *)files
                           destinationPreset:(NSString *)destinationPreset
                                     resolve:(RCTPromiseResolveBlock)resolve;
@end

__attribute__((objc_runtime_name("_TtC28react_native_document_picker15IsKnownTypeImpl")))
@interface IsKnownTypeImpl : NSObject
+ (NSDictionary<NSString *, id> *)checkType:(NSString *)kind value:(NSString *)value;
@end

NS_ASSUME_NONNULL_END
