# 🧮 Full-Stack Calculator

A modern, full-stack calculator application with a C++ backend engine, Node.js Express server, and responsive web frontend. Features real-time expression evaluation, calculation history, and keyboard support.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0-brightgreen.svg)
![C++](https://img.shields.io/badge/C%2B%2B-17-blue.svg)

---

## ✨ Features

- 🎯 **Real-time Expression Evaluation** - Type expressions like `2+3*5` and get instant results
- ⌨️ **Full Keyboard Support** - Use keyboard shortcuts for fast calculations
- 📊 **Calculation History** - View and reuse previous calculations (stored in localStorage)
- 📥 **PDF Export** - Export your calculation history as a professional PDF report
- 🌙 **Dark Mode** - Toggle between light and dark themes with system preference detection
- 🎨 **Modern UI** - Beautiful gradient design with smooth animations
- 🚀 **High Performance** - C++ backend for fast calculations
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 🔄 **Fallback Mode** - Works offline with JavaScript evaluation if backend is unavailable
- ⚙️ **Full Operator Precedence** - Proper mathematical expression parsing

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
make clean
make
cd ..
```

3. **Install Node.js Dependencies**
```bash
npm install
```

4. **Start the Server**
```bash
npm start
```

5. **Open in Browser**
Visit `http://localhost:3000` 🎉

---

## 💻 Usage

### Using the Calculator

**Mouse/Button Input:**
- Click number buttons to build your expression
- Click operators (+, -, *, /, %, ^)
- Press `=` to calculate
- Use `AC` to clear all
- Use `DEL` to delete last character

**Dark Mode:**
- Click the 🌙 (moon) icon in the top-right corner to toggle dark mode
- Your preference is automatically saved to localStorage
- On first visit, the calculator respects your system's dark mode preference

**Export History as PDF:**
- Click the **📥 Export PDF** button below the history
- A professional PDF report will be downloaded with:
  - All calculation history
  - Timestamps for each calculation
  - Professional formatting and styling
  - Summary statistics
- Filename format: `Calculator_History_YYYY-MM-DD.pdf`

**Keyboard Input:**
- Type numbers: `0-9`
- Type operators: `+ - * / % ^`
- **Enter** - Calculate
- **Backspace** - Delete last character
- **Escape** - Clear all
- **Type directly** in the input field

### Examples

```
2 + 3             = 5
10 * 5 - 2        = 48
100 / 4           = 25
2 ^ 8             = 256
(Complex expressions with proper operator precedence)
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

Send a mathematical expression to the backend.

**Request:**
```json
{
  "expression": "2+3*5"
}
```

**Response (Success):**
```json
{
  "expression": "2+3*5",
  "result": 17
}
```

**Response (Error):**
```json
{
  "error": "Division by zero"
}
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

- **View History** - Scroll through the history panel on the right
- **Click History Item** - Loads the expression and result back into the calculator
- **Clear History** - Click "Clear History" button
- **Persistence** - History is saved to browser's localStorage and persists across sessions

---

## 🔍 Features in Detail

### Expression Parser
The C++ backend uses a recursive descent parser that:
- Correctly handles operator precedence
- Supports parenthetical grouping
- Handles floating-point numbers
- Provides error handling for invalid expressions

### Fallback Mode
If the C++ backend is unavailable:
- Frontend automatically falls back to JavaScript evaluation
- Full functionality remains (except power operation uses `**`)
- Works completely offline
- No loss of features

### Error Handling
- Division by zero: Returns error message
- Invalid expressions: Clear error feedback
- Malformed input: Validation and user guidance

---

## 🐛 Troubleshooting

### Backend Not Starting
```bash
# Check if C++ binary exists
ls -la backend/build/calculator

# If not, rebuild:
cd backend
make clean
make
cd ..
```

### Port Already in Use
```bash
# Find process using the port
lsof -i :3000

# Kill the process (if needed)
kill -9 <PID>

# Or use a different port
PORT=3001 npm start
```

### npm Modules Missing
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Git Push Issues
```bash
# Configure git
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"

# Then push
git push -u origin main
```

---

## 📈 Performance

- **Frontend Load Time**: < 1s
- **Calculation Speed**: < 10ms (including network latency)
- **History Limit**: 50 calculations (localStorage)
- **UI Animations**: 60fps

---

## 🔐 Security

- Input validation on both frontend and backend
- Error messages don't expose system information
- CORS enabled for safe cross-origin requests
- No sensitive data stored locally

---

## 📝 Development

### Adding New Operations

1. **Add to C++ calculator.h:**
```cpp
double sqrt(double a);
```

2. **Implement in calculator.cpp:**
```cpp
double Calculator::sqrt(double a) {
    return std::sqrt(a);
}
```

3. **Add to parseTerm in calculator.cpp:**
```cpp
else if (op == '@') {  // @ for square root
    result = sqrt(right);
}
```

4. **Update frontend (app.js):**
Add button in HTML and handle in JavaScript

### Testing

Test expressions:
- `2+2` → 4
- `10-3` → 7
- `5*6` → 30
- `20/4` → 5
- `2^3` → 8
- `10%3` → 1
- `2+3*4` → 14 (tests precedence)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Author

**Om Tapdiya** (Om-mac)
- GitHub: [@Om-mac](https://github.com/Om-mac)
- Email: omtapdiya75@gmail.com

---

## 🙏 Acknowledgments

- Express.js documentation
- C++ Standard Library
- Modern CSS practices
- Open-source community

---

## 📞 Support

For issues, questions, or suggestions:
1. Open an [Issue](https://github.com/Om-mac/Calculator/issues)
2. Email: omtapdiya75@gmail.com
3. Check [API Documentation](docs/API.md)

---

## 🔮 Future Enhancements

- [ ] Scientific functions (sin, cos, tan, log, etc.)
- [ ] Variables and memory storage (M+, M-, MR)
- [ ] Multiple language support
- [ ] Mobile app (React Native)
- [ ] Advanced equation solver
- [ ] Graphing calculator
- [ ] Custom function definitions
- [ ] Export to CSV
- [ ] Calculation sharing (via URL)

---

**Last Updated**: November 30, 2025

**⭐ If you found this helpful, please give it a star on GitHub!**
