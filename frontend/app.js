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
            if (typeof jsPDF === 'undefined' && typeof window.jsPDF === 'undefined') {
                console.log('[DEBUG] jsPDF not available, trying html2pdf');
                this.exportWithHtml2pdf();
                return;
            }

            // Use jsPDF directly (it comes bundled with html2pdf)
            const JsPDF = window.jsPDF?.jsPDF || window.jsPDF;
            
            if (!JsPDF) {
                console.error('[ERROR] jsPDF not found');
                this.exportWithHtml2pdf();
                return;
            }

            console.log('[DEBUG] Using jsPDF for PDF generation');

            const doc = new JsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const historyReversed = [...this.history].reverse();
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 15;
            let yPosition = 20;

            // Title
            doc.setFontSize(18);
            doc.setTextColor(102, 126, 234);
            doc.text('Calculator History Report', margin, yPosition);
            yPosition += 8;

            // Date
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            const currentDate = new Date().toLocaleString();
            doc.text(`Generated on ${currentDate}`, margin, yPosition);
            yPosition += 12;

            // Summary box
            doc.setFillColor(240, 244, 255);
            doc.rect(margin, yPosition, pageWidth - 2 * margin, 20, 'F');
            doc.setFontSize(11);
            doc.setTextColor(102, 126, 234);
            doc.text('Summary', margin + 5, yPosition + 5);
            doc.setFontSize(10);
            doc.text(`Total Calculations: ${historyReversed.length}`, margin + 5, yPosition + 10);
            doc.text(`Report Generated: ${currentDate}`, margin + 5, yPosition + 15);
            yPosition += 25;

            // Table header
            doc.setFillColor(102, 126, 234);
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');

            const col1 = margin;
            const col2 = margin + 12;
            const col3 = margin + 70;
            const col4 = pageWidth - margin - 30;

            doc.rect(margin, yPosition, pageWidth - 2 * margin, 7, 'F');
            doc.text('No.', col1 + 2, yPosition + 5);
            doc.text('Expression', col2 + 2, yPosition + 5);
            doc.text('Result', col3 + 2, yPosition + 5);
            doc.text('Time', col4 + 2, yPosition + 5);
            yPosition += 8;

            // Table data
            doc.setFont(undefined, 'normal');
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(9);

            historyReversed.forEach((item, index) => {
                // Check if we need a new page
                if (yPosition > pageHeight - 20) {
                    doc.addPage();
                    yPosition = margin;

                    // Repeat header on new page
                    doc.setFillColor(102, 126, 234);
                    doc.setTextColor(255, 255, 255);
                    doc.setFont(undefined, 'bold');
                    doc.rect(margin, yPosition, pageWidth - 2 * margin, 7, 'F');
                    doc.text('No.', col1 + 2, yPosition + 5);
                    doc.text('Expression', col2 + 2, yPosition + 5);
                    doc.text('Result', col3 + 2, yPosition + 5);
                    doc.text('Time', col4 + 2, yPosition + 5);
                    yPosition += 8;

                    doc.setFont(undefined, 'normal');
                    doc.setTextColor(0, 0, 0);
                }

                // Alternating row colors
                if (index % 2 === 0) {
                    doc.setFillColor(249, 249, 249);
                    doc.rect(margin, yPosition, pageWidth - 2 * margin, 6, 'F');
                }

                // Row data
                const num = (index + 1).toString();
                const expr = this.escapeHtml(item.expression).substring(0, 25);
                const result = item.result.toString();
                const time = item.timestamp;

                doc.setTextColor(0, 0, 0);
                doc.text(num, col1 + 2, yPosition + 4);
                doc.text(expr, col2 + 2, yPosition + 4);

                doc.setTextColor(102, 126, 234);
                doc.setFont(undefined, 'bold');
                doc.text(result, col3 + 2, yPosition + 4);

                doc.setTextColor(100, 100, 100);
                doc.setFont(undefined, 'normal');
                doc.text(time, col4 + 2, yPosition + 4);

                yPosition += 7;
            });

            // Footer
            yPosition = pageHeight - 10;
            doc.setFontSize(9);
            doc.setTextColor(150, 150, 150);
            doc.text('Calculator v1.0.0 | github.com/Om-mac/Calculator', margin, yPosition);

            // Save
            const filename = `Calculator_History_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(filename);
            
            console.log('[DEBUG] PDF saved successfully:', filename);
            this.updateStatus(`✅ PDF exported: ${filename}`, 'success');

        } catch (error) {
            console.error('[ERROR] PDF export failed:', error);
            this.exportWithHtml2pdf();
        }
    }

    exportWithHtml2pdf() {
        console.log('[DEBUG] Using html2pdf fallback method');
        
        try {
            if (typeof html2pdf === 'undefined') {
                throw new Error('html2pdf library not loaded');
            }

            const historyReversed = [...this.history].reverse();
            const currentDate = new Date().toLocaleString();
            const totalCalculations = this.history.length;

            // Build simple HTML
            let rows = '';
            historyReversed.forEach((item, idx) => {
                rows += `<tr>
                    <td style="border:1px solid #ccc;padding:8px;text-align:center;">${idx + 1}</td>
                    <td style="border:1px solid #ccc;padding:8px;">${this.escapeHtml(item.expression)}</td>
                    <td style="border:1px solid #ccc;padding:8px;text-align:right;color:#667eea;font-weight:bold;">${item.result}</td>
                    <td style="border:1px solid #ccc;padding:8px;">${item.timestamp}</td>
                </tr>`;
            });

            const html = `
                <div style="font-family:Arial;color:#333;padding:20px;">
                    <h1 style="color:#667eea;margin-bottom:5px;">Calculator History Report</h1>
                    <p style="color:#999;margin-bottom:20px;">Generated on ${currentDate}</p>
                    
                    <div style="background:#f0f4ff;border:1px solid #d0deff;padding:15px;margin-bottom:20px;border-radius:4px;">
                        <h3 style="color:#667eea;margin-top:0;">Summary</h3>
                        <p>Total Calculations: <strong>${totalCalculations}</strong></p>
                        <p>Report Generated: <strong>${currentDate}</strong></p>
                    </div>

                    <h3 style="color:#333;margin-bottom:10px;">Calculation Details</h3>
                    <table style="width:100%;border-collapse:collapse;">
                        <thead>
                            <tr style="background:#667eea;color:white;">
                                <th style="border:1px solid #667eea;padding:10px;text-align:center;">No.</th>
                                <th style="border:1px solid #667eea;padding:10px;text-align:left;">Expression</th>
                                <th style="border:1px solid #667eea;padding:10px;text-align:right;">Result</th>
                                <th style="border:1px solid #667eea;padding:10px;">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows}
                        </tbody>
                    </table>

                    <div style="margin-top:30px;text-align:center;border-top:1px solid #ccc;padding-top:15px;font-size:10px;color:#999;">
                        <p>Calculator v1.0.0</p>
                        <p>https://github.com/Om-mac/Calculator</p>
                    </div>
                </div>
            `;

            const opt = {
                margin: 10,
                filename: `Calculator_History_${new Date().toISOString().split('T')[0]}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 1.5, useCORS: true, allowTaint: true },
                jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
            };

            html2pdf().set(opt).from(html).save().then(() => {
                console.log('[DEBUG] html2pdf export completed');
                this.updateStatus('✅ PDF exported successfully!', 'success');
            }).catch(err => {
                console.error('[ERROR] html2pdf failed:', err);
                this.updateStatus('PDF export failed', 'error');
            });

        } catch (error) {
            console.error('[ERROR] html2pdf fallback failed:', error);
            this.updateStatus('Error: ' + error.message, 'error');
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
