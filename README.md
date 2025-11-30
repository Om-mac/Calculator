# Calculator Project

A full-stack calculator application with a modern web frontend, Node.js server, and C++ backend.

## Project Structure

```
calculator/
├── frontend/                    # Web UI (HTML/CSS/JS)
│   ├── index.html
│   ├── style.css
│   └── app.js
├── backend/                     # C++ calculator engine
│   ├── src/
│   │   ├── main.cpp
│   │   └── calculator.cpp
│   ├── include/
│   │   └── calculator.h
│   ├── build/                   # Compiled binaries
│   ├── Makefile
│   └── CMakeLists.txt
├── server.js                    # Node.js Express server (bridge)
├── package.json
├── docs/
│   └── API.md
└── README.md
```

## Prerequisites

- **macOS/Linux**: Ensure you have:
  - C++ compiler (clang++, g++)
  - Node.js 14+ 
  - npm (comes with Node.js)

Install Node.js:
```bash
# Using Homebrew on macOS
brew install node
```

## Setup & Installation

### 1. Build C++ Backend

```bash
cd backend
make clean
make
```

This creates `backend/build/calculator` executable.

### 2. Install Node.js Dependencies

```bash
cd /path/to/calculator
npm install
```

This installs express and cors.

### 3. Run the Server

```bash
npm start
```

The server will start on `http://localhost:8080`

## Usage

1. **Open in Browser**: Visit `http://localhost:8080` in your browser
2. **Enter Expression**: Type or click buttons (e.g., `2+3*5`)
3. **Calculate**: Press `=` or Enter
4. **View History**: Scroll through calculation history

### Supported Operations

| Operator | Function |
|----------|----------|
| `+` | Addition |
| `-` | Subtraction |
| `*` | Multiplication |
| `/` | Division |
| `%` | Modulo |
| `^` | Power |

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Enter | Calculate |
| Backspace | Delete |
| Escape | Clear |
| 0-9, +, -, *, /, %, ^ | Add to expression |

## Features

✓ Modern, responsive web interface
✓ Real-time calculation with C++ backend
✓ Calculation history with localStorage
✓ Full keyboard support
✓ Error handling and validation
✓ Fallback to local evaluation if backend unavailable
✓ CORS enabled for cross-origin requests
✓ Beautiful gradient UI with animations

## Architecture

```
Browser Frontend (HTML/CSS/JS)
           ↓
    Express Server (Node.js)
           ↓
   C++ Calculator Backend
    (/backend/build/calculator)
```

The Node.js server acts as a bridge, receiving HTTP requests from the frontend and communicating with the C++ calculator process via stdin/stdout.

## Local Evaluation Fallback

If the C++ backend is unavailable, the frontend automatically falls back to JavaScript-based evaluation (works offline too).

## Troubleshooting

### Backend not found
Make sure C++ backend is built:
```bash
cd backend && make
```

### Port 8080 already in use
Change the port in `server.js`:
```javascript
const PORT = 8081; // or another port
```

### npm modules missing
Reinstall dependencies:
```bash
npm install
```

## Requirements
- Node.js 14+
- npm
- C++17 or later
- macOS/Linux (may need modification for Windows)

## License
MIT
