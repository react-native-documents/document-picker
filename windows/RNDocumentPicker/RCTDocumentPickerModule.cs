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
using Windows.Storage.FileProperties;
using Windows.Storage.Streams;
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
            var fileType = options.Value<int>("filetype");
            if(fileType)
            {
                promise.Resolve(fileType);
            }
        }
    }
}
