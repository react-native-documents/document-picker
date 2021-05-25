using Newtonsoft.Json.Linq;

using System;
using System.Linq;
using System.Collections.Generic;
using Windows.ApplicationModel.Core;
using Windows.UI.Core;
using Windows.Storage;
using Windows.Storage.Pickers;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.IO;
using Microsoft.ReactNative.Managed;

namespace RNDocumentPicker
{
    [ReactModule]
    internal sealed class RCTDocumentPickerModule
    {
        private FileOpenPicker _pendingPicker;
        private bool _isInForeground;

	    private static readonly string E_FAILED_TO_SHOW_PICKER = "FAILED_TO_SHOW_PICKER";
	    private static readonly string E_DOCUMENT_PICKER_CANCELED = "DOCUMENT_PICKER_CANCELED";
        private static readonly string E_FOLDER_PICKER_CANCELED = "FOLDER_PICKER_CANCELED";

        private static readonly string E_UNEXPECTED_EXCEPTION = "UNEXPECTED_EXCEPTION";

	    private static readonly string OPTION_TYPE = "type";
        private static readonly string CACHE_TYPE = "cache";
        private static readonly string OPTION_MULIPLE = "multiple";
        private static readonly string OPTION_READ_CONTENT = "readContent";
        private static readonly string FIELD_URI = "uri";
        private static readonly string FIELD_FILE_COPY_URI = "fileCopyUri";
	    private static readonly string FIELD_NAME = "name";
	    private static readonly string FIELD_TYPE = "type";
	    private static readonly string FIELD_SIZE = "size";
        private static readonly string FIELD_CONTENT = "content";

        private ReactContext _reactContext;

        [ReactInitializer]
        public void Initialize(ReactContext reactContext)
        {
            _reactContext = reactContext;
        }


        [ReactMethod]
        public void pick(JObject options, IReactPromise<JArray> promise)
        {
            try
            {
                FileOpenPicker openPicker = new FileOpenPicker();
                openPicker.ViewMode = PickerViewMode.Thumbnail;
                openPicker.SuggestedStartLocation = PickerLocationId.DocumentsLibrary;
                // Get file type array options
                var fileTypeArray = options.Value<JArray>(OPTION_TYPE);
                var cache = options.Value<Boolean>(CACHE_TYPE);

                //if pick called to launch folder picker.
                bool isFolderPicker = false;

                // Init file type filter
                if (fileTypeArray != null && fileTypeArray.Count > 0)
                {
                    foreach (String typeString in fileTypeArray)
                    {
                        if(typeString == "folder"){
                            isFolderPicker = true;
                            break;
                        }

                        List<String> types = typeString.Split(' ').ToList();
                        foreach (String type in types)
                        {
                            if (Regex.Match(type, "(^[.]+[A-Za-z0-9]*$)|(^[*]$)").Success)
                            {
                                openPicker.FileTypeFilter.Add(type);
                            }
                        }
                    }
                }
                else
                {
                    openPicker.FileTypeFilter.Add("*");
                }

                if(isFolderPicker)
                {
                    var openFolderPicker = new FolderPicker();

                    RunOnDispatcher(async () =>
                    {
                        try
                        {
                            if (_isInForeground)
                            {
                                openFolderPicker.ViewMode = PickerViewMode.List;
                                openFolderPicker.SuggestedStartLocation = PickerLocationId.DocumentsLibrary;
                                openFolderPicker.FileTypeFilter.Add("*");

                                await PickFolderAsync(openFolderPicker, promise);
                            }
                            else
                            {
                                _pendingPicker = openPicker;
                            }
                        }
                        catch (Exception ex)
                        {
                            ReactError error = new ReactError
                            {
                                Code = E_FAILED_TO_SHOW_PICKER,
                                Message = ex.Message,
                                Exception = ex
                            };

                            promise.Reject(error);
                        }
                    });
                }
                else
                {
                    RunOnDispatcher(async () =>
                    {
                        try
                        {
                            if (_isInForeground)
                            {
                                var isMultiple = options.Value<bool>(OPTION_MULIPLE);
                                var readContent = options.Value<bool>(OPTION_READ_CONTENT);
                                if (isMultiple)
                                {
                                    await PickMultipleFileAsync(openPicker, cache, readContent, promise);
                                }
                                else
                                {
                                    await PickSingleFileAsync(openPicker, cache, readContent, promise);
                                }
                            }
                            else
                            {
                                _pendingPicker = openPicker;
                            }
                        }
                        catch (Exception ex)
                        {
                            ReactError error = new ReactError
                            {
                                Code = E_FAILED_TO_SHOW_PICKER,
                                Message = ex.Message,
                                Exception = ex
                            };

                            promise.Reject(error);
                        }
                    });
                }
            }
            catch (Exception ex) 
            {
                ReactError error = new ReactError
                {
                    Code = E_UNEXPECTED_EXCEPTION,
                    Message = ex.Message,
                    Exception = ex
                };
                promise.Reject(error);
            }
        }

