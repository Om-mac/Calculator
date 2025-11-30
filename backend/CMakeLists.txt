cmake_minimum_required(VERSION 3.10)
project(Calculator)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Include directories
include_directories(${PROJECT_SOURCE_DIR}/include)

# Source files
set(SOURCES
    src/main.cpp
    src/calculator.cpp
)

# Executable
add_executable(calculator ${SOURCES})

# Optional: Add library for reuse
add_library(calculatorlib src/calculator.cpp)
target_include_directories(calculatorlib PUBLIC ${PROJECT_SOURCE_DIR}/include)
