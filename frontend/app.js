class Calculator {
    constructor() {
        this.expression = '';
        this.history = [];
        this.backendUrl = window.location.origin;
        this.darkMode = false;
        this.init();
    }

    init() {
        this.cacheElements();
        this.loadDarkModePreference();
        this.attachEventListeners();
        this.loadHistory();
        this.updateStatus('Ready');
    }

    cacheElements() {
        this.expressionInput = document.getElementById('expression');
        this.resultDisplay = document.getElementById('result');
        this.historyList = document.getElementById('history-list');
        this.clearHistoryBtn = document.getElementById('clear-history');
        this.exportPdfBtn = document.getElementById('export-pdf');
        this.status = document.getElementById('status');
        this.buttons = document.querySelectorAll('.btn');
        this.themeToggle = document.getElementById('theme-toggle');
        this.calculator = document.querySelector('.calculator');
        this.body = document.body;
    }

    attachEventListeners() {
        // Button clicks
        this.buttons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleButtonClick(e));
        });

        // Keyboard support
        this.expressionInput.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Clear history
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());

        // Export PDF
        this.exportPdfBtn.addEventListener('click', () => this.exportToPDF());

        // History item click
        this.historyList.addEventListener('click', (e) => this.handleHistoryClick(e));

        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleDarkMode());
    }

    toggleDarkMode() {
        this.darkMode = !this.darkMode;
        this.applyDarkMode();
        this.saveDarkModePreference();
    }

    applyDarkMode() {
        if (this.darkMode) {
            this.body.classList.add('dark-mode');
            this.calculator.classList.add('dark-mode');
            this.themeToggle.innerHTML = '<span class="theme-icon">☀️</span>';
        } else {
            this.body.classList.remove('dark-mode');
            this.calculator.classList.remove('dark-mode');
            this.themeToggle.innerHTML = '<span class="theme-icon">🌙</span>';
        }
    }

    saveDarkModePreference() {
        localStorage.setItem('darkMode', JSON.stringify(this.darkMode));
    }

    loadDarkModePreference() {
        const saved = localStorage.getItem('darkMode');
        if (saved !== null) {
            this.darkMode = JSON.parse(saved);
        } else {
            // Check system preference
            this.darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        this.applyDarkMode();
    }

    handleButtonClick(event) {
        const btn = event.target.closest('.btn');
        if (!btn) return;

        const value = btn.dataset.value;
        const action = btn.dataset.action;

        if (action === 'clear') {
            this.clearExpression();
        } else if (action === 'delete') {
            this.deleteLastChar();
        } else if (btn.classList.contains('btn-equals')) {
            this.calculate();
        } else if (value) {
            this.addToExpression(value);
        }
    }

    handleKeyboard(event) {
        const key = event.key;

        if (key === 'Enter') {
            event.preventDefault();
            this.calculate();
        } else if (key === 'Backspace') {
            event.preventDefault();
            this.deleteLastChar();
        } else if (key === 'Escape') {
            this.clearExpression();
        } else if (/[0-9+\-*/.%^]/.test(key)) {
            this.addToExpression(key);
        }
    }

    addToExpression(value) {
        this.expression += value;
        this.expressionInput.value = this.expression;
        this.updateStatus('Ready');
    }

    deleteLastChar() {
        this.expression = this.expression.slice(0, -1);
        this.expressionInput.value = this.expression;
        this.resultDisplay.value = '';
        this.updateStatus('Ready');
    }

    clearExpression() {
        this.expression = '';
        this.expressionInput.value = '';
        this.resultDisplay.value = '';
        this.updateStatus('Ready');
    }

    async calculate() {
        if (!this.expression.trim()) {
            this.updateStatus('Empty expression', 'error');
            return;
        }

        this.updateStatus('Calculating...', 'info');

        try {
            const result = await this.sendToBackend(this.expression);
            this.resultDisplay.value = result;
            this.addToHistory(this.expression, result);
            this.updateStatus('Success', 'success');
        } catch (error) {
            this.updateStatus(`Error: ${error.message}`, 'error');
            this.resultDisplay.value = 'Error';
        }
    }

    async sendToBackend(expression) {
        // Try to connect to backend server
        try {
            const response = await fetch(`${this.backendUrl}/calculate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ expression: expression })
            });

            if (!response.ok) {
                throw new Error('Backend error: ' + response.statusText);
            }

            const data = await response.json();
            return data.result;
        } catch (backendError) {
            // Fallback to local JavaScript evaluation if backend is unavailable
            console.warn('Backend unavailable, using local evaluation:', backendError);
            return this.evaluateLocally(expression);
        }
    }

    evaluateLocally(expression) {
        try {
            // Replace ^ with ** for JavaScript
            const jsExpression = expression.replace(/\^/g, '**');
            const result = Function(`'use strict'; return (${jsExpression})`)();
            
            if (!isFinite(result)) {
                throw new Error('Invalid calculation');
            }
            
            return parseFloat(result.toFixed(10));
        } catch (error) {
            throw new Error('Invalid expression');
        }
    }

    addToHistory(expression, result) {
        const historyItem = {
            expression: expression,
            result: result,
            timestamp: new Date().toLocaleTimeString()
        };

        this.history.unshift(historyItem);
        if (this.history.length > 50) {
            this.history.pop();
        }

        this.saveHistory();
        this.renderHistory();
    }

    handleHistoryClick(event) {
        if (event.target.tagName === 'LI') {
            const index = Array.from(this.historyList.children).indexOf(event.target);
            const item = this.history[index];
            this.expression = item.expression;
            this.expressionInput.value = this.expression;
            this.resultDisplay.value = item.result;
        }
    }

    renderHistory() {
        this.historyList.innerHTML = '';
        this.history.forEach((item, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${item.expression}</strong> = <strong>${item.result}</strong>
                <span style="font-size: 11px; opacity: 0.7; display: block;">${item.timestamp}</span>
            `;
            this.historyList.appendChild(li);
        });
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear the history?')) {
            this.history = [];
            this.saveHistory();
            this.renderHistory();
            this.updateStatus('History cleared', 'success');
        }
    }

    exportToPDF() {
        console.log('[DEBUG] exportToPDF called');
        console.log('[DEBUG] History length:', this.history.length);
        
        if (this.history.length === 0) {
            this.updateStatus('No calculations to export', 'error');
            return;
        }

        try {
            if (typeof html2pdf === 'undefined') {
                throw new Error('html2pdf library not loaded');
            }

            const currentDate = new Date().toLocaleString();
            const totalCalculations = this.history.length;
            const historyReversed = [...this.history].reverse();

            console.log('[DEBUG] Creating PDF with html2pdf');
            
            // Build simple, flat HTML that html2canvas can render reliably
            let tableRows = '';
            historyReversed.forEach((item, index) => {
                const bgColor = index % 2 === 0 ? '#f9f9f9' : '#ffffff';
                tableRows += `
                    <tr style="background-color: ${bgColor};">
                        <td style="border: 1px solid #ccc; padding: 6px; text-align: center; width: 8%; font-size: 10px;">${index + 1}</td>
                        <td style="border: 1px solid #ccc; padding: 6px; width: 55%; font-size: 10px; word-break: break-word;">${this.escapeHtml(item.expression)}</td>
                        <td style="border: 1px solid #ccc; padding: 6px; text-align: right; width: 18%; font-size: 10px; font-weight: bold; color: #667eea;">${item.result}</td>
                        <td style="border: 1px solid #ccc; padding: 6px; text-align: center; width: 19%; font-size: 9px;">${item.timestamp}</td>
                    </tr>
                `;
            });

            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Calculator History Report</title>
                </head>
                <body style="font-family: Arial, sans-serif; color: #333; margin: 0; padding: 20px; background: white;">
                    <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #667eea; padding-bottom: 20px;">
                        <h1 style="color: #667eea; margin: 0 0 5px 0; font-size: 28px;">📊 Calculator History Report</h1>
                        <p style="color: #888; margin: 0; font-size: 13px;">Generated on ${currentDate}</p>
                    </div>

                    <div style="background: #f0f4ff; border: 1px solid #d0deff; border-radius: 5px; padding: 15px; margin-bottom: 25px;">
                        <h3 style="color: #667eea; margin: 0 0 10px 0; font-size: 14px;">📈 Summary</h3>
                        <p style="margin: 5px 0; font-size: 12px;">
                            <strong style="color: #667eea;">Total Calculations:</strong> ${totalCalculations}
                        </p>
                        <p style="margin: 5px 0; font-size: 12px;">
                            <strong style="color: #667eea;">Report Generated:</strong> ${currentDate}
                        </p>
                    </div>

                    <div>
                        <h3 style="color: #333; margin: 0 0 10px 0; font-size: 14px; border-bottom: 2px solid #667eea; padding-bottom: 8px;">Calculation Details (All ${totalCalculations})</h3>
                        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                            <thead>
                                <tr style="background-color: #667eea; color: white;">
                                    <th style="border: 1px solid #667eea; padding: 8px; text-align: center; font-size: 11px; font-weight: bold; width: 8%;">No.</th>
                                    <th style="border: 1px solid #667eea; padding: 8px; text-align: left; font-size: 11px; font-weight: bold; width: 55%;">Expression</th>
                                    <th style="border: 1px solid #667eea; padding: 8px; text-align: right; font-size: 11px; font-weight: bold; width: 18%;">Result</th>
                                    <th style="border: 1px solid #667eea; padding: 8px; text-align: center; font-size: 11px; font-weight: bold; width: 19%;">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tableRows}
                            </tbody>
                        </table>
                    </div>

                    <div style="margin-top: 30px; text-align: center; border-top: 1px solid #ddd; padding-top: 15px; font-size: 10px; color: #999;">
                        <p style="margin: 3px 0;"><strong>Calculator v1.0.0</strong></p>
                        <p style="margin: 3px 0;">https://github.com/Om-mac/Calculator</p>
                    </div>
                </body>
                </html>
            `;

            const element = document.createElement('div');
            element.innerHTML = htmlContent;
            document.body.appendChild(element);

            const opt = {
                margin: 8,
                filename: `Calculator_History_${new Date().toISOString().split('T')[0]}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2,
                    logging: false,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    windowHeight: 1400
                },
                jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
            };

            console.log('[DEBUG] Starting html2pdf conversion');
            
            html2pdf()
                .set(opt)
                .from(element)
                .save()
                .then(() => {
                    console.log('[DEBUG] PDF export completed successfully');
                    document.body.removeChild(element);
                    this.updateStatus('✅ PDF exported successfully with all ' + totalCalculations + ' calculations!', 'success');
                })
                .catch((error) => {
                    console.error('[ERROR] PDF save failed:', error);
                    document.body.removeChild(element);
                    this.updateStatus('Error saving PDF: ' + error.message, 'error');
                });

        } catch (error) {
            console.error('[ERROR] PDF export failed:', error);
            this.updateStatus('Error exporting PDF: ' + error.message, 'error');
        }
    }    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    saveHistory() {
        localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
    }

    loadHistory() {
        const saved = localStorage.getItem('calculatorHistory');
        if (saved) {
            try {
                this.history = JSON.parse(saved);
                this.renderHistory();
            } catch (e) {
                console.warn('Failed to load history:', e);
            }
        }
    }

    updateStatus(message, type = 'info') {
        this.status.textContent = message;
        this.status.className = 'status';
        if (type) {
            this.status.classList.add(type);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
});
