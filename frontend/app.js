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
        console.log('[DEBUG] History content:', JSON.stringify(this.history));
        
        if (this.history.length === 0) {
            this.updateStatus('No calculations to export', 'error');
            return;
        }

        const currentDate = new Date().toLocaleString();
        const totalCalculations = this.history.length;
        console.log('[DEBUG] Total calculations:', totalCalculations);
        
        // Build table rows HTML
        let tableRows = '';
        const historyReversed = [...this.history].reverse();
        console.log('[DEBUG] History reversed:', JSON.stringify(historyReversed));
        
        historyReversed.forEach((item, index) => {
            console.log(`[DEBUG] Processing row ${index}:`, item);
            const bgColor = index % 2 === 0 ? '#f9f9f9' : 'white';
            const rowHTML = `<tr style="background-color: ${bgColor};">
                <td style="border: 1px solid #ddd; padding: 10px; text-align: center; width: 10%;">${index + 1}</td>
                <td style="border: 1px solid #ddd; padding: 10px; width: 40%;">${this.escapeHtml(item.expression)}</td>
                <td style="border: 1px solid #ddd; padding: 10px; color: #667eea; font-weight: bold; text-align: right; width: 30%;">${item.result}</td>
                <td style="border: 1px solid #ddd; padding: 10px; font-size: 12px; width: 20%;">${item.timestamp}</td>
            </tr>`;
            tableRows += rowHTML;
            console.log(`[DEBUG] Row ${index} HTML added, cumulative length: ${tableRows.length}`);
        });
        
        console.log('[DEBUG] Total table rows generated:', tableRows.length, 'characters');
        console.log('[DEBUG] Table rows preview:', tableRows.substring(0, 200));

        // Create the full HTML document as a string
        const pdfHTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Calculator History Report</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 20px; color: #333;">

<div style="text-align: center; border-bottom: 3px solid #667eea; padding-bottom: 20px; margin-bottom: 30px;">
    <h1 style="color: #667eea; margin: 0;">📊 Calculator History Report</h1>
    <p style="color: #666; margin: 10px 0 0 0;">Generated on ${currentDate}</p>
</div>

<div style="margin-bottom: 30px;">
    <h2 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Summary</h2>
    <div style="background: #f0f4ff; padding: 15px; border-radius: 5px;">
        <p><strong>Total Calculations:</strong> ${totalCalculations}</p>
        <p><strong>Report Generated:</strong> ${currentDate}</p>
    </div>
</div>

<div>
    <h2 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Calculation Details</h2>
    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <thead>
            <tr style="background-color: #667eea; color: white;">
                <th style="border: 1px solid #ddd; padding: 10px; text-align: center; width: 10%;">No.</th>
                <th style="border: 1px solid #ddd; padding: 10px; text-align: left; width: 40%;">Expression</th>
                <th style="border: 1px solid #ddd; padding: 10px; text-align: right; width: 30%;">Result</th>
                <th style="border: 1px solid #ddd; padding: 10px; text-align: left; width: 20%;">Time</th>
            </tr>
        </thead>
        <tbody>
            ${tableRows}
        </tbody>
    </table>
</div>

<div style="margin-top: 40px; text-align: center; border-top: 1px solid #ddd; padding-top: 20px; font-size: 12px; color: #999;">
    <p>This report was generated by <strong>Calculator v1.0.0</strong></p>
    <p><a href="https://github.com/Om-mac/Calculator" style="color: #667eea; text-decoration: none;">View on GitHub</a></p>
</div>

</body>
</html>`;

        console.log('[DEBUG] PDF HTML generated');
        console.log('[DEBUG] PDF HTML length:', pdfHTML.length);
        console.log('[DEBUG] Contains tbody:', pdfHTML.includes('<tbody>'));
        console.log('[DEBUG] Number of data rows in HTML:', (pdfHTML.match(/<tr style="background-color:/g) || []).length);
        console.log('[DEBUG] PDF HTML preview:', pdfHTML.substring(0, 500));

        // Use html2pdf to convert to PDF
        const opt = {
            margin: 10,
            filename: `Calculator_History_${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
        };

        console.log('[DEBUG] html2pdf options:', opt);
        console.log('[DEBUG] About to call html2pdf().set().from().save()');

        try {
            html2pdf().set(opt).from(pdfHTML, 'string').save();
            console.log('[DEBUG] PDF export completed successfully');
            this.updateStatus('✅ PDF exported successfully!', 'success');
        } catch (error) {
            console.error('[ERROR] PDF export error:', error);
            console.error('[ERROR] Stack trace:', error.stack);
            this.updateStatus('Error exporting PDF', 'error');
        }
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
