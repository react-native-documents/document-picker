using Microsoft.ReactNative.Managed;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Windows.ApplicationModel.Core;
using Windows.Storage;
using Windows.Storage.Pickers;
using Windows.UI.Core;

namespace RNDocumentPicker
{
  [ReactModule("RNDocumentPicker")]
  internal sealed class RCTDocumentPickerModule
  {
    private static readonly string OPTION_TYPE = "type";
    private static readonly string CACHE_TYPE = "cache";
    private static readonly string OPTION_MULTIPLE = "allowMultiSelection";
    private static readonly string OPTION_READ_CONTENT = "readContent";
    private static readonly string FIELD_URI = "uri";
    private static readonly string FIELD_FILE_COPY_URI = "fileCopyUri";
    private static readonly string FIELD_NAME = "name";
    private static readonly string FIELD_TYPE = "type";
    private static readonly string FIELD_SIZE = "size";
    private static readonly string FIELD_CONTENT = "content";


    [ReactMethod("pick")]
    public async Task<List<JSValueObject>> Pick(JSValue options)
    {
      FileOpenPicker openPicker = new FileOpenPicker();
      openPicker.ViewMode = PickerViewMode.Thumbnail;
      openPicker.SuggestedStartLocation = PickerLocationId.DocumentsLibrary;

      // Get file type array options

      var fileTypes = options.AsObject()[OPTION_TYPE].AsArray();

      //var fileTypeArray = options.AsObject()[OPTION_TYPE][0].AsString();
      bool cache = false;
      if (options.AsObject().ContainsKey(CACHE_TYPE))
      {
        cache = options.AsObject()[CACHE_TYPE][0].AsBoolean();
      }

      var isMultiple = options.AsObject()[OPTION_MULTIPLE].AsBoolean();
      bool readContent = false;
      if (options.AsObject().ContainsKey(OPTION_READ_CONTENT))
      {
        readContent = options.AsObject()[OPTION_READ_CONTENT].AsBoolean();
      }

      //if pick called to launch folder picker.
      bool isFolderPicker = false;

      // Init file type filter
      if (fileTypes != null)
      {
        if (fileTypes.Contains("folder"))
        {
          isFolderPicker = true;
        }

        foreach (var type in fileTypes)
        {
          var item = type.AsString();
          var list = item.Split(" ");
          foreach (var extension in list)
          {
            if (Regex.Match(extension, "(^[.]+[A-Za-z0-9]*$)|(^[*]$)").Success)
            {
              openPicker.FileTypeFilter.Add(extension);
            }
          }
        }
      }
      else
      {
        openPicker.FileTypeFilter.Add("*");
      }

      List<JSValueObject> result;
      if (isFolderPicker)
      {
        var openFolderPicker = new FolderPicker();

        openFolderPicker.ViewMode = PickerViewMode.List;
        openFolderPicker.SuggestedStartLocation = PickerLocationId.DocumentsLibrary;
        openFolderPicker.FileTypeFilter.Add("*");

        result = await PickFolderAsync(openFolderPicker, cache, readContent);

      }
      else
      {
        if (isMultiple)
        {
          result = await PickMultipleFileAsync(openPicker, cache, readContent);
        }
        else
        {
          result = await PickSingleFileAsync(openPicker, cache, readContent);
        }
      }

      return result;
    }

