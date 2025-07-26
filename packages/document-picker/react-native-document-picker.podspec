require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))
folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'

Pod::Spec.new do |s|
  s.name         = "react-native-document-picker"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => "14.0", :osx => "11.0" }
  s.source       = { :git => "https://github.com/react-native-documents/sponsors-only.git", :tag => "v#{s.version}" }

  s.ios.source_files = "ios/**/*.{h,m,mm,swift}"
  s.osx.source_files = "macos/**/*.{h,m,mm,swift}"
  s.ios.frameworks = 'MobileCoreServices'
  s.osx.frameworks = 'CoreServices'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_OBJC_INTERFACE_HEADER_NAME' => 'react_native_document_picker-Swift.h'
  }
  s.swift_version = '5.0'

  s.dependency "React-Core"

  # Don't install the dependencies when we run `pod install` in the old architecture.
  if ENV['RCT_NEW_ARCH_ENABLED'] == '1' then
    s.compiler_flags = folly_compiler_flags + " -DRCT_NEW_ARCH_ENABLED=1"
    s.pod_target_xcconfig    = {
        "HEADER_SEARCH_PATHS" => "\"$(PODS_ROOT)/boost\"",
        "OTHER_CPLUSPLUSFLAGS" => "-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1",
        "CLANG_CXX_LANGUAGE_STANDARD" => "c++17",
        "DEFINES_MODULE" => "YES",
        "SWIFT_OBJC_INTERFACE_HEADER_NAME" => "react_native_document_picker-Swift.h"
    }
    s.dependency "React-Codegen"
    s.dependency "RCT-Folly"
    s.dependency "RCTRequired"
    s.dependency "RCTTypeSafety"
    s.dependency "ReactCommon/turbomodule/core"
  else
    s.pod_target_xcconfig = {
      'DEFINES_MODULE' => 'YES',
      'SWIFT_OBJC_INTERFACE_HEADER_NAME' => 'react_native_document_picker-Swift.h'
    }
  end
end
