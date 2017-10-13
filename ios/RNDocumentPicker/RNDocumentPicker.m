#import "RNDocumentPicker.h"

#import <MobileCoreServices/MobileCoreServices.h>

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

static NSString *const FIELD_URI = @"uri";
static NSString *const FIELD_NAME = @"name";
static NSString *const FIELD_TYPE = @"type";
static NSString *const FIELD_SIZE = @"size";

@interface RNDocumentPicker () <UIDocumentMenuDelegate,UIDocumentPickerDelegate>
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

RCT_EXPORT_METHOD(show:(NSDictionary *)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    NSArray *allowedUTIs = [RCTConvert NSArray:options[@"type"]];
    UIDocumentMenuViewController *documentPicker = [[UIDocumentMenuViewController alloc] initWithDocumentTypes:(NSArray *)allowedUTIs inMode:UIDocumentPickerModeImport];
    
    [composeResolvers addObject:resolve];
    [composeRejecters addObject:reject];
    
    documentPicker.delegate = self;
    documentPicker.modalPresentationStyle = UIModalPresentationFormSheet;
    
    UIViewController *rootViewController = [[[[UIApplication sharedApplication]delegate] window] rootViewController];
    while (rootViewController.presentedViewController) {
        rootViewController = rootViewController.presentedViewController;
    }
    
    if ( IDIOM == IPAD ) {
        NSNumber *top = [RCTConvert NSNumber:options[@"top"]];
        NSNumber *left = [RCTConvert NSNumber:options[@"left"]];
        [documentPicker.popoverPresentationController setSourceRect: CGRectMake([left floatValue], [top floatValue], 0, 0)];
        [documentPicker.popoverPresentationController setSourceView: rootViewController.view];
    }
    
    [rootViewController presentViewController:documentPicker animated:YES completion:nil];
}


- (void)documentMenu:(UIDocumentMenuViewController *)documentMenu didPickDocumentPicker:(UIDocumentPickerViewController *)documentPicker
{
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
        
        [url startAccessingSecurityScopedResource];
        
        NSFileCoordinator *coordinator = [[NSFileCoordinator alloc] init];
        __block NSError *error;
        
        [coordinator coordinateReadingItemAtURL:url options:NSFileCoordinatorReadingResolvesSymbolicLink error:&error byAccessor:^(NSURL *newURL) {
            NSMutableDictionary* result = [NSMutableDictionary dictionary];
            
            if (error) {
                reject(E_INVALID_DATA_RETURNED, error.localizedDescription, error);
            } else {
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
                
                resolve(result);
            }
        }];
        
        [url stopAccessingSecurityScopedResource];
    }
}

- (void)documentMenuWasCancelled:(UIDocumentMenuViewController *)controller
{
    RCTPromiseRejectBlock reject = [composeRejecters lastObject];
    [composeResolvers removeLastObject];
    [composeRejecters removeLastObject];
    
    reject(E_DOCUMENT_PICKER_CANCELED, @"User canceled document picker", nil);
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
