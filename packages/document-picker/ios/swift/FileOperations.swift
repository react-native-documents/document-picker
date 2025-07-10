// LICENSE: see License.md in the package root

import Foundation

@objc public class FileOperations: NSObject {
  
  @objc public static func keepLocalCopyAtUniqueDestination(from: [[String: String]], destinationPreset: String, resolve: @escaping RNDPPromiseResolveBlock) {
    DispatchQueue.global(qos: .utility).async {
      let results = moveFiles(from: from, destinationPreset: destinationPreset)
      resolve(results)
    }
  }
  
  static func moveFiles(from: [[String: String]], destinationPreset: String) -> [[String: String?]] {
    let destinationRootDir = getDirectoryForFileDestination(destinationPreset)
    let uniqueSubDirName = UUID().uuidString
    let destinationDir = destinationRootDir.appendingPathComponent(uniqueSubDirName, isDirectory: true)
    
    do {
      try FileManager.default.createDirectory(at: destinationDir, withIntermediateDirectories: true, attributes: nil)
    } catch {
      return from.map { dictionary in
        LocalCopyResponse.error(sourceUri: dictionary["uri"], copyError: "Failed to create destination directory: \(error.localizedDescription)").dictionaryRepresentation
      }
    }
    
    // move files
    return from.map { dictionary in
      moveSingleFile(dictionary: dictionary, destinationDir: destinationDir).dictionaryRepresentation
    }
  }
  
  private static func moveSingleFile(dictionary: [String: String], destinationDir: URL) -> LocalCopyResponse {
    guard let uriString = dictionary["uri"],
          let uri = URL(string: uriString),
          let fileName = dictionary["fileName"] else {
      return LocalCopyResponse.error(
        sourceUri: dictionary["uri"],
        copyError: "Invalid URI or fileName"
      )
    }
    
    do {
      let destinationUrl = try moveToDestination(from: uri, usingFilename: fileName, destinationDir: destinationDir)
      return LocalCopyResponse.success(sourceUri: uri.absoluteString, localUri: destinationUrl.absoluteString)
    } catch {
      return LocalCopyResponse.error(sourceUri: uriString, copyError: error.localizedDescription)
    }
  }
  
  static func moveToDestination(from: URL, usingFilename fileName: String, destinationDir: URL) throws -> URL {
    let destinationFile = destinationDir.appendingPathComponent(fileName).standardized
    
    guard destinationFile.path.hasPrefix(destinationDir.standardized.path) else {
      throw NSError(
        domain: "PathTraversalPrevention",
        code: 400,
        userInfo: [NSLocalizedDescriptionKey: "The copied file is attempting to write outside of the target directory."]
      )
    }
    
    try FileManager.default.moveItem(at: from, to: destinationFile)
    
    return destinationFile
  }
  
  static func getDirectoryForFileDestination(_ copyToDirectory: String) -> URL {
    let searchPath: FileManager.SearchPathDirectory = copyToDirectory == "documentDirectory" ? .documentDirectory : .cachesDirectory
    return FileManager.default.urls(for: searchPath, in: .userDomainMask).first!
  }
}
