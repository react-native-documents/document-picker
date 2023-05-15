#import "RNDocumentPicker.h"

#import <MobileCoreServices/MobileCoreServices.h>

#import <React/RCTConvert.h>
#import <React/RCTBridge.h>
#import <React/RCTUtils.h>
#import "RNCPromiseWrapper.h"
#import "RCTConvert+RNDocumentPicker.h"

static NSString *const E_DOCUMENT_PICKER_CANCELED = @"DOCUMENT_PICKER_CANCELED";
static NSString *const E_INVALID_DATA_RETURNED = @"INVALID_DATA_RETURNED";

static NSString *const OPTION_TYPE = @"type";
static NSString *const OPTION_MULTIPLE = @"allowMultiSelection";

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
    RNCPromiseWrapper* promiseWrapper;
    NSMutableArray *urlsInOpenMode;
}

- (instancetype)init
{
    if ((self = [super init])) {
        promiseWrapper = [RNCPromiseWrapper new];
        urlsInOpenMode = [NSMutableArray new];
    }
    return self;
}

- (void)dealloc
{
    for (NSURL *url in urlsInOpenMode) {
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
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    mode = options[@"mode"] && [options[@"mode"] isEqualToString:@"open"] ? UIDocumentPickerModeOpen : UIDocumentPickerModeImport;
    copyDestination = options[@"copyTo"];
    UIModalPresentationStyle presentationStyle = [RCTConvert UIModalPresentationStyle:options[@"presentationStyle"]];
    UIModalTransitionStyle transitionStyle = [RCTConvert UIModalTransitionStyle:options[@"transitionStyle"]];
    [promiseWrapper setPromiseWithInProgressCheck:resolve rejecter:reject fromCallSite:@"pick"];

    NSArray *allowedUTIs = [RCTConvert NSArray:options[OPTION_TYPE]];
    UIDocumentPickerViewController *documentPicker = [[UIDocumentPickerViewController alloc] initWithDocumentTypes:allowedUTIs inMode:mode];

    documentPicker.modalPresentationStyle = presentationStyle;
    documentPicker.modalTransitionStyle = transitionStyle;

    documentPicker.delegate = self;
    documentPicker.presentationController.delegate = self;

    documentPicker.allowsMultipleSelection = [RCTConvert BOOL:options[OPTION_MULTIPLE]];

    UIViewController *rootViewController = RCTPresentedViewController();

    [rootViewController presentViewController:documentPicker animated:YES completion:nil];
}


- (void)documentPicker:(UIDocumentPickerViewController *)controller didPickDocumentsAtURLs:(NSArray<NSURL *> *)urls
{
    NSMutableArray *results = [NSMutableArray array];
    for (id url in urls) {
        NSError *error;
        NSMutableDictionary *result = [self getMetadataForUrl:url error:&error];
        if (result) {
            [results addObject:result];
        } else {
            [promiseWrapper reject:E_INVALID_DATA_RETURNED withError:error];
            return;
        }
    }

    [promiseWrapper resolve:results];
}

- (NSMutableDictionary *)getMetadataForUrl:(NSURL *)url error:(NSError **)error
{
    __block NSMutableDictionary *result = [NSMutableDictionary dictionary];

    if (mode == UIDocumentPickerModeOpen) {
        [urlsInOpenMode addObject:url];
    }
    
    // TODO handle error
    [url startAccessingSecurityScopedResource];

    NSFileCoordinator *coordinator = [NSFileCoordinator new];
    NSError *fileError;

    // TODO double check this implemenation, see eg. https://developer.apple.com/documentation/foundation/nsfilecoordinator/1412420-prepareforreadingitemsaturls
    [coordinator coordinateReadingItemAtURL:url options:NSFileCoordinatorReadingResolvesSymbolicLink error:&fileError byAccessor:^(NSURL *newURL) {
        // If the coordinated operation fails, then the accessor block never runs
        result[FIELD_URI] = ((mode == UIDocumentPickerModeOpen) ? url : newURL).absoluteString;
        
        NSError *copyError;
        NSURL *maybeFileCopyPath = copyDestination ? [RNDocumentPicker copyToUniqueDestinationFrom:newURL usingDestinationPreset:copyDestination error:&copyError] : nil;
        
        if (!copyError) {
            result[FIELD_FILE_COPY_URI] = RCTNullIfNil(maybeFileCopyPath.absoluteString);
        } else {
            result[FIELD_COPY_ERR] = copyError.localizedDescription;
            result[FIELD_FILE_COPY_URI] = [NSNull null];
        }

        result[FIELD_NAME] = newURL.lastPathComponent;

        NSError *attributesError = nil;
        NSDictionary *fileAttributes = [NSFileManager.defaultManager attributesOfItemAtPath:newURL.path error:&attributesError];
        if(!attributesError) {
            result[FIELD_SIZE] = fileAttributes[NSFileSize];
        } else {
            result[FIELD_SIZE] = [NSNull null];
            NSLog(@"RNDocumentPicker: %@", attributesError);
        }

        if (newURL.pathExtension != nil) {
            CFStringRef extension = (__bridge CFStringRef) newURL.pathExtension;
            CFStringRef uti = UTTypeCreatePreferredIdentifierForTag(kUTTagClassFilenameExtension, extension, NULL);
            CFStringRef mimeType = UTTypeCopyPreferredTagWithClass(uti, kUTTagClassMIMEType);
            if (uti) {
                CFRelease(uti);
            }

            NSString *mimeTypeString = (__bridge_transfer NSString *)mimeType;
            result[FIELD_TYPE] = mimeTypeString;
        } else {
            result[FIELD_TYPE] = [NSNull null];
        }
    }];

    if (mode != UIDocumentPickerModeOpen) {
        [url stopAccessingSecurityScopedResource];
    }

    if (fileError) {
        *error = fileError;
        return nil;
    } else {
        return result;
    }
}

RCT_EXPORT_METHOD(releaseSecureAccess:(NSArray<NSString *> *)uris
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    NSMutableArray *discardedItems = [NSMutableArray array];
    for (NSString *uri in uris) {
        for (NSURL *url in urlsInOpenMode) {
            if ([url.absoluteString isEqual:uri]) {
                [url stopAccessingSecurityScopedResource];
                [discardedItems addObject:url];
                break;
            }
        }
    }
    [urlsInOpenMode removeObjectsInArray:discardedItems];
    resolve(nil);
}

- (void)pickDirectory:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    reject(@"RNDocumentPicker:pickDirectory", @"pickDirectory is not supported on iOS", nil);
}

