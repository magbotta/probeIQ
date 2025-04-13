// server.js - Node.js backend to receive network probe data

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Log file to store incoming probe data (for ELK later)
const logFilePath = path.join(__dirname, 'probe_logs.jsonl');

app.post('/probe', (req, res) => {
  const data = req.body;

  if (!data.uuid || !data.timestamp) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const logEntry = JSON.stringify(data) + '\n';

  fs.appendFile(logFilePath, logEntry, (err) => {
    if (err) {
      console.error('Error saving log:', err);
      return res.status(500).json({ error: 'Failed to save log' });
    }
    res.status(200).json({ message: 'Probe data received' });
  });
});

app.get('/', (req, res) => {
  res.send('📡 Network Probe API is running');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