    [ReactMethod("pickDirectory")]
    public async Task<JSValueObject> PickDirectory()
    {
      TaskCompletionSource<JSValueObject> tcs = new TaskCompletionSource<JSValueObject>();

      await CoreApplication.MainView.CoreWindow.Dispatcher.RunAsync(CoreDispatcherPriority.Normal, async () =>
      {
        var openFolderPicker = new FolderPicker();

        openFolderPicker.ViewMode = PickerViewMode.List;
        openFolderPicker.SuggestedStartLocation = PickerLocationId.DocumentsLibrary;
        openFolderPicker.FileTypeFilter.Add("*");

        var folder = await openFolderPicker.PickSingleFolderAsync();
        if (folder != null)
        {
          JSValueObject obj = new JSValueObject
                {
                    { "uri", folder.Path }
                };

          tcs.SetResult(obj);
        }
        else
        {
          tcs.SetResult(new JSValueObject());
        }
      });

      var result = await tcs.Task;
      return result;
    }
    private async Task<JSValueObject> PrepareFile(StorageFile file, bool cache, bool readContent)
    {
      string base64Content = null;
      if (readContent)
      {
        var fileStream = await file.OpenReadAsync();
        using (StreamReader reader = new StreamReader(fileStream.AsStream()))
        {
          using (var memstream = new MemoryStream())
          {
            await reader.BaseStream.CopyToAsync(memstream);
            var bytes = memstream.ToArray();
            base64Content = Convert.ToBase64String(bytes);
          }
        }
      }

      if (cache == true)
      {
        var fileInCache = await file.CopyAsync(ApplicationData.Current.TemporaryFolder, file.Name.ToString(), NameCollisionOption.ReplaceExisting);
        var basicProperties = await fileInCache.GetBasicPropertiesAsync();

        JSValueObject result = new JSValueObject
                {
                    { FIELD_URI, file.Path },
                    { FIELD_FILE_COPY_URI, file.Path },
                    { FIELD_TYPE, file.ContentType },
                    { FIELD_NAME, file.Name },
                    { FIELD_SIZE, basicProperties.Size},
                    { FIELD_CONTENT, base64Content }
                };

        return result;
      }
      else
      {
        var basicProperties = await file.GetBasicPropertiesAsync();

        JSValueObject result = new JSValueObject
                {
                    { FIELD_URI, file.Path },
                    { FIELD_FILE_COPY_URI, file.Path },
                    { FIELD_TYPE, file.ContentType },
                    { FIELD_NAME, file.Name },
                    { FIELD_SIZE, basicProperties.Size},
                    { FIELD_CONTENT, base64Content }
                };

        return result;
      }
    }

    private async Task<List<JSValueObject>> PickMultipleFileAsync(FileOpenPicker picker, bool cache, bool readContent)
    {
      TaskCompletionSource<List<JSValueObject>> tcs = new TaskCompletionSource<List<JSValueObject>>();

      await CoreApplication.MainView.CoreWindow.Dispatcher.RunAsync(CoreDispatcherPriority.Normal, async () =>
      {
        IReadOnlyList<StorageFile> files = await picker.PickMultipleFilesAsync();
        if (files.Count > 0)
        {
          List<JSValueObject> jarrayObj = new List<JSValueObject>();
          foreach (var file in files)
          {
            var processedFile = await PrepareFile(file, cache, readContent);
            jarrayObj.Add(processedFile);
          }

          tcs.SetResult(jarrayObj);
        }
        else
        {
           tcs.SetResult(new List<JSValueObject>());
        }
      });

      var result = await tcs.Task;
      return result;
    }

    private async Task<List<JSValueObject>> PickSingleFileAsync(FileOpenPicker picker, bool cache, bool readContent)
    {
      TaskCompletionSource<JSValueObject> tcs = new TaskCompletionSource<JSValueObject>();

      await CoreApplication.MainView.CoreWindow.Dispatcher.RunAsync(CoreDispatcherPriority.Normal, async () =>
      {
        var file = await picker.PickSingleFileAsync();
        if (file != null)
        {
          var processedFile = await PrepareFile(file, cache, readContent);
          tcs.SetResult(processedFile);
        }
        else
        {
          tcs.SetResult(new JSValueObject());
        }
      });

      var result = await tcs.Task;

      List<JSValueObject> list = new List<JSValueObject>() { result };

      return list;
    }

    private async Task<List<JSValueObject>> PickFolderAsync(FolderPicker picker, bool cache, bool readContent)
    {
      TaskCompletionSource<List<JSValueObject>> tcs = new TaskCompletionSource<List<JSValueObject>>();

      await CoreApplication.MainView.CoreWindow.Dispatcher.RunAsync(CoreDispatcherPriority.Normal, async () =>
      {
        var folder = await picker.PickSingleFolderAsync();
        if (folder != null)
        {
          List<JSValueObject> jarrayObj = new List<JSValueObject>();
          var files = await folder.GetFilesAsync();
          foreach (var file in files)
          {
            var preparedFile = await PrepareFile(file, cache, readContent);
            jarrayObj.Add(preparedFile);
          }

          tcs.SetResult(jarrayObj);
        }
      });

      var result = await tcs.Task;
      return result;
    }
  }
}