+ (NSURL *)copyToUniqueDestinationFrom:(NSURL *)url usingDestinationPreset:(NSString *)copyToDirectory error:(NSError **)error
{
    NSURL *destinationRootDir = [self getDirectoryForFileCopy:copyToDirectory];
    // we don't want to rename the file so we put it into a unique location
    NSString *uniqueSubDirName = [[NSUUID UUID] UUIDString];
    NSURL *destinationDir = [destinationRootDir URLByAppendingPathComponent:[NSString stringWithFormat:@"%@/", uniqueSubDirName]];
    NSURL *destinationUrl = [destinationDir URLByAppendingPathComponent:[NSString stringWithFormat:@"%@", url.lastPathComponent]];

    [NSFileManager.defaultManager createDirectoryAtURL:destinationDir withIntermediateDirectories:YES attributes:nil error:error];
    if (*error) {
        return nil;
    }
    [NSFileManager.defaultManager copyItemAtURL:url toURL:destinationUrl error:error];
    if (*error) {
        return nil;
    } else {
        return destinationUrl;
    }
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

- (void)documentPickerWasCancelled:(UIDocumentPickerViewController *)controller
{
    [self rejectAsUserCancellationError];
}

- (void)presentationControllerDidDismiss:(UIPresentationController *)presentationController
{
    [self rejectAsUserCancellationError];
}

- (void)rejectAsUserCancellationError
{
    // TODO make error nullable?
    NSError* error = [NSError errorWithDomain:NSCocoaErrorDomain code:NSUserCancelledError userInfo:nil];
    [promiseWrapper reject:@"user canceled the document picker" withCode:E_DOCUMENT_PICKER_CANCELED withError:error];
}

// Thanks to this guard, we won't compile this code when we build for the old architecture.
#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeDocumentPickerSpecJSI>(params);
}
#endif

@end
