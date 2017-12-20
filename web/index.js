const E_DOCUMENT_PICKER_CANCELED = "DOCUMENT_PICKER_CANCELED";


function mapFiles(file)
{
  file.uri = URL.createObjectURL(file);

  return file;
}


function pick({multiple, type})
{
  const input = document.createElement('input');

  const promise = new Promise(function(resolve, reject)
  {
    function onchange()
    {
      input.removeEventListener('change', onchange);

      const {files} = this;
      // TODO Not working, there's no easy way to detect `cancel` button
      if ( !files.length ) {
        return reject(E_DOCUMENT_PICKER_CANCELED);
      }

      resolve(Array.prototype.map.call(files, mapFiles));
    }

    input.addEventListener('change', onchange);
  });

  input.accept = type.join(',');
  input.multiple = multiple;
  input.type = 'file';

  input.click();

  return promise;
}


exports.pick = pick;
