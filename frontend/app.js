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

        const currentDate = new Date().toLocaleString();
        const totalCalculations = this.history.length;
        
        console.log('[DEBUG] Creating PDF with jsPDF');

        // Use jsPDF directly to create the PDF programmatically
        const { jsPDF } = window;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        let yPosition = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 10;
        const contentWidth = pageWidth - (2 * margin);

        // Add title
        doc.setFontSize(24);
        doc.setTextColor(102, 126, 234); // #667eea
        doc.text('📊 Calculator History Report', margin, yPosition);
        yPosition += 10;

        // Add generation date
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on ${currentDate}`, margin, yPosition);
        yPosition += 15;

        // Add horizontal line
        doc.setDrawColor(102, 126, 234);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 8;

        // Summary section
        doc.setFontSize(14);
        doc.setTextColor(51, 51, 51);
        doc.text('Summary', margin, yPosition);
        yPosition += 8;

        // Summary box background
        doc.setFillColor(240, 244, 255);
        doc.rect(margin, yPosition - 5, contentWidth, 25, 'F');

        doc.setFontSize(11);
        doc.setTextColor(102, 126, 234);
        doc.text(`Total Calculations: ${totalCalculations}`, margin + 5, yPosition + 3);
        doc.text(`Report Generated: ${currentDate}`, margin + 5, yPosition + 10);
        yPosition += 30;

        // Table section
        doc.setFontSize(14);
        doc.setTextColor(51, 51, 51);
        doc.text('Calculation Details', margin, yPosition);
        yPosition += 8;

        // Table header
        doc.setFillColor(102, 126, 234);
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');

        const colWidths = [10, 80, 60, 40];
        const headers = ['No.', 'Expression', 'Result', 'Time'];
        let xPos = margin;

        // Draw header cells
        headers.forEach((header, index) => {
            doc.rect(xPos, yPosition, colWidths[index], 8, 'F');
            doc.text(header, xPos + 2, yPosition + 5);
            xPos += colWidths[index];
        });

        yPosition += 10;
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);

        // Add table rows
        const historyReversed = [...this.history].reverse();
        let rowNum = 1;

        historyReversed.forEach((item, index) => {
            // Check if we need a new page
            if (yPosition > pageHeight - 20) {
                doc.addPage();
                yPosition = 15;
            }

            // Alternate row colors
            if (index % 2 === 0) {
                doc.setFillColor(249, 249, 249);
                xPos = margin;
                doc.rect(xPos, yPosition - 3, contentWidth, 7, 'F');
            }

            doc.setFontSize(10);
            xPos = margin;

            // Row number
            doc.text(rowNum.toString(), xPos + 2, yPosition + 1);
            xPos += colWidths[0];

            // Expression
            const expressionText = this.escapeHtml(item.expression);
            doc.text(expressionText, xPos + 2, yPosition + 1);
            xPos += colWidths[1];

            // Result
            doc.setTextColor(102, 126, 234);
            doc.setFont(undefined, 'bold');
            doc.text(item.result.toString(), xPos + 2, yPosition + 1);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(0, 0, 0);
            xPos += colWidths[2];

            // Time
            doc.setFontSize(9);
            doc.text(item.timestamp, xPos + 2, yPosition + 1);
            doc.setFontSize(10);

            yPosition += 8;
            rowNum++;
        });

        // Add footer
        yPosition += 10;
        doc.setDrawColor(102, 126, 234);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;

        doc.setFontSize(10);
        doc.setTextColor(153, 153, 153);
        doc.text('Calculator v1.0.0 | https://github.com/Om-mac/Calculator', margin, yPosition);

        // Save the PDF
        doc.save(`Calculator_History_${new Date().toISOString().split('T')[0]}.pdf`);
        
        console.log('[DEBUG] PDF generated and saved successfully');
        this.updateStatus('✅ PDF exported successfully!', 'success');
    }

    escapeHtml(text) {
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
