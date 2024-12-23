// LICENSE: see License.md in the package root

import Foundation

@objc public class FileOperations: NSObject {
  
  @objc public static func keepLocalCopyAtUniqueDestination(from: Array<Dictionary<String, String>>, destinationPreset: String, resolve: @escaping RNDPPromiseResolveBlock) {
    Task {
      let results = await moveFiles(from: from, destinationPreset: destinationPreset)
      resolve(results)
    }
  }
  
  static func moveFiles(from: Array<Dictionary<String, String>>, destinationPreset: String) async -> [[String: String?]] {
    let destinationRootDir = getDirectoryForFileDestination(destinationPreset)
    let uniqueSubDirName = UUID().uuidString
    let destinationDir: URL = destinationRootDir.appendingPathComponent("\(uniqueSubDirName)/", isDirectory: true)
    // TODO do we need all of this Task dance?
    
    return await withTaskGroup(of: LocalCopyResponse.self) { group in
      var results: Array<Dictionary<String, String?>> = [[String: String?]]()
      
      for dictionary in from {
        group.addTask {
          do {
            guard let uriString = dictionary["uri"], let uri = URL(string: uriString) else {
              return LocalCopyResponse.error(sourceUri: dictionary["uri"], copyError: "Invalid URI")
            }
            guard let fileName = dictionary["fileName"] else {
              return LocalCopyResponse.error(sourceUri: uri.absoluteString, copyError: "Invalid fileName")
            }
            
            let destinationUrl = try moveToDestination(from: uri, usingFilename: fileName, destinationDir: destinationDir)
            return LocalCopyResponse.success(sourceUri: uri.absoluteString, localUri: destinationUrl.absoluteString)
          } catch {
            return LocalCopyResponse.error(sourceUri: dictionary["uri"]!, copyError: error.localizedDescription)
          }
        }
      }
      
      for await result in group {
        results.append(result.dictionaryRepresentation)
      }
      
      return results
    }
  }
  
  static func moveToDestination(from: URL, usingFilename fileName: String, destinationDir: URL) throws -> URL {
    let destinationFile = destinationDir.appendingPathComponent(fileName).standardized
    
    guard destinationFile.path.hasPrefix(destinationDir.standardized.path) else {
      throw NSError(domain: "PathTraversalPrevention", code: 400, userInfo: [NSLocalizedDescriptionKey: "The copied file is attempting to write outside of the target directory."])
    }
    
    try FileManager.default.createDirectory(at: destinationDir, withIntermediateDirectories: true, attributes: nil)
    try FileManager.default.moveItem(at: from, to: destinationFile)
    
    return destinationFile
  }
  
  static func getDirectoryForFileDestination(_ copyToDirectory: String) -> URL {
    if copyToDirectory == "documentDirectory" {
      return FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
    }
    return FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask).first!
  }
}
