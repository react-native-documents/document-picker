require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-document-viewer"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => "13.0" }
  s.source       = { :git => "https://github.com/react-native-documents/sponsors-only.git", :tag => "v#{s.version}" }
  s.frameworks   = 'QuickLook'

  s.source_files = ["ios/**/*.{h,m,mm}"]

  if ENV['RCT_NEW_ARCH_ENABLED'] == '1' then
    # RN 71+
    install_modules_dependencies(s)
  else
    s.dependency "React-Core"
  end
end
