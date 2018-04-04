#import "RNDocumentPicker.h"

#import <MobileCoreServices/MobileCoreServices.h>
#import <Photos/Photos.h>
#import <AssetsLibrary/AssetsLibrary.h>

#if __has_include(<React/RCTConvert.h>)
#import <React/RCTConvert.h>
#import <React/RCTBridge.h>
#else // back compatibility for RN version < 0.40
#import "RCTConvert.h"
#import "RCTBridge.h"
#endif

#define IDIOM    UI_USER_INTERFACE_IDIOM()
#define IPAD     UIUserInterfaceIdiomPad

static NSString *const E_DOCUMENT_PICKER_CANCELED = @"DOCUMENT_PICKER_CANCELED";
static NSString *const E_INVALID_DATA_RETURNED = @"INVALID_DATA_RETURNED";

static NSString *const OPTION_TYPE = @"type";
static NSString *const OPTION_MULIPLE = @"multiple";

static NSString *const FIELD_URI = @"uri";
static NSString *const FIELD_NAME = @"name";
static NSString *const FIELD_TYPE = @"type";
static NSString *const FIELD_SIZE = @"size";

@interface RNDocumentPicker () <UIDocumentMenuDelegate,UIDocumentPickerDelegate,UIImagePickerControllerDelegate,UINavigationControllerDelegate>
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
    
    UIDocumentMenuViewController *documentPicker = [[UIDocumentMenuViewController alloc] initWithDocumentTypes:(NSArray *)allowedUTIs inMode:UIDocumentPickerModeImport];
    
    
    
    [composeResolvers addObject:resolve];
    [composeRejecters addObject:reject];
    
    documentPicker.delegate = self;
    documentPicker.modalPresentationStyle = UIModalPresentationFormSheet;
    
    // #if __IPHONE_OS_VERSION_MAX_ALLOWED >= 110000
    //     if (@available(iOS 11, *)) {
    //         documentPicker.allowsMultipleSelection = [RCTConvert BOOL:options[OPTION_MULIPLE]];
    //     }
    // #endif
    
    UIViewController *rootViewController = [[[[UIApplication sharedApplication]delegate] window] rootViewController];
    while (rootViewController.presentedViewController) {
        rootViewController = rootViewController.presentedViewController;
    }
    
    if ( IDIOM == IPAD ) {
        [documentPicker.popoverPresentationController setSourceRect: CGRectMake(rootViewController.view.frame.size.width/2, rootViewController.view.frame.size.height - rootViewController.view.frame.size.height / 6, 0, 0)];
        [documentPicker.popoverPresentationController setSourceView: rootViewController.view];
    }
    
    [documentPicker addOptionWithTitle:@"Photos" image:nil order:UIDocumentMenuOrderFirst handler:^{
        
        UIImagePickerController *imagePickerController = [[UIImagePickerController alloc] init];
        
        imagePickerController.delegate = self;
        [rootViewController presentViewController:imagePickerController animated:YES completion:nil];
    }];
    
    [PHPhotoLibrary requestAuthorization:^(PHAuthorizationStatus status) {
        switch (status) {
            case PHAuthorizationStatusAuthorized:
                NSLog(@"PHAuthorizationStatusAuthorized");
                break;
            case PHAuthorizationStatusDenied:
                NSLog(@"PHAuthorizationStatusDenied");
                break;
            case PHAuthorizationStatusNotDetermined:
                NSLog(@"PHAuthorizationStatusNotDetermined");
                break;
            case PHAuthorizationStatusRestricted:
                NSLog(@"PHAuthorizationStatusRestricted");
                break;
        }
    }];
    
    [documentPicker addOptionWithTitle:@"Camera" image:nil order:UIDocumentMenuOrderFirst handler:^{
        if (([UIImagePickerController isSourceTypeAvailable:
              UIImagePickerControllerSourceTypeCamera] == NO))
            return;
        
        UIImagePickerController *cameraUI = [[UIImagePickerController alloc] init];
        
        cameraUI.sourceType = UIImagePickerControllerSourceTypeCamera;
        
        cameraUI.delegate = self;
        [rootViewController presentViewController:cameraUI animated:YES completion:nil];
    }];
    
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

