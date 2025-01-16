# the minimum version of CMake.
cmake_minimum_required(VERSION 3.4.1)
project(eventpost)

set(NATIVERENDER_ROOT_PATH ${CMAKE_CURRENT_SOURCE_DIR})
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

if(DEFINED PACKAGE_FIND_FILE)
    include(${PACKAGE_FIND_FILE})
endif()

include_directories(${NATIVERENDER_ROOT_PATH}
                    ${NATIVERENDER_ROOT_PATH}/include)

add_library(native_event_post SHARED
            event_post_napi_init.cpp
            napi/StickyEvent.cpp
            )

find_library(
    # Sets the name of the path variable.
    hilog-lib
    # Specifies the name of the NDK library that
    # you want CMake to locate.
    hilog_ndk.z
)

find_library(
    # Sets the name of the path variable.
    libnapi-lib
    # Specifies the name of the NDK library that
    # you want CMake to locate.
    ace_napi.z
)

target_link_libraries(native_event_post PUBLIC ${hilog-lib} ${libnapi-lib})

target_link_libraries(native_event_post PUBLIC libhilog_ndk.z.so)

