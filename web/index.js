const E_DOCUMENT_PICKER_CANCELED = "DOCUMENT_PICKER_CANCELED";


const input = document.createElement('input');
      input.type = 'file';


function addUri(file)
{
  file.uri = URL.createObjectURL(file);

  return file;
}

function removeUri(file)
{
  URL.revokeObjectURL(file.uri);

  delete file.uri;
}


function pick({multiple, type})
{
  // Revoke previous objectUrls
  const {files} = input;
  if( files ) {
    Array.prototype.map.forEach(files, removeUri);
  }

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

      resolve(Array.prototype.map.call(files, addUri));
    }

    input.addEventListener('change', onchange);
  });

  input.accept = type.join(',');
  input.multiple = multiple;

  input.click();

  return promise;
}


exports.pick = pick;
