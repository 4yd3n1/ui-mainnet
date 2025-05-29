const express = require('express');
const randomWordService = require('./randomWordService');

const app = express();
// ... your existing server setup ...

// Start random word service when server starts
app.listen(process.env.PORT || 3000, () => {
    console.log('Server started');
    // Start the random word service
    randomWordService.start();
});

// Add endpoint to check service status
app.get('/api/random-word-service/status', (req, res) => {
    res.json({
        running: randomWordService.isRunning()
    });
});

// Optional: Add endpoint to manually start/stop service
app.post('/api/random-word-service/:action', (req, res) => {
    const { action } = req.params;
    if (action === 'start') {
        randomWordService.start();
        res.json({ message: 'Service started' });
    } else if (action === 'stop') {
        randomWordService.stop();
        res.json({ message: 'Service stopped' });
    } else {
        res.status(400).json({ error: 'Invalid action' });
    }
}); 