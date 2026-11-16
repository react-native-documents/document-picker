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
let usedRootEntries: Set<String> = ["ios", "Package.swift"]
let unusedRootEntries = try! FileManager.default.contentsOfDirectory(atPath: Context.packageDirectory)
    .filter { !usedRootEntries.contains($0) }
    .sorted()
let unusedIosEntries = try! FileManager.default.contentsOfDirectory(
    atPath: Context.packageDirectory + "/ios"
)
    .filter { $0.hasSuffix(".xcodeproj") }
    .map { "ios/" + $0 }
    .sorted()

let package = Package(
    name: "react_native_document_viewer",
    platforms: [.iOS("15.1")],
    products: [
        .library(name: "react_native_document_viewer", targets: ["react_native_document_viewer"]),
    ],
    dependencies: [
        .package(name: "ReactNative", path: "../../../../xcframeworks"),
        .package(name: "React-GeneratedCode", path: "../../../ios"),
    ],
    targets: [
        .target(
            name: "react_native_document_viewer",
            dependencies: reactHeaders,
            path: ".",
            exclude: unusedRootEntries + unusedIosEntries,
            sources: ["ios"],
            publicHeadersPath: "ios",
            cSettings: [
                .define("RCT_NEW_ARCH_ENABLED", to: "1"),
            ],
            cxxSettings: [
                .define("RCT_NEW_ARCH_ENABLED", to: "1"),
                .define("DEBUG", .when(configuration: .debug)),
                .define("NDEBUG", .when(configuration: .release)),
            ],
            linkerSettings: [
                .linkedFramework("QuickLook"),
            ]
        ),
    ],
    cxxLanguageStandard: .cxx20
)