        private async Task<JObject> PrepareFile(StorageFile file, bool cache, bool readContent)
        {
            String base64Content = null;
            if (readContent)
            {
                var fileStream = await file.OpenReadAsync();
                using (StreamReader reader = new StreamReader(fileStream.AsStream()))
                {
                    using (var memstream = new MemoryStream())
                    {
                        reader.BaseStream.CopyTo(memstream);
                        var bytes = memstream.ToArray();
                        base64Content = Convert.ToBase64String(bytes);
                    }
                }
            }

            if (cache == true)
            {
                var fileInCache = await file.CopyAsync(ApplicationData.Current.TemporaryFolder, file.Name.ToString(), NameCollisionOption.ReplaceExisting).AsTask().ConfigureAwait(false);
                var basicProperties = await fileInCache.GetBasicPropertiesAsync();

                return new JObject {
                    { FIELD_URI, fileInCache.Path },
                    { FIELD_FILE_COPY_URI, fileInCache.Path },
                    { FIELD_TYPE, fileInCache.ContentType },
                    { FIELD_NAME, fileInCache.Name },
                    { FIELD_SIZE, basicProperties.Size},
                    { FIELD_CONTENT, base64Content }
                };
            }
            else {
                var basicProperties = await file.GetBasicPropertiesAsync();

                return new JObject {
                    { FIELD_URI, file.Path },
                    { FIELD_FILE_COPY_URI, file.Path },
                    { FIELD_TYPE, file.ContentType },
                    { FIELD_NAME, file.Name },
                    { FIELD_SIZE, basicProperties.Size},
                    { FIELD_CONTENT, base64Content }
                };
            }
        }

        private async Task<bool> PickMultipleFileAsync(FileOpenPicker picker, Boolean cache, Boolean readContent, IReactPromise<JArray> promise) {
            IReadOnlyList<StorageFile> files = await picker.PickMultipleFilesAsync().AsTask().ConfigureAwait(false);
            if (files.Count > 0)
            {
                JArray jarrayObj = new JArray();
                foreach (var file in files) {
                    jarrayObj.Add(PrepareFile(file, cache, readContent).Result);
                }
                promise.Resolve(jarrayObj);
            }
            else
            {
                ReactError error = new ReactError
                {
                    Code = E_DOCUMENT_PICKER_CANCELED,
                    Message = "User canceled document picker"
                };

                promise.Reject(error);
            }

            return true;
        }

        private async Task<bool> PickSingleFileAsync(FileOpenPicker picker, Boolean cache, Boolean readContent, IReactPromise<JArray> promise) {
            var file = await picker.PickSingleFileAsync().AsTask().ConfigureAwait(false);
            if (file != null)
            {
                JArray jarrayObj = new JArray();
                jarrayObj.Add(PrepareFile(file, cache, readContent).Result);
                promise.Resolve(jarrayObj);
            }
            else
            {
                ReactError error = new ReactError
                {
                    Code = E_DOCUMENT_PICKER_CANCELED,
                    Message = "User canceled document picker"
                };

                promise.Reject(error);
            }

            return true;
        }

        private async Task<JObject> PrepareFolder(StorageFolder folder)
        {
            String base64Content = null;
            var basicProperties = await folder.GetBasicPropertiesAsync();

            return new JObject {
                { FIELD_URI, folder.Path },
                { FIELD_FILE_COPY_URI, folder.Path },
                { FIELD_NAME, folder.Name },
                { FIELD_SIZE, basicProperties.Size},
                { FIELD_CONTENT, base64Content }
            };
        }
		
        private async Task<bool> PickFolderAsync(FolderPicker picker, IReactPromise<JArray> promise)
        {
            var folder = await picker.PickSingleFolderAsync().AsTask().ConfigureAwait(false);
            if (folder != null)
            {
                JArray jarrayObj = new JArray();
                jarrayObj.Add(PrepareFolder(folder).Result);
                promise.Resolve(jarrayObj);
            }
            else
            {
                ReactError error = new ReactError
                {
                    Code = E_FOLDER_PICKER_CANCELED,
                    Message = "User canceled document picker"

                };
                promise.Reject(error);
            }

            return true;
        }

        private static async void RunOnDispatcher(DispatchedHandler action)
        {
            await CoreApplication.MainView.CoreWindow.Dispatcher.RunAsync(CoreDispatcherPriority.Normal, action).AsTask().ConfigureAwait(false);
        }
    }
}
