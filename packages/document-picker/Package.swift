// swift-tools-version: 6.0

import Foundation
import PackageDescription

// React Native evaluates this package through build/generated/autolinking/libs/.
let reactHeaders: [Target.Dependency] = [
    .product(name: "ReactHeaders", package: "ReactNative"),
    .product(name: "ReactNativeHeaders", package: "ReactNative"),
    .product(name: "ReactNativeDependenciesHeaders", package: "ReactNative"),
    .product(name: "ReactAppHeaders", package: "React-GeneratedCode"),
]

// Root targets at "." while excluding all unrelated npm/repository contents.
let usedRootEntries: Set<String> = ["ios", "spm-headers", "spm-support", "Package.swift"]
let unusedRootEntries = try! FileManager.default.contentsOfDirectory(atPath: Context.packageDirectory)
    .filter { !usedRootEntries.contains($0) }
    .sorted()

let iosDirectory = URL(fileURLWithPath: Context.packageDirectory).appendingPathComponent("ios")
let iosEntries = try! FileManager.default.subpathsOfDirectory(atPath: iosDirectory.path)
    .filter { !$0.contains(".xcodeproj/") }

func unusedIosEntries(keeping kept: Set<String>) -> [String] {
    iosEntries.filter { entry in
        let url = iosDirectory.appendingPathComponent(entry)
        if url.pathExtension == "xcodeproj" { return true }
        let isFile = try! url.resourceValues(forKeys: [.isRegularFileKey]).isRegularFile == true
        return isFile && !kept.contains(entry)
    }
    .map { "ios/" + $0 }
    .sorted()
}

let swiftIosEntries = Set(iosEntries.filter { $0.hasPrefix("swift/") && $0.hasSuffix(".swift") })
let converterIosEntries: Set<String> = [
    "RCTConvert+RNDocumentPicker.h",
    "RCTConvert+RNDocumentPicker.mm",
]
let moduleIosEntries: Set<String> = [
    "RNDocumentPicker.h",
    "RNDocumentPicker.mm",
]

let package = Package(
    name: "react_native_document_picker",
    platforms: [.iOS("15.1")],
    products: [
        .library(
            name: "react_native_document_picker",
            targets: [
                "react_native_document_picker",
                "RNDocumentPickerConvert",
                "RNDocumentPickerObjC",
            ]
        ),
    ],
    dependencies: [
        .package(name: "ReactNative", path: "../../../../xcframeworks"),
        .package(name: "React-GeneratedCode", path: "../../../ios"),
    ],
    targets: [
        // PickerOptions needs this custom RCTConvert category as a Clang module.
        .target(
            name: "RNDocumentPickerConvert",
            dependencies: reactHeaders,
            path: ".",
            exclude: unusedRootEntries
                + ["spm-support", "spm-headers/public", "spm-headers/react_native_document_picker-Swift.h"]
                + unusedIosEntries(keeping: converterIosEntries),
            sources: ["ios/RCTConvert+RNDocumentPicker.mm"],
            publicHeadersPath: "spm-headers/converter-public",
            cSettings: [
                .define("RCT_NEW_ARCH_ENABLED", to: "1"),
            ],
            cxxSettings: [
                .define("RCT_NEW_ARCH_ENABLED", to: "1"),
            ]
        ),
        // Preserve CocoaPods' normalized Swift module name. The ObjC++ bridge
        // depends on Swift, avoiding a target dependency cycle.
        .target(
            name: "react_native_document_picker",
            dependencies: ["RNDocumentPickerConvert"] + reactHeaders,
            path: ".",
            exclude: unusedRootEntries
                + ["spm-headers"]
                + unusedIosEntries(keeping: swiftIosEntries),
            sources: ["ios/swift", "spm-support"]
        ),
        .target(
            name: "RNDocumentPickerObjC",
            dependencies: [
                "react_native_document_picker",
                "RNDocumentPickerConvert",
            ] + reactHeaders,
            path: ".",
            exclude: unusedRootEntries
                + ["spm-support", "spm-headers/converter-public"]
                + unusedIosEntries(keeping: moduleIosEntries),
            sources: ["ios/RNDocumentPicker.mm"],
            publicHeadersPath: "spm-headers/public",
            cSettings: [
                .define("RCT_NEW_ARCH_ENABLED", to: "1"),
                .headerSearchPath("spm-headers"),
            ],
            cxxSettings: [
                .define("RCT_NEW_ARCH_ENABLED", to: "1"),
                .headerSearchPath("spm-headers"),
            ]
        ),
    ],
    swiftLanguageModes: [.v6],
    cxxLanguageStandard: .cxx20
)
