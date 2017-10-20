using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RNDocumentPicker
{
    static class NginxMimeTypes
    {
        public static Dictionary<string, List<string>> MimeTypeDictionary = new Dictionary<string, List<string>> {
            {"application/atom+xml", new List<string>{"atom"}  },
            {"application/font-woff", new List<string>{"woff"}  },
            {"application/java-archive", new List<string>{"jar","war","ear"}  },
            {"application/javascript", new List<string>{"js"}  },
            {"application/json", new List<string>{"json"}  },
            {"application/mac-binhex40", new List<string>{"hqx"}  },
            {"application/msword", new List<string>{"doc"}  },
            {"application/octet-stream", new List<string>{"bin","exe","dll","deb","dmg","iso","img","msi","msp","msm"}  },
            {"application/pdf", new List<string>{"pdf"}  },
            {"application/postscript", new List<string>{"ps","eps","ai"}  },
            {"application/rss+xml", new List<string>{"rss"}  },
            {"application/rtf", new List<string>{"rtf"}  },
            {"application/vnd.apple.mpegurl", new List<string>{"m3u8"}  },
            {"application/vnd.google-earth.kml+xml", new List<string>{"kml"}  },
            {"application/vnd.google-earth.kmz", new List<string>{"kmz"}  },
            {"application/vnd.ms-excel", new List<string>{"xls"}  },
            {"application/vnd.ms-fontobject", new List<string>{"eot"}  },
            {"application/vnd.ms-powerpoint", new List<string>{"ppt"}  },
            {"application/vnd.oasis.opendocument.graphics", new List<string>{"odg"}  },
            {"application/vnd.oasis.opendocument.presentation", new List<string>{"odp"}  },
            {"application/vnd.oasis.opendocument.spreadsheet", new List<string>{"ods"}  },
            {"application/vnd.oasis.opendocument.text", new List<string>{"odt"}  },
            {"application/vnd.openxmlformats-officedocument.presentationml.presentation", new List<string>{"pptx"}  },
            {"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", new List<string>{"xlsx"}  },
            {"application/vnd.openxmlformats-officedocument.wordprocessingml.document", new List<string>{"docx"}  },
            {"application/vnd.wap.wmlc", new List<string>{"wmlc"}  },
            {"application/x-7z-compressed", new List<string>{"7z"}  },
            {"application/x-cocoa", new List<string>{"cco"}  },
            {"application/x-java-archive-diff", new List<string>{"jardiff"}  },
            {"application/x-java-jnlp-file", new List<string>{"jnlp"}  },
            {"application/x-makeself", new List<string>{"run"}  },
            {"application/x-perl", new List<string>{"pl","pm"}  },
            {"application/x-pilot", new List<string>{"prc","pdb"}  },
            {"application/x-rar-compressed", new List<string>{"rar"}  },
            {"application/x-redhat-package-manager", new List<string>{"rpm"}  },
            {"application/x-sea", new List<string>{"sea"}  },
            {"application/x-shockwave-flash", new List<string>{"swf"}  },
            {"application/x-stuffit", new List<string>{"sit"}  },
            {"application/x-tcl", new List<string>{"tcl","tk"}  },
            {"application/x-x509-ca-cert", new List<string>{"der","pem","crt"}  },
            {"application/x-xpinstall", new List<string>{"xpi"}  },
            {"application/xhtml+xml", new List<string>{"xhtml"}  },
            {"application/xspf+xml", new List<string>{"xspf"}  },
            {"application/zip", new List<string>{"zip"}  },
            {"audio/midi", new List<string>{"mid","midi","kar"}  },
            {"audio/mpeg", new List<string>{"mp3"}  },
            {"audio/ogg", new List<string>{"ogg"}  },
            {"audio/x-m4a", new List<string>{"m4a"}  },
            {"audio/x-realaudio", new List<string>{"ra"}  },
            {"image/gif", new List<string>{"gif"}  },
            {"image/jpeg", new List<string>{"jpeg","jpg"}  },
            {"image/png", new List<string>{"png"}  },
            {"image/svg+xml", new List<string>{"svg","svgz"}  },
            {"image/tiff", new List<string>{"tif","tiff"}  },
            {"image/vnd.wap.wbmp", new List<string>{"wbmp"}  },
            {"image/webp", new List<string>{"webp"}  },
            {"image/x-icon", new List<string>{"ico"}  },
            {"image/x-jng", new List<string>{"jng"}  },
            {"image/x-ms-bmp", new List<string>{"bmp"}  },
            {"text/css", new List<string>{"css"}  },
            {"text/html", new List<string>{"html","htm","shtml"}  },
            {"text/mathml", new List<string>{"mml"}  },
            {"text/plain", new List<string>{"txt"}  },
            {"text/vnd.sun.j2me.app-descriptor", new List<string>{"jad"}  },
            {"text/vnd.wap.wml", new List<string>{"wml"}  },
            {"text/x-component", new List<string>{"htc"}  },
            {"text/xml", new List<string>{"xml"}  },
            {"video/3gpp", new List<string>{"3gpp","3gp"}  },
            {"video/mp2t", new List<string>{"ts"}  },
            {"video/mp4", new List<string>{"mp4"}  },
            {"video/mpeg", new List<string>{"mpeg","mpg"}  },
            {"video/quicktime", new List<string>{"mov"}  },
            {"video/webm", new List<string>{"webm"}  },
            {"video/x-flv", new List<string>{"flv"}  },
            {"video/x-m4v", new List<string>{"m4v"}  },
            {"video/x-mng", new List<string>{"mng"}  },
            {"video/x-ms-asf", new List<string>{"asx","asf"}  },
            {"video/x-ms-wmv", new List<string>{"wmv"}  },
            {"video/x-msvideo", new List<string>{"avi"}  }
        };

        /// <summary>
        /// Returns the extensions of matching mime type
        /// </summary>
        /// <param name="MimeType"></param>
        /// <returns></returns>
        private static List<string> FindExtensionsByMimeType(string MimeType)
        {

           return MimeTypeDictionary.Where(mt => mt.Key.ToLowerInvariant().Contains(MimeType.ToLowerInvariant())).Select(mt => mt.Value).SelectMany(x => x).Select(x => "." + x).ToList();

        }

        /// <summary>
        /// Returns the Extensions that matches the MimeType. If no match is found an error is thrown.
        /// </summary>
        /// <param name="MimeType"></param>
        /// <returns></returns>
        public static List<string> GetExtensions(List<string> MimeTypes)
        {
            List<string> result = new List<string>();
            foreach (string MimeType in MimeTypes) {
                if (MimeType != "*/*")
                {
                    result = result.Union(FindExtensionsByMimeType(MimeType.Replace("*", string.Empty))).ToList();
                }
                else {
                    result = new List<string>() { "*" };
                    break;
                }
            }
            return result;
        }
    }
}
