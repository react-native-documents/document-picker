using Newtonsoft.Json.Linq;
using ReactNative.Bridge;
using System;
using Newtonsoft.Json.Linq;
using ReactNative.Bridge;
using ReactNative.Collections;
using System.Linq;
using System.Collections.Generic;
using Windows.ApplicationModel.Core;
using Windows.UI.Core;
using Windows.UI.Popups;
using Windows.Storage;
using Windows.Storage.Pickers;
using ZXing;
using static System.FormattableString;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace RNDocumentPicker
{
    class RCTDocumentPickerModule : ReactContextNativeModuleBase, ILifecycleEventListener
    {
        private FileOpenPicker _pendingPicker;
        private bool _isInForeground;

        private static readonly String E_FAILED_TO_SHOW_PICKER = "FAILED_TO_SHOW_PICKER";
        private static readonly String E_DOCUMENT_PICKER_CANCELED = "No data";
        private static readonly String E_UNEXPECTED_EXCEPTION = "UNEXPECTED_EXCEPTION";

        private static readonly String OPTION_TYPE = "filetype";

        private static readonly String FIELD_URI = "uri";
        private static readonly String FIELD_NAME = "fileName";
        private static readonly String FIELD_TYPE = "type";
        private static readonly String FIELD_SIZE = "fileSize";

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
        public void show(JObject options, ICallback callback)
        {
            try
            {
                FileOpenPicker openPicker = new FileOpenPicker();
                openPicker.ViewMode = PickerViewMode.Thumbnail;
                openPicker.SuggestedStartLocation = PickerLocationId.DocumentsLibrary;
                // Get file type array options
                var fileTypeArray = options.Value<JArray>(OPTION_TYPE);
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

                            var file = await openPicker.PickSingleFileAsync().AsTask().ConfigureAwait(false);
                            if (file != null)
                            {
                                OnInvoked(null, PrepareFile(file).Result, callback);
                            }
                            else
                            {
                                OnInvoked(E_DOCUMENT_PICKER_CANCELED, null, callback);
                            }
                        }
                        else
                        {
                            _pendingPicker = openPicker;
                        }
                    }
                    catch (Exception)
                    {
                        OnInvoked(E_FAILED_TO_SHOW_PICKER, null, callback);
                    }
                });
            }
            catch (Exception) {
                OnInvoked(E_UNEXPECTED_EXCEPTION, null, callback);
            }

        }

        private async Task<JObject> PrepareFile(StorageFile file)
        {
            var basicProperties = await file.GetBasicPropertiesAsync();

            return new JObject {
                    { FIELD_URI, file.Path },
                    { FIELD_TYPE, file.ContentType },
                    { FIELD_NAME, file.Name },
                    { FIELD_SIZE, basicProperties.Size}
                };
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
