using Newtonsoft.Json.Linq;
using ReactNative.Bridge;
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

namespace RNDocumentPicker
{
    class RCTDocumentPickerModule : ReactContextNativeModuleBase, ILifecycleEventListener
    {
        private FileOpenPicker _pendingPicker;
        private bool _isInForeground;

	private static readonly String E_FAILED_TO_SHOW_PICKER = "FAILED_TO_SHOW_PICKER";
	private static readonly String E_DOCUMENT_PICKER_CANCELED = "DOCUMENT_PICKER_CANCELED";
	private static readonly String E_UNEXPECTED_EXCEPTION = "UNEXPECTED_EXCEPTION";

	private static readonly String OPTION_TYPE = "type";
    private static readonly String CACHE_TYPE = "cache";
    private static readonly String OPTION_MULIPLE = "multiple";
    private static readonly String OPTION_READ_CONTENT = "readContent";
    private static readonly String FIELD_URI = "uri";
	private static readonly String FIELD_NAME = "name";
	private static readonly String FIELD_TYPE = "type";
	private static readonly String FIELD_SIZE = "size";
    private static readonly String FIELD_CONTENT = "content";

        public RCTDocumentPickerModule(ReactContext reactContext)
            : base(reactContext)
        {
        }

        public override string Name
        {
            get
            {
                return "RNDocumentPicker";
            }
        }

        public override void Initialize()
        {
            Context.AddLifecycleEventListener(this);
        }

        public void OnSuspend()
        {
            _isInForeground = false;
        }

        public void OnResume()
        {
            _isInForeground = true;
        }

        public void OnDestroy()
        {
        }

        [ReactMethod]
        public void pick(JObject options, IPromise promise)
        {
            try
            {
                FileOpenPicker openPicker = new FileOpenPicker();
                openPicker.ViewMode = PickerViewMode.Thumbnail;
                openPicker.SuggestedStartLocation = PickerLocationId.DocumentsLibrary;
                // Get file type array options
                var fileTypeArray = options.Value<JArray>(OPTION_TYPE);
                var cache = options.Value<Boolean>(CACHE_TYPE);
                // Init file type filter
                if (fileTypeArray != null && fileTypeArray.Count > 0)
                {
                    foreach (String typeString in fileTypeArray)
                    {
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
                        promise.Reject(E_FAILED_TO_SHOW_PICKER, ex.Message);
                    }
                });
            }
            catch (Exception ex) {
                promise.Reject(E_UNEXPECTED_EXCEPTION, ex.Message);
            }
        }

        private async Task<JObject> PrepareFile(StorageFile file, Boolean cache, Boolean readContent)
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
                    { FIELD_TYPE, file.ContentType },
                    { FIELD_NAME, file.Name },
                    { FIELD_SIZE, basicProperties.Size},
                    { FIELD_CONTENT, base64Content }
                };
            }
        }

        private async Task<bool> PickMultipleFileAsync(FileOpenPicker picker, Boolean cache, Boolean readContent, IPromise promise) {
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
                promise.Reject(E_DOCUMENT_PICKER_CANCELED, "User canceled document picker");
            }

            return true;
        }

        private async Task<bool> PickSingleFileAsync(FileOpenPicker picker, Boolean cache, Boolean readContent, IPromise promise) {
            var file = await picker.PickSingleFileAsync().AsTask().ConfigureAwait(false);
            if (file != null)
            {
                JArray jarrayObj = new JArray();
                jarrayObj.Add(PrepareFile(file, cache, readContent).Result);
                promise.Resolve(jarrayObj);
            }
            else
            {
                promise.Reject(E_DOCUMENT_PICKER_CANCELED, "User canceled document picker");
            }

            return true;
        }

        private void OnInvoked(Object error, Object success, ICallback callback)
        {
            callback.Invoke(error, success);
        }

        private static async void RunOnDispatcher(DispatchedHandler action)
        {
            await CoreApplication.MainView.CoreWindow.Dispatcher.RunAsync(CoreDispatcherPriority.Normal, action).AsTask().ConfigureAwait(false);
        }
    }
}
