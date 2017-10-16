using Newtonsoft.Json.Linq;
using ReactNative.Bridge;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Windows.Devices.Enumeration;
using Windows.Devices.Sensors;
using Windows.Foundation;
using Windows.Graphics.Imaging;
using Windows.Media.Capture;
using Windows.Media.MediaProperties;
using Windows.Storage;
using Windows.Storage.Pickers;
using ZXing;
using static System.FormattableString;

namespace RNDocumentPicker
{
    class RCTDocumentPickerModule : ReactContextNativeModuleBase, ILifecycleEventListener
    {
        
        public RCTDocumentPickerModule(ReactContext reactContext)
            : base(reactContext)
        {
        }

        public override string Name
        {
            get
            {
                return "RCTDocumentPickerModule";
            }
        }

        [ReactMethod]
        public async void show(JObject args, IPromise promise)
        {
            FileOpenPicker openPicker = new FileOpenPicker();
            openPicker.ViewMode = PickerViewMode.List;
            openPicker.SuggestedStartLocation = PickerLocationId.DocumentsLibrary;

            var fileType = options.Value<int>("filetype");
            if(fileType)
            {
                openPicker.fileTypeFilter.replaceAll(fileType.Split(" "));
            } else {
                openPicker.fileTypeFilter.replaceAll(["*"]);
            }

            StorageFile file = await openPicker.PickSingleFileAsync();
            if (file != null)
            {
                promise.Resolve(new JObject
                {
                    { "uri", storageFile.Path },
                    { "type", storageFile.ContentType },
                    { "fileName", storageFile.Name }
                });
            }
            else
            {
                promise.Resolve();
            }
        }
    }
}
