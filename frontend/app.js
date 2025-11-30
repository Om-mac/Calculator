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
        
        console.log('[DEBUG] Creating PDF with jsPDF autoTable');

        try {
            // Access jsPDF and autoTable from html2pdf bundle
            const jsPDF = window.jsPDF?.jsPDF || window.jsPDF;
            
            // Try to get autoTable plugin
            let hasAutoTable = false;
            if (window.jspdf && window.jspdf.jsPDF) {
                hasAutoTable = typeof window.jspdf.jsPDF.autoTable === 'function';
            }
            
            console.log('[DEBUG] jsPDF:', typeof jsPDF);
            console.log('[DEBUG] hasAutoTable:', hasAutoTable);

            // If jsPDF not available, fall back to html2pdf
            if (!jsPDF) {
                throw new Error('jsPDF not available, using HTML to PDF');
            }

            // Create PDF document
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const historyReversed = [...this.history].reverse();
            let yPosition = 20;

            // Add title
            doc.setFontSize(20);
            doc.setTextColor(102, 126, 234);
            doc.text('📊 Calculator History Report', 15, yPosition);
            yPosition += 8;

            // Add date
            doc.setFontSize(11);
            doc.setTextColor(100, 100, 100);
            doc.text(`Generated on ${currentDate}`, 15, yPosition);
            yPosition += 12;

            // Add summary
            doc.setFontSize(12);
            doc.setTextColor(51, 51, 51);
            doc.text('Summary', 15, yPosition);
            yPosition += 6;

            doc.setFontSize(10);
            doc.text(`Total Calculations: ${totalCalculations}`, 20, yPosition);
            yPosition += 8;

            // Prepare table data
            const tableData = historyReversed.map((item, index) => [
                (index + 1).toString(),
                this.escapeHtml(item.expression),
                item.result.toString(),
                item.timestamp
            ]);

            console.log('[DEBUG] Table data prepared with', tableData.length, 'rows');

            // Add table using autoTable if available, otherwise manual rendering
            if (hasAutoTable && typeof doc.autoTable === 'function') {
                console.log('[DEBUG] Using autoTable');
                doc.autoTable({
                    head: [['No.', 'Expression', 'Result', 'Time']],
                    body: tableData,
                    startY: yPosition + 5,
                    margin: { top: 10, right: 10, bottom: 10, left: 10 },
                    columnStyles: {
                        0: { cellWidth: 15, halign: 'center' },
                        1: { cellWidth: 90 },
                        2: { cellWidth: 40, halign: 'right', textColor: [102, 126, 234] },
                        3: { cellWidth: 35 }
                    },
                    headStyles: {
                        fillColor: [102, 126, 234],
                        textColor: [255, 255, 255],
                        fontStyle: 'bold'
                    },
                    bodyStyles: {
                        textColor: [0, 0, 0]
                    },
                    alternateRowStyles: {
                        fillColor: [249, 249, 249]
                    }
                });
            } else {
                console.log('[DEBUG] Using manual table rendering');
                // Manual table rendering
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                const margin = 10;
                const colWidths = [15, 90, 40, 35];
                const rowHeight = 6;

                // Draw table header
                doc.setFillColor(102, 126, 234);
                doc.setTextColor(255, 255, 255);
                doc.setFont(undefined, 'bold');
                doc.setFontSize(10);

                let xPos = margin;
                const headers = ['No.', 'Expression', 'Result', 'Time'];
                headers.forEach((header, i) => {
                    doc.rect(xPos, yPosition, colWidths[i], rowHeight, 'F');
                    doc.text(header, xPos + 2, yPosition + 4);
                    xPos += colWidths[i];
                });

                yPosition += rowHeight;
                doc.setFont(undefined, 'normal');
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(9);

                // Draw table rows
                tableData.forEach((row, rowIndex) => {
                    // Check if we need a new page
                    if (yPosition > pageHeight - 15) {
                        doc.addPage();
                        yPosition = 10;
                    }

                    // Alternate row colors
                    if (rowIndex % 2 === 0) {
                        doc.setFillColor(249, 249, 249);
                        doc.rect(margin, yPosition, pageWidth - 2 * margin, rowHeight, 'F');
                    }

                    xPos = margin;
                    row.forEach((cell, colIndex) => {
                        const text = cell.toString().substring(0, 30); // Truncate long text
                        if (colIndex === 2) {
                            doc.setTextColor(102, 126, 234);
                            doc.setFont(undefined, 'bold');
                        } else {
                            doc.setTextColor(0, 0, 0);
                            doc.setFont(undefined, 'normal');
                        }
                        doc.text(text, xPos + 2, yPosition + 4);
                        xPos += colWidths[colIndex];
                    });

                    yPosition += rowHeight;
                });

                // Add footer
                doc.setFontSize(9);
                doc.setTextColor(153, 153, 153);
                doc.text('Calculator v1.0.0 | https://github.com/Om-mac/Calculator', margin, pageHeight - 5);
            }

            // Save PDF
            doc.save(`Calculator_History_${new Date().toISOString().split('T')[0]}.pdf`);
            
            console.log('[DEBUG] PDF generated and saved successfully with', totalCalculations, 'calculations');
            this.updateStatus('✅ PDF exported successfully with all calculations!', 'success');

        } catch (error) {
            console.error('[ERROR] PDF export with jsPDF failed:', error);
            console.log('[DEBUG] Falling back to html2pdf approach');
            
            // Fallback to html2pdf if jsPDF fails
            this.exportToPDFWithHtml2pdf(currentDate, totalCalculations);
        }
    }

    exportToPDFWithHtml2pdf(currentDate, totalCalculations) {
        try {
            if (typeof html2pdf === 'undefined') {
                throw new Error('html2pdf library not loaded');
            }

            const historyReversed = [...this.history].reverse();
            
            let tableRows = '';
            historyReversed.forEach((item, index) => {
                const bgColor = index % 2 === 0 ? '#f9f9f9' : 'white';
                tableRows += `<tr style="background-color: ${bgColor};">
                    <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${index + 1}</td>
                    <td style="border: 1px solid #ddd; padding: 10px;">${this.escapeHtml(item.expression)}</td>
                    <td style="border: 1px solid #ddd; padding: 10px; color: #667eea; font-weight: bold; text-align: right;">${item.result}</td>
                    <td style="border: 1px solid #ddd; padding: 10px; font-size: 12px;">${item.timestamp}</td>
                </tr>`;
            });

            const element = document.createElement('div');
            element.innerHTML = `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <div style="text-align: center; border-bottom: 3px solid #667eea; padding-bottom: 20px; margin-bottom: 20px;">
                        <h1 style="color: #667eea; margin: 0; font-size: 24px;">📊 Calculator History Report</h1>
                        <p style="color: #666; margin: 10px 0 0 0;">Generated on ${currentDate}</p>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <h2 style="color: #333; font-size: 16px; border-bottom: 2px solid #667eea; padding-bottom: 8px; margin-bottom: 10px;">Summary</h2>
                        <div style="background: #f0f4ff; padding: 12px; border-radius: 4px; font-size: 13px;">
                            <p style="margin: 5px 0;"><strong style="color: #667eea;">Total Calculations:</strong> ${totalCalculations}</p>
                            <p style="margin: 5px 0;"><strong style="color: #667eea;">Report Generated:</strong> ${currentDate}</p>
                        </div>
                    </div>

                    <div>
                        <h2 style="color: #333; font-size: 16px; border-bottom: 2px solid #667eea; padding-bottom: 8px; margin-bottom: 10px;">Calculation Details (All ${totalCalculations} Calculations)</h2>
                        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                            <thead>
                                <tr style="background-color: #667eea; color: white;">
                                    <th style="border: 1px solid #ddd; padding: 8px; text-align: center; width: 8%;">No.</th>
                                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; width: 40%;">Expression</th>
                                    <th style="border: 1px solid #ddd; padding: 8px; text-align: right; width: 30%;">Result</th>
                                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; width: 22%;">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tableRows}
                            </tbody>
                        </table>
                    </div>

                    <div style="margin-top: 20px; text-align: center; border-top: 1px solid #ddd; padding-top: 10px; font-size: 11px; color: #999;">
                        <p style="margin: 3px 0;"><strong>Calculator v1.0.0</strong></p>
                        <p style="margin: 3px 0;">https://github.com/Om-mac/Calculator</p>
                    </div>
                </div>
            `;

            const opt = {
                margin: [10, 10, 10, 10],
                filename: `Calculator_History_${new Date().toISOString().split('T')[0]}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2, 
                    useCORS: true, 
                    logging: false, 
                    backgroundColor: '#ffffff',
                    allowTaint: true,
                    windowHeight: 2000
                },
                jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
            };

            console.log('[DEBUG] Using html2pdf fallback');
            
            html2pdf().set(opt).from(element).save().then(() => {
                console.log('[DEBUG] HTML2PDF export completed');
                this.updateStatus('✅ PDF exported successfully!', 'success');
            }).catch((error) => {
                console.error('[ERROR] html2pdf save failed:', error);
                this.updateStatus('Error saving PDF', 'error');
            });

        } catch (error) {
            console.error('[ERROR] Fallback PDF export failed:', error);
            this.updateStatus('Error exporting PDF', 'error');
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
