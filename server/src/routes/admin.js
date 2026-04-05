const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('../db/init');

// --- Multer Configuration for File Uploads ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    let destPath = path.join(__dirname, '../../../client/public/assets/models');
    if (ext === '.vrma') {
      destPath = path.join(__dirname, '../../../client/public/assets/animations');
    }
    // Ensure directory exists
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }
    cb(null, destPath);
  },
  filename: function (req, file, cb) {
    // Keep original filename, potentially handling conflicts in a real app
    cb(null, file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.vrm' || ext === '.vrma') {
      cb(null, true);
    } else {
      cb(new Error('Only .vrm and .vrma files are allowed.'));
    }
  }
});

// --- Asset API ---

// Upload asset (.vrm or .vrma)
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }
    const ext = path.extname(req.file.originalname).toLowerCase();
    const folder = ext === '.vrma' ? 'animations' : 'models';
    const publicPath = `/assets/${folder}/${req.file.filename}`;
    
    res.json({ message: 'File uploaded successfully', path: publicPath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List assets
router.get('/assets', (req, res) => {
  try {
    const modelsPath = path.join(__dirname, '../../../client/public/assets/models');
    const animsPath = path.join(__dirname, '../../../client/public/assets/animations');
    
    const models = fs.existsSync(modelsPath) ? fs.readdirSync(modelsPath).filter(f => f.endsWith('.vrm')).map(f => `/assets/models/${f}`) : [];
    const animations = fs.existsSync(animsPath) ? fs.readdirSync(animsPath).filter(f => f.endsWith('.vrma')).map(f => `/assets/animations/${f}`) : [];
    
    res.json({ models, animations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- CRUD API for DB ---

// Helper for basic CRUD operations
const createCrudHandler = (tableName) => {
  return {
    getAll: (req, res) => {
      try {
        const rows = db.prepare(`SELECT * FROM ${tableName}`).all();
        res.json(rows);
      } catch (err) { res.status(500).json({ error: err.message }); }
    },
    getById: (req, res) => {
      try {
        const row = db.prepare(`SELECT * FROM ${tableName} WHERE id = ?`).get(req.params.id);
        if (row) res.json(row);
        else res.status(404).json({ error: 'Not found' });
      } catch (err) { res.status(500).json({ error: err.message }); }
    },
    create: (req, res) => {
      try {
        const keys = Object.keys(req.body).join(', ');
        const placeholders = Object.keys(req.body).map(() => '?').join(', ');
        const values = Object.values(req.body);
        
        const info = db.prepare(`INSERT INTO ${tableName} (${keys}) VALUES (${placeholders})`).run(...values);
        res.json({ id: info.lastInsertRowid, ...req.body });
      } catch (err) { res.status(500).json({ error: err.message }); }
    },
    update: (req, res) => {
      try {
        const updates = Object.keys(req.body).map(k => `${k} = ?`).join(', ');
        const values = [...Object.values(req.body), req.params.id];
        
        db.prepare(`UPDATE ${tableName} SET ${updates} WHERE id = ?`).run(...values);
        res.json({ id: req.params.id, ...req.body });
      } catch (err) { res.status(500).json({ error: err.message }); }
    },
    delete: (req, res) => {
      try {
        db.prepare(`DELETE FROM ${tableName} WHERE id = ?`).run(req.params.id);
        res.json({ success: true });
      } catch (err) { res.status(500).json({ error: err.message }); }
    }
  };
};

// Route definitions
const fragments = createCrudHandler('prompt_fragments');
router.get('/fragments', fragments.getAll);
router.post('/fragments', fragments.create);
router.put('/fragments/:id', fragments.update);
router.delete('/fragments/:id', fragments.delete);

const avatars = createCrudHandler('avatar_presets');
router.get('/avatars', avatars.getAll);
router.post('/avatars', avatars.create);
router.put('/avatars/:id', avatars.update);
router.delete('/avatars/:id', avatars.delete);

const tasks = createCrudHandler('task_presets');
router.get('/tasks', tasks.getAll);
router.post('/tasks', tasks.create);
router.put('/tasks/:id', tasks.update);
router.delete('/tasks/:id', tasks.delete);

const credits = createCrudHandler('credits');
router.get('/credits', credits.getAll);
router.post('/credits', credits.create);
router.put('/credits/:id', credits.update);
router.delete('/credits/:id', credits.delete);

// --- System Settings API ---
router.get('/settings', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM system_settings WHERE id = 1').get();
    res.json(row || {});
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/settings', (req, res) => {
  try {
    const { base_prompt_id } = req.body;
    db.prepare('UPDATE system_settings SET base_prompt_id = ? WHERE id = 1')
      .run(base_prompt_id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;