require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-document-picker"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.ios.deployment_target = '11.0'
  # s.tvos.deployment_target = '9.2'
  s.osx.deployment_target = '10.5'

  s.source       = { :git => "https://github.com/rnmods/react-native-document-picker.git", :tag => "v#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm}"

  s.dependency "React-Core"
end
