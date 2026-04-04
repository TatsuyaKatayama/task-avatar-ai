require('dotenv').config();
const express = require('express');
const cors = require('cors');
const llmRoutes = require('./routes/llm');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); // クライアント(Vite)からのアクセスを許可
app.use(express.json()); // JSON ボディパーサー

// Routes
app.use('/api', llmRoutes);

// 健康診断用
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
