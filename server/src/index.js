require('dotenv').config();
const express = require('express');
const cors = require('cors');
const llmRoutes = require('./routes/llm');
const { initDB, seedDB } = require('./db/init');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Database
try {
  initDB();
  seedDB();
  console.log('Database initialized successfully.');
} catch (error) {
  console.error('Failed to initialize database:', error);
  process.exit(1);
}

// Middleware
app.use(cors()); // クライアント(Vite)からのアクセスを許可
app.use(express.json()); // JSON ボディパーサー

// Routes
app.use('/api', llmRoutes);
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// User API for Presets
const { db } = require('./db/init');
app.get('/api/presets', (req, res) => {
  try {
    const avatars = db.prepare('SELECT * FROM avatar_presets').all();
    const tasks = db.prepare('SELECT * FROM task_presets').all();
    res.json({ avatars, tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/credits', (req, res) => {
  try {
    const rows = db.prepare('SELECT name, content FROM credits WHERE is_active = 1').all();
    res.json({ credits: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 健康診断用
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
