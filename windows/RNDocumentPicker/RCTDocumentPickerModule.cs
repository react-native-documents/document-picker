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

namespace RNDocumentPicker
{
    class RCTDocumentPickerModule : ReactContextNativeModuleBase, ILifecycleEventListener
    {
        private FileOpenPicker _pendingPicker;
        private bool _isInForeground;

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
            FileOpenPicker openPicker = new FileOpenPicker();
            openPicker.ViewMode = PickerViewMode.Thumbnail;
            openPicker.SuggestedStartLocation = PickerLocationId.DocumentsLibrary;
            // Get file type array options
            var fileTypeArray = options.Value<JArray>("filetype");
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
                            OnInvoked(null, new JObject
                        {
                            { "uri", file.Path },
                            { "type", file.ContentType },
                            { "fileName", file.Name }
                        }, callback);
                        }
                        else
                        {
                            OnInvoked("No data", null, callback);
                        }
                    }
                    else
                    {
                        _pendingPicker = openPicker;
                    }
                }
                catch (Exception ex)
                {
                    OnInvoked(ex, null, callback);
                }
            });

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
