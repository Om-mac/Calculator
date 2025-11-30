const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, 'frontend')));

// Keep calculator process alive
let calculatorProcess = null;

function startCalculator() {
    const calcPath = path.join(__dirname, 'backend/build/calculator');
    
    return new Promise((resolve) => {
        calculatorProcess = spawn(calcPath, [], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        calculatorProcess.on('error', (err) => {
            console.error('Failed to start calculator:', err);
            resolve(false);
        });

        // Give it a moment to start
        setTimeout(() => resolve(true), 500);
    });
}

function evaluateExpression(expression) {
    return new Promise((resolve, reject) => {
        if (!calculatorProcess) {
            reject(new Error('Calculator process not running'));
            return;
        }

        let output = '';
        let errorOutput = '';

        const dataHandler = (data) => {
            output += data.toString();
        };

        const errorHandler = (data) => {
            errorOutput += data.toString();
        };

        calculatorProcess.stdout.on('data', dataHandler);
        calculatorProcess.stderr.on('data', errorHandler);

        // Send expression
        calculatorProcess.stdin.write(expression + '\n', (err) => {
            if (err) {
                calculatorProcess.stdout.removeListener('data', dataHandler);
                calculatorProcess.stderr.removeListener('data', errorHandler);
                reject(err);
                return;
            }

            // Wait for response
            setTimeout(() => {
                calculatorProcess.stdout.removeListener('data', dataHandler);
                calculatorProcess.stderr.removeListener('data', errorHandler);

                if (errorOutput) {
                    reject(new Error(errorOutput.trim()));
                } else if (output) {
                    const lines = output.trim().split('\n');
                    const lastLine = lines[lines.length - 1];
                    
                    // Extract result from "= 8" format
                    const match = lastLine.match(/=\s*([\d\-+.eE]+)/);
                    if (match) {
                        resolve(parseFloat(match[1]));
                    } else {
                        reject(new Error('Could not parse result'));
                    }
                } else {
                    reject(new Error('No response from calculator'));
                }
            }, 200);
        });
    });
}

// API endpoint
app.post('/calculate', async (req, res) => {
    const { expression } = req.body;

    if (!expression || typeof expression !== 'string') {
        return res.status(400).json({ error: 'Invalid expression' });
    }

    try {
        const result = await evaluateExpression(expression);
        res.json({ 
            expression: expression,
            result: result 
        });
    } catch (error) {
        res.status(400).json({ 
            error: error.message 
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', calculator: calculatorProcess ? 'running' : 'stopped' });
});

// Start server
async function start() {
    const calculatorReady = await startCalculator();
    
    if (!calculatorReady) {
        console.warn('⚠️  Warning: Calculator backend not available. Frontend will use local evaluation.');
    } else {
        console.log('✓ Calculator backend connected');
    }

    app.listen(PORT, () => {
        console.log(`\n📱 Server running at http://localhost:${PORT}`);
        console.log(`\n✓ Frontend: http://localhost:${PORT}`);
        console.log(`✓ API: http://localhost:${PORT}/calculate`);
        console.log(`\nPress Ctrl+C to stop\n`);
    });
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\nShutting down...');
    if (calculatorProcess) {
        calculatorProcess.kill();
    }
    process.exit(0);
});

start().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
