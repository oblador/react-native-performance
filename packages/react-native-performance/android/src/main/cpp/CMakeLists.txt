# For more information about using CMake with Android Studio, read the
# documentation: https://d.android.com/studio/projects/add-native-code.html

# Sets the minimum version of CMake required to build the native library.
project("rnperformance")
cmake_minimum_required(VERSION 3.18.1)

# Creates and names a library, sets it as either STATIC
# or SHARED, and provides the relative paths to its source code.
# You can define multiple libraries, and CMake builds them for you.
# Gradle automatically packages shared libraries with your APK.
add_library( # Sets the name of the library.
        rnperformance

        # Sets the library as a shared library.
        SHARED

        # Provides a relative path to your source file(s).
        RnPerformance.cpp)

set (REACT_ANDROID_DIR "/Users/olivier.payen/repo/react-native-performance/node_modules/react-native/ReactAndroid")
set (FBJNI_HEADERS_DIR "${REACT_ANDROID_DIR}/src/main/jni/first-party/fbjni/headers")

file (GLOB LIBRN_DIR "${PREBUILT_DIR}/${ANDROID_ABI}")
file (GLOB LIBFBJNI_INCLUDE_DIR ${FBJNI_HEADERS_DIR})

include_directories(
        "${NODE_MODULES_DIR}/react-native/React"
        "${NODE_MODULES_DIR}/react-native/React/Base"
        "${NODE_MODULES_DIR}/react-native/ReactCommon/jsi"
)


message(AUTHOR_WARNING "REACT_ANDROID_DIR: ${REACT_ANDROID_DIR}")

target_include_directories(
        rnperformance
        PRIVATE
        "${REACT_ANDROID_DIR}/src/main/jni"
)

set_target_properties(
        rnperformance PROPERTIES
        CXX_STANDARD 17
        CXX_EXTENSIONS OFF
        POSITION_INDEPENDENT_CODE ON
)

# Searches for a specified prebuilt library and stores the path as a
# variable. Because CMake includes system libraries in the search path by
# default, you only need to specify the name of the public NDK library
# you want to add. CMake verifies that the library exists before
# completing its build.
find_library(
        REACT_NATIVE_JNI_LIB
        reactnativejni
        PATHS ${LIBRN_DIR}
        NO_CMAKE_FIND_ROOT_PATH
)

find_library(
        JSI_LIB
        jsi
        PATHS ${LIBRN_DIR}
        NO_CMAKE_FIND_ROOT_PATH
)

# Specifies libraries CMake should link to your target library. You
# can link multiple libraries, such as libraries you define in this
# build script, prebuilt third-party libraries, or system libraries.
target_link_libraries( # Specifies the target library.
        rnperformance
        ${JSI_LIB}
        ${REACT_NATIVE_JNI_LIB}
        )