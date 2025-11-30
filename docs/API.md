# Calculator API Documentation

## Overview
This calculator backend provides basic arithmetic operations.

## Available Operations

### Basic Operations
- **add(a, b)** - Addition: a + b
- **subtract(a, b)** - Subtraction: a - b
- **multiply(a, b)** - Multiplication: a * b
- **divide(a, b)** - Division: a / b (throws error if b = 0)
- **modulo(a, b)** - Modulo: a % b (throws error if b = 0)
- **power(base, exponent)** - Power: base ^ exponent

### Error Handling
- Division by zero returns error
- Invalid expressions return error message

## Building

### Using CMake
```bash
cd backend
mkdir build && cd build
cmake ..
make
```

### Using Makefile
```bash
cd backend
make
make run
```

## Integration with Frontend
Connect your JavaScript frontend to this C++ backend via:
- HTTP REST API (use a web framework like Express.js as middleware)
- WebSockets
- Direct process communication