- (void)documentMenu:(UIDocumentMenuViewController *)documentMenu didPickDocumentPicker:(UIDocumentPickerViewController *)documentPicker {
    documentPicker.delegate = self;
    documentPicker.modalPresentationStyle = UIModalPresentationFormSheet;
    
    UIViewController *rootViewController = [[[[UIApplication sharedApplication]delegate] window] rootViewController];
    
    while (rootViewController.presentedViewController) {
        rootViewController = rootViewController.presentedViewController;
    }
    if ( IDIOM == IPAD ) {
        [documentPicker.popoverPresentationController setSourceRect: CGRectMake(rootViewController.view.frame.size.width/2, rootViewController.view.frame.size.height - rootViewController.view.frame.size.height / 6, 0, 0)];
        [documentPicker.popoverPresentationController setSourceView: rootViewController.view];
    }
    
    [rootViewController presentViewController:documentPicker animated:YES completion:nil];
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

- (UIImage*)resizeImage:(UIImage*)aImage reSize:(CGSize)newSize;
{
    UIGraphicsBeginImageContextWithOptions(newSize, YES, [UIScreen mainScreen].scale);
    [aImage drawInRect:CGRectMake(0,0,newSize.width,newSize.height)];
    UIImage* newImage = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    return newImage;
}

- (void)imagePickerController:(UIImagePickerController *)picker didFinishPickingMediaWithInfo:(NSDictionary<NSString *,id> *)info;
{
    RCTPromiseResolveBlock resolve = [composeResolvers lastObject];
    RCTPromiseRejectBlock reject = [composeRejecters lastObject];
    [composeResolvers removeLastObject];
    [composeRejecters removeLastObject];
    
    NSURL *refURL = info[@"UIImagePickerControllerReferenceURL"];
    NSString *fileExt= @"";
    NSString *filePartialName= @"";
    NSString *fileName = @"";
    if( refURL == nil ){
        fileName = @"camera_photo.png";
    } else {
        NSString *fullName = [refURL absoluteString];
        NSString *lastParameters= [fullName componentsSeparatedByString:@"id="][1];
        filePartialName = [lastParameters componentsSeparatedByString:@"&"][0];
        fileExt = [lastParameters componentsSeparatedByString:@"ext="][1];
        fileName = [[filePartialName stringByAppendingString:@"."] stringByAppendingString:fileExt];
    };
    NSString *directoryPath = [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) firstObject];
    NSString *localPath = [directoryPath stringByAppendingPathComponent:fileName];
    
    UIImage *image = [info valueForKey:UIImagePickerControllerOriginalImage];
    
    UIImage *resizedImage = [self resizeImage:image reSize:CGSizeMake(500, 500)];
    
    // Resize for avoiding out of memory error
    NSData *contentData = UIImagePNGRepresentation(resizedImage);
    [contentData writeToFile:localPath atomically:true];
    
    NSURL *imageURL = [NSURL fileURLWithPath:localPath];
    
    NSError *error;
    NSMutableDictionary* result = [self getMetadataForUrl:imageURL error:&error];
    
    [picker.presentingViewController dismissViewControllerAnimated:YES completion:^{
        if (result) {
            NSArray *results = @[result];
            resolve(results);
        } else {
            reject(E_INVALID_DATA_RETURNED, error.localizedDescription, error);
        }
    }];
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

- (void)documentMenuWasCancelled:(UIDocumentMenuViewController *)controller
{
    RCTPromiseRejectBlock reject = [composeRejecters lastObject];
    [composeResolvers removeLastObject];
    [composeRejecters removeLastObject];
    
    reject(E_DOCUMENT_PICKER_CANCELED, @"User canceled document picker", nil);
}

- (void)imagePickerControllerDidCancel:(UIImagePickerController *)controller
{
    RCTPromiseRejectBlock reject = [composeRejecters lastObject];
    [composeResolvers removeLastObject];
    [composeRejecters removeLastObject];
    
    
    [controller.presentingViewController dismissViewControllerAnimated:YES completion:^{
        reject(E_DOCUMENT_PICKER_CANCELED, @"User canceled document picker", nil);
    }];
    
    return;
}

@end

