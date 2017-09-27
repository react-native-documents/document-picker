require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name            = package['name']
  s.version         = package['version']
  s.summary         = package['description']
  s.license         = package['license']
  s.homepage        = package['homepage']
  s.authors         = { 'Elyx0' => 'elyx00@gmail.com' }
  s.source          = { :git => "https://github.com/Elyx0/react-native-document-picker" }
  s.source_files    = "ios/RNDocumentPicker/*.{h,m}"
  s.platform        = :ios, "7.0"
  s.dependency        'React'
end
