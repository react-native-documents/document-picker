#import "RNDocumentPicker.h"

#import <MobileCoreServices/MobileCoreServices.h>

#import <React/RCTConvert.h>
#import <React/RCTBridge.h>
#import <React/RCTUtils.h>


static NSString *const E_DOCUMENT_PICKER_CANCELED = @"DOCUMENT_PICKER_CANCELED";
static NSString *const E_INVALID_DATA_RETURNED = @"INVALID_DATA_RETURNED";

static NSString *const OPTION_TYPE = @"type";
static NSString *const OPTION_MULTIPLE = @"multiple";

static NSString *const FIELD_URI = @"uri";
static NSString *const FIELD_FILE_COPY_URI = @"fileCopyUri";
static NSString *const FIELD_COPY_ERR = @"copyError";
static NSString *const FIELD_NAME = @"name";
static NSString *const FIELD_TYPE = @"type";
static NSString *const FIELD_SIZE = @"size";

@interface RNDocumentPicker () <UIDocumentPickerDelegate, UIAdaptivePresentationControllerDelegate>
@end

@implementation RNDocumentPicker {
    UIDocumentPickerMode mode;
    NSString *copyDestination;
    NSMutableArray *composeResolvers;
    NSMutableArray *composeRejecters;
    NSMutableArray *urls;
}

@synthesize bridge = _bridge;

- (instancetype)init
{
    if ((self = [super init])) {
        composeResolvers = [NSMutableArray new];
        composeRejecters = [NSMutableArray new];
        urls = [NSMutableArray new];
    }
    return self;
}

- (void)dealloc
{
    for (NSURL *url in urls) {
        [url stopAccessingSecurityScopedResource];
    }
}

+ (BOOL)requiresMainQueueSetup
{
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
    mode = options[@"mode"] && [options[@"mode"] isEqualToString:@"open"] ? UIDocumentPickerModeOpen : UIDocumentPickerModeImport;
    copyDestination = options[@"copyTo"] ? options[@"copyTo"] : nil;
    [composeResolvers addObject:resolve];
    [composeRejecters addObject:reject];

    NSArray *allowedUTIs = [RCTConvert NSArray:options[OPTION_TYPE]];
    UIDocumentPickerViewController *documentPicker = [[UIDocumentPickerViewController alloc] initWithDocumentTypes:(NSArray *)allowedUTIs inMode:mode];
    documentPicker.delegate = self;
    documentPicker.presentationController.delegate = self;
    documentPicker.modalPresentationStyle = UIModalPresentationFormSheet;
    
#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 110000
    if (@available(iOS 11, *)) {
        documentPicker.allowsMultipleSelection = [RCTConvert BOOL:options[OPTION_MULTIPLE]];
    }
#endif
    
    UIViewController *rootViewController = RCTPresentedViewController();
    
    [rootViewController presentViewController:documentPicker animated:YES completion:nil];
}

