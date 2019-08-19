#import "RNDocumentPicker.h"

#import <MobileCoreServices/MobileCoreServices.h>

#if __has_include(<React/RCTConvert.h>)
#import <React/RCTConvert.h>
#import <React/RCTBridge.h>
#import <React/RCTUtils.h>
#else // back compatibility for RN version < 0.40
#import "RCTConvert.h"
#import "RCTBridge.h"
#endif

static NSString *const E_DOCUMENT_PICKER_CANCELED = @"DOCUMENT_PICKER_CANCELED";
static NSString *const E_INVALID_DATA_RETURNED = @"INVALID_DATA_RETURNED";

static NSString *const OPTION_TYPE = @"type";
static NSString *const OPTION_MULIPLE = @"multiple";

static NSString *const FIELD_URI = @"uri";
static NSString *const FIELD_NAME = @"name";
static NSString *const FIELD_TYPE = @"type";
static NSString *const FIELD_SIZE = @"size";

@interface RNDocumentPicker () <UIDocumentPickerDelegate>
@end

@implementation RNDocumentPicker {
    NSMutableArray *composeViews;
    NSMutableArray *composeResolvers;
    NSMutableArray *composeRejecters;
}

@synthesize bridge = _bridge;

- (instancetype)init
{
    if ((self = [super init])) {
        composeResolvers = [[NSMutableArray alloc] init];
        composeRejecters = [[NSMutableArray alloc] init];
        composeViews = [[NSMutableArray alloc] init];
    }
    return self;
}

+ (BOOL)requiresMainQueueSetup {
    return NO;
}

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(pick:(NSDictionary *)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    NSArray *allowedUTIs = [RCTConvert NSArray:options[OPTION_TYPE]];
    UIDocumentPickerViewController *documentPicker = [[UIDocumentPickerViewController alloc] initWithDocumentTypes:(NSArray *)allowedUTIs inMode:UIDocumentPickerModeImport];
    
    [composeResolvers addObject:resolve];
    [composeRejecters addObject:reject];
    
    documentPicker.delegate = self;
    documentPicker.modalPresentationStyle = UIModalPresentationFormSheet;
    
#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 110000
    if (@available(iOS 11, *)) {
        documentPicker.allowsMultipleSelection = [RCTConvert BOOL:options[OPTION_MULIPLE]];
    }
#endif
    
    UIViewController *rootViewController = RCTPresentedViewController();
    
    [rootViewController presentViewController:documentPicker animated:YES completion:nil];
}

- (NSMutableDictionary *)getMetadataForUrl:(NSURL *)url error:(NSError **)error
{
    __block NSMutableDictionary* result = [NSMutableDictionary dictionary];
    
    [url startAccessingSecurityScopedResource];
    
    NSFileCoordinator *coordinator = [[NSFileCoordinator alloc] init];
    __block NSError *fileError;
    
    [coordinator coordinateReadingItemAtURL:url options:NSFileCoordinatorReadingResolvesSymbolicLink error:&fileError byAccessor:^(NSURL *newURL) {
        
        if (!fileError) {
            [result setValue:newURL.absoluteString forKey:FIELD_URI];
            [result setValue:[newURL lastPathComponent] forKey:FIELD_NAME];
            
            NSError *attributesError = nil;
            NSDictionary *fileAttributes = [[NSFileManager defaultManager] attributesOfItemAtPath:newURL.path error:&attributesError];
            if(!attributesError) {
                [result setValue:[fileAttributes objectForKey:NSFileSize] forKey:FIELD_SIZE];
            } else {
                NSLog(@"%@", attributesError);
            }
            
            if ( newURL.pathExtension != nil ) {
                CFStringRef extension = (__bridge CFStringRef)[newURL pathExtension];
                CFStringRef uti = UTTypeCreatePreferredIdentifierForTag(kUTTagClassFilenameExtension, extension, NULL);
                CFStringRef mimeType = UTTypeCopyPreferredTagWithClass(uti, kUTTagClassMIMEType);
                CFRelease(uti);
                
                NSString *mimeTypeString = (__bridge_transfer NSString *)mimeType;
                [result setValue:mimeTypeString forKey:FIELD_TYPE];
            }
        }
    }];
    
    [url stopAccessingSecurityScopedResource];
    
    if (fileError) {
        *error = fileError;
        return nil;
    } else {
        return result;
    }
}

- (void)documentPicker:(UIDocumentPickerViewController *)controller didPickDocumentAtURL:(NSURL *)url
{
    if (controller.documentPickerMode == UIDocumentPickerModeImport) {
        RCTPromiseResolveBlock resolve = [composeResolvers lastObject];
        RCTPromiseRejectBlock reject = [composeRejecters lastObject];
        [composeResolvers removeLastObject];
        [composeRejecters removeLastObject];
        
        NSError *error;
        NSMutableDictionary* result = [self getMetadataForUrl:url error:&error];
        if (result) {
            NSArray *results = @[result];
            resolve(results);
        } else {
            reject(E_INVALID_DATA_RETURNED, error.localizedDescription, error);
        }
    }
}

- (void)documentPicker:(UIDocumentPickerViewController *)controller didPickDocumentsAtURLs:(NSArray<NSURL *> *)urls
{
    if (controller.documentPickerMode == UIDocumentPickerModeImport) {
        RCTPromiseResolveBlock resolve = [composeResolvers lastObject];
        RCTPromiseRejectBlock reject = [composeRejecters lastObject];
        [composeResolvers removeLastObject];
        [composeRejecters removeLastObject];
        
        NSMutableArray *results = [NSMutableArray array];
        for (id url in urls) {
            NSError *error;
            NSMutableDictionary* result = [self getMetadataForUrl:url error:&error];
            if (result) {
                [results addObject:result];
            } else {
                reject(E_INVALID_DATA_RETURNED, error.localizedDescription, error);
                return;
            }
        }
        
        resolve(results);
    }
}

- (void)documentPickerWasCancelled:(UIDocumentPickerViewController *)controller
{
    if (controller.documentPickerMode == UIDocumentPickerModeImport) {
        RCTPromiseRejectBlock reject = [composeRejecters lastObject];
        [composeResolvers removeLastObject];
        [composeRejecters removeLastObject];
        
        reject(E_DOCUMENT_PICKER_CANCELED, @"User canceled document picker", nil);
    }
}

@end
