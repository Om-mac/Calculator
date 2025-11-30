# 🧮 Full-Stack Calculator

A modern, full-stack calculator with C++ backend, Express.js server, and beautiful responsive frontend. Features real-time expression evaluation, dark mode, calculation history with multi-format export (CSV/TXT), and full keyboard support.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0-brightgreen.svg)
![C++](https://img.shields.io/badge/C%2B%2B-17-blue.svg)
![Status](https://img.shields.io/badge/status-active-brightgreen.svg)

---

## ✨ Features

- 🎯 **Real-time Expression Evaluation** - Instant results with proper operator precedence
- ⌨️ **Keyboard Support** - Full keyboard shortcuts for fast calculations
- 📊 **Calculation History** - Track and reuse previous calculations (localStorage)
- 📥 **Multi-Format Export** - Dropdown menu to export as CSV or TXT formats
- 🌙 **Dark Mode** - Toggle themes with system preference detection
- 🎨 **Modern UI** - Beautiful gradients, animations, and glassmorphic design
- 🚀 **High Performance** - C++ backend for fast calculations
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🔄 **Fallback Mode** - JavaScript fallback when backend unavailable
- ⚙️ **Operator Precedence** - Proper mathematical expression parsing

---

## 📋 Supported Operations

| Operator | Function | Example |
|----------|----------|---------|
| `+` | Addition | `5 + 3 = 8` |
| `-` | Subtraction | `10 - 4 = 6` |
| `*` | Multiplication | `6 * 7 = 42` |
| `/` | Division | `20 / 4 = 5` |
| `%` | Modulo | `10 % 3 = 1` |
| `^` | Power | `2 ^ 3 = 8` |

---

## 🏗️ Project Architecture

```
┌─────────────────────────────────┐
│   Browser (Web Frontend)        │
│  ┌─────────────────────────┐    │
│  │ HTML/CSS/JavaScript     │    │
│  │ • Modern UI             │    │
│  │ • Button Grid           │    │
│  │ • History Management    │    │
│  └─────────────────────────┘    │
└────────────────┬────────────────┘
                 │ HTTP Requests
                 ↓
┌─────────────────────────────────┐
│  Express.js Server (Node.js)    │
│  ┌─────────────────────────┐    │
│  │ REST API Endpoint       │    │
│  │ • Receives expressions  │    │
│  │ • Routes to C++ backend │    │
│  │ • Returns results       │    │
│  └─────────────────────────┘    │
└────────────────┬────────────────┘
                 │ stdin/stdout
                 ↓
┌─────────────────────────────────┐
│  C++ Calculator Engine          │
│  ┌─────────────────────────┐    │
│  │ Expression Parser       │    │
│  │ • Tokenizes input       │    │
│  │ • Respects precedence   │    │
│  │ • Evaluates expression  │    │
│  └─────────────────────────┘    │
└─────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **macOS/Linux**: Ensure you have:
  - C++ compiler (clang++, g++)
  - Node.js 14+ 
  - npm (comes with Node.js)
  - git

**Install Node.js** (if not already installed):
```bash
# Using Homebrew on macOS
brew install node

# Or visit https://nodejs.org/
```

### Installation & Setup

1. **Clone the repository**
```bash
git clone https://github.com/Om-mac/Calculator.git
cd Calculator
```

2. **Build C++ Backend**
```bash
cd backend
make clean && make
cd ..
```

3. **Install Dependencies & Start**
```bash
npm install && npm start
```

4. **Open Browser**
Visit `http://localhost:3000` 🎉

---

## 💻 Usage

### Calculator Operations

**Button/Mouse Input:**
- Click numbers `0-9` to build expressions
- Click operators `+`, `-`, `*`, `/`, `%`, `^`
- Press `=` to calculate
- `AC` clears all, `DEL` deletes last character

**Keyboard Input:**
- Type: `0-9`, `+`, `-`, `*`, `/`, `%`, `^`, `.`
- `Enter` - Calculate
- `Backspace` - Delete last character
- `Escape` - Clear all

**Dark Mode:**
- Click 🌙 icon to toggle dark/light theme
- Automatically saves preference to localStorage
- Respects system preference on first visit

**Export History:**
- Click **📥 Export ▼** button to open dropdown menu
- Choose export format:
  - **📊 Export as CSV** - Spreadsheet format with headers
  - **📄 Export as TXT** - Formatted text report
- Downloads with all calculations and timestamps
- Filename: `Calculator_History_YYYY-MM-DD.csv` or `.txt`

### Examples

```
2 + 3              = 5
10 * 5 - 2         = 48
100 / 4            = 25
2 ^ 8              = 256
10 % 3             = 1
```

---

## 📁 Project Structure

```
Calculator/
├── frontend/
│   ├── index.html          # Main UI
│   ├── style.css           # Styling & animations
│   └── app.js              # Client-side logic
│
├── backend/
│   ├── src/
│   │   ├── main.cpp        # Entry point
│   │   └── calculator.cpp  # Expression parser & evaluator
│   ├── include/
│   │   └── calculator.h    # Header file
│   ├── build/              # Compiled binaries
│   ├── Makefile            # Build configuration
│   └── CMakeLists.txt      # CMake configuration
│
├── server.js               # Express.js server
├── package.json            # Node.js dependencies
├── .gitignore              # Git ignore rules
├── docs/
│   └── API.md              # API documentation
└── README.md               # This file
```

---

## 🔧 Configuration

### Change Port

Edit `server.js`:
```javascript
const PORT = process.env.PORT || 3000;  // Change 3000 to your port
```

Or run with environment variable:
```bash
PORT=8000 npm start
```

### Build with CMake (Alternative)

```bash
cd backend
mkdir build && cd build
cmake ..
make
cd ../..
npm start
```

---

## 🛠️ API Endpoint

### POST `/calculate`

Send mathematical expressions to the backend.

**Request:**
```json
{ "expression": "2+3*5" }
```

**Response (Success):**
```json
{ "expression": "2+3*5", "result": 17 }
```

**Response (Error):**
```json
{ "error": "Division by zero" }
```

**Example with cURL:**
```bash
curl -X POST http://localhost:3000/calculate \
  -H "Content-Type: application/json" \
  -d '{"expression":"10+5"}'
```

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `0-9` | Add number |
| `+ - * / %` | Add operator |
| `^` | Power |
| `.` | Decimal point |
| `Enter` | Calculate |
| `Backspace` | Delete last char |
| `Escape` | Clear all |

---

## 📊 Calculation History

- **View History** - Scroll through the history panel
- **Click Item** - Load expression and result back into calculator
- **Clear History** - Click "Clear History" button
- **Export** - Click dropdown menu to export as CSV or TXT
- **Persistence** - Saved to localStorage, persists across sessions

---

## 🔍 Technical Details

### Expression Parser
- Recursive descent parser in C++
- Proper operator precedence
- Supports parenthetical grouping
- Handles floating-point numbers
- Comprehensive error handling

### Fallback Mode
If C++ backend unavailable:
- Switches to JavaScript evaluation
- Full functionality maintained
- Works completely offline
- No feature loss

### Error Handling
- Division by zero detection
- Invalid expression feedback
- Input validation
- User-friendly messages

---

## 🐛 Troubleshooting

**Backend Not Starting:**
```bash
cd backend && make clean && make && cd ..
```

**Port Already in Use:**
```bash
lsof -i :3000  # Find process
kill -9 <PID>   # Kill it
PORT=3001 npm start  # Use different port
```

**npm Modules Missing:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Git Configuration Issues:**
```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

## 📈 Performance

- **Frontend Load**: < 1s
- **Calculation Speed**: < 10ms (including network)
- **History Limit**: 50 calculations
- **UI Animations**: 60fps

## 🔐 Security

- Input validation (frontend & backend)
- Error messages don't expose system info
- CORS enabled for safe requests
- No sensitive data stored locally

## 📝 Development

### Adding New Operations

1. **Update C++ header (calculator.h):**
```cpp
double sqrt(double a);
```

2. **Implement in calculator.cpp:**
```cpp
double Calculator::sqrt(double a) {
    return std::sqrt(a);
}
```

3. **Add to parser (calculator.cpp):**
```cpp
else if (op == '@') result = sqrt(right);  // @ for sqrt
```

4. **Update frontend button in app.js**

### Testing

```
2+2 → 4
10-3 → 7
5*6 → 30
20/4 → 5
2^3 → 8
10%3 → 1
2+3*4 → 14 (precedence test)
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'Add feature'`
4. Push: `git push origin feature/my-feature`
5. Open Pull Request

## 📜 License

MIT License - see LICENSE file for details

## 👨‍💻 Author

**Om Tapdiya** (@Om-mac)
- GitHub: [Om-mac](https://github.com/Om-mac)
- Email: omtapdiya75@gmail.com

## 🙏 Acknowledgments

- Express.js documentation
- C++ Standard Library
- Modern CSS practices
- Open-source community

## 📞 Support

- Open an [Issue](https://github.com/Om-mac/Calculator/issues)
- Email: omtapdiya75@gmail.com
- Check [API Documentation](docs/API.md)

## 🔮 Future Enhancements

- [ ] Scientific functions (sin, cos, tan, log)
- [ ] Memory operations (M+, M-, MR)
- [ ] Multiple language support
- [ ] Mobile app (React Native)
- [ ] Advanced equation solver
- [ ] Graphing calculator
- [ ] Custom function definitions
- [ ] Export to PDF
- [ ] Calculation sharing
- [ ] Unit converter

---

**Last Updated**: November 30, 2025

**⭐ Star this project if you found it helpful!**