- (NSMutableDictionary *)getMetadataForUrl:(NSURL *)url error:(NSError **)error
{
    __block NSMutableDictionary *result = [NSMutableDictionary dictionary];
    
    if (mode == UIDocumentPickerModeOpen)
        [urls addObject:url];
    [url startAccessingSecurityScopedResource];
    
    NSFileCoordinator *coordinator = [NSFileCoordinator new];
    NSError *fileError;
    
    [coordinator coordinateReadingItemAtURL:url options:NSFileCoordinatorReadingResolvesSymbolicLink error:&fileError byAccessor:^(NSURL *newURL) {
        
        if (!fileError) {
            [result setValue:((mode == UIDocumentPickerModeOpen) ? url : newURL).absoluteString forKey:FIELD_URI];
            NSError *copyError;
            NSURL *maybeFileCopyPath = copyDestination ? [RNDocumentPicker copyToUniqueDestinationFrom:newURL usingDestinationPreset:copyDestination error:copyError] : newURL;
            [result setValue:maybeFileCopyPath.absoluteString forKey:FIELD_FILE_COPY_URI];
            if (copyError) {
                [result setValue:copyError.description forKey:FIELD_COPY_ERR];
            }

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
    
    if (mode != UIDocumentPickerModeOpen)
        [url stopAccessingSecurityScopedResource];
    
    if (fileError) {
        *error = fileError;
        return nil;
    } else {
        return result;
    }
}

RCT_EXPORT_METHOD(releaseSecureAccess:(NSArray<NSString *> *)uris)
{
    NSMutableArray *discardedItems = [NSMutableArray array];
    for (NSString *uri in uris) {
        for (NSURL *url in urls) {
            if ([url.absoluteString isEqual:uri]) {
                [url stopAccessingSecurityScopedResource];
                [discardedItems addObject:url];
                break;
            }
        }
    }
    [urls removeObjectsInArray:discardedItems];
}

+ (NSURL *)getDirectoryForFileCopy:(NSString *)copyToDirectory
{
    if ([@"cachesDirectory" isEqualToString:copyToDirectory]) {
        return [NSFileManager.defaultManager URLsForDirectory:NSCachesDirectory inDomains:NSUserDomainMask].firstObject;
    } else if ([@"documentDirectory" isEqualToString:copyToDirectory]) {
        return [NSFileManager.defaultManager URLsForDirectory:NSDocumentDirectory inDomains:NSUserDomainMask].firstObject;
    }
    // this should not happen as the value is checked in JS, but we fall back to NSTemporaryDirectory()
    return [NSURL fileURLWithPath:NSTemporaryDirectory() isDirectory:YES];
}

+ (NSURL *)copyToUniqueDestinationFrom:(NSURL *)url usingDestinationPreset:(NSString *)copyToDirectory error:(NSError *)error
{
    NSURL *destinationRootDir = [self getDirectoryForFileCopy:copyToDirectory];
    // we don't want to rename the file so we put it into a unique location
    NSString *uniqueSubDirName = [[NSUUID UUID] UUIDString];
    NSURL *destinationDir = [destinationRootDir URLByAppendingPathComponent:[NSString stringWithFormat:@"%@/", uniqueSubDirName]];
    NSURL *destinationUrl = [destinationDir URLByAppendingPathComponent:[NSString stringWithFormat:@"%@", url.lastPathComponent]];
    
    [NSFileManager.defaultManager createDirectoryAtURL:destinationDir withIntermediateDirectories:YES attributes:nil error:&error];
    if (error) {
        return url;
    }
    [NSFileManager.defaultManager copyItemAtURL:url toURL:destinationUrl error:&error];
    if (error) {
        return url;
    } else {
        return destinationUrl;
    }
}

- (void)documentPicker:(UIDocumentPickerViewController *)controller didPickDocumentAtURL:(NSURL *)url
{
    RCTPromiseResolveBlock resolve = [composeResolvers lastObject];
    RCTPromiseRejectBlock reject = [composeRejecters lastObject];
    [composeResolvers removeLastObject];
    [composeRejecters removeLastObject];
    
    NSError *error;
    NSMutableDictionary *result = [self getMetadataForUrl:url error:&error];
    if (result) {
        NSArray *results = @[result];
        resolve(results);
    } else {
        reject(E_INVALID_DATA_RETURNED, error.localizedDescription, error);
    }
}

- (void)documentPicker:(UIDocumentPickerViewController *)controller didPickDocumentsAtURLs:(NSArray<NSURL *> *)urls
{
    RCTPromiseResolveBlock resolve = [composeResolvers lastObject];

    if (resolve == nil) {
        return;
    }

    RCTPromiseRejectBlock reject = [composeRejecters lastObject];
    [composeResolvers removeLastObject];
    [composeRejecters removeLastObject];
    
    NSMutableArray *results = [NSMutableArray array];
    for (id url in urls) {
        NSError *error;
        NSMutableDictionary *result = [self getMetadataForUrl:url error:&error];
        if (result) {
            [results addObject:result];
        } else {
            reject(E_INVALID_DATA_RETURNED, error.localizedDescription, error);
            return;
        }
    }
    
    resolve(results);
}

- (void)documentPickerWasCancelled:(UIDocumentPickerViewController *)controller
{
    [self rejectLastSelection];
}

- (void)presentationControllerDidDismiss:(UIPresentationController *)presentationController {
    [self rejectLastSelection];
}

- (void)rejectLastSelection
{
    RCTPromiseRejectBlock reject = [composeRejecters lastObject];
    [composeResolvers removeLastObject];
    [composeRejecters removeLastObject];
    
    reject(E_DOCUMENT_PICKER_CANCELED, @"User canceled document picker", nil);
}

@end
