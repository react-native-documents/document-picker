/**
 * Trick for getting file selector cancel using `body.onfocus` event found at
 * http://trishulgoel.com/handle-cancel-click-on-file-input/
 */

const E_DOCUMENT_PICKER_CANCELED = "DOCUMENT_PICKER_CANCELED";


const {body} = document;

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
    function onfocus()
    {
      body.removeEventListener('focus', onfocus);

      const {files} = input;
      if ( !files.length ) {
        return reject(E_DOCUMENT_PICKER_CANCELED);
      }

      resolve(Array.prototype.map.call(files, addUri));
    }

    body.addEventListener('focus', onfocus);
  });

  input.accept = type.join(',');
  input.multiple = multiple;

  input.click();

  return promise;
}


exports.pick = pick;
