const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../../../database.sqlite');
const db = new Database(dbPath, { verbose: console.log });

function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS prompt_fragments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      name TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS avatar_presets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      vrm_url TEXT NOT NULL,
      character_prompt_id INTEGER,
      voice_speaker_id INTEGER DEFAULT 1,
      voice_speed REAL DEFAULT 1.0,
      voice_pitch REAL DEFAULT 0.0,
      startup_anim_url TEXT,
      shutdown_anim_url TEXT,
      FOREIGN KEY(character_prompt_id) REFERENCES prompt_fragments(id)
    );

    CREATE TABLE IF NOT EXISTS task_presets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      task_prompt_id INTEGER,
      safety_prompt_id INTEGER,
      FOREIGN KEY(task_prompt_id) REFERENCES prompt_fragments(id),
      FOREIGN KEY(safety_prompt_id) REFERENCES prompt_fragments(id)
    );

    CREATE TABLE IF NOT EXISTS system_settings (
      id INTEGER PRIMARY KEY,
      base_prompt_id INTEGER,
      FOREIGN KEY(base_prompt_id) REFERENCES prompt_fragments(id)
    );

    CREATE TABLE IF NOT EXISTS credits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL,
      is_active INTEGER DEFAULT 0
    );
  `);
}

function seedDB() {
  const rowCount = db.prepare('SELECT count(*) as count FROM prompt_fragments').get();
  if (rowCount.count > 0) {
    try {
      db.prepare('ALTER TABLE credits ADD COLUMN is_active INTEGER DEFAULT 0').run();
    } catch (e) {}
    return; 
  }

  console.log('Seeding initial data...');
  
  const insertFragment = db.prepare('INSERT INTO prompt_fragments (category, name, content) VALUES (?, ?, ?)');

  const baseContent = fs.readFileSync(path.join(__dirname, '../prompts/base.txt'), 'utf8');
  const baseResult = insertFragment.run('base', 'Default Base', baseContent);

  const safety1Content = fs.readFileSync(path.join(__dirname, '../prompts/safety/level1.txt'), 'utf8');
  const safety1Result = insertFragment.run('safety', 'Level 1', safety1Content);

  const gentleContent = fs.readFileSync(path.join(__dirname, '../prompts/characters/gentle.txt'), 'utf8');
  const gentleResult = insertFragment.run('character', 'Gentle Teacher', gentleContent);
  const strictContent = fs.readFileSync(path.join(__dirname, '../prompts/characters/strict.txt'), 'utf8');
  const strictResult = insertFragment.run('character', 'Strict Manager', strictContent);

  const riceContent = fs.readFileSync(path.join(__dirname, '../prompts/tasks/cook_rice_1cup.txt'), 'utf8');
  const riceResult = insertFragment.run('task_instruction', 'Cook Rice (1 Cup)', riceContent);
  const wiresContent = fs.readFileSync(path.join(__dirname, '../prompts/tasks/connect_wires.txt'), 'utf8');
  const wiresResult = insertFragment.run('task_instruction', 'Connect Wires', wiresContent);

  const insertAvatar = db.prepare('INSERT INTO avatar_presets (name, vrm_url, character_prompt_id, voice_speaker_id, startup_anim_url, shutdown_anim_url) VALUES (?, ?, ?, ?, ?, ?)');
  insertAvatar.run('優しい家庭教師 (めたん)', '/assets/models/avatar.vrm', gentleResult.lastInsertRowid, 2, '/assets/animations/VRMA_02(挨拶).vrma', '/assets/animations/quick_formal_bow.vrma');
  insertAvatar.run('厳格な安全管理者 (青山)', '/assets/models/avatar.vrm', strictResult.lastInsertRowid, 13, null, null);

  const insertTask = db.prepare('INSERT INTO task_presets (name, task_prompt_id, safety_prompt_id) VALUES (?, ?, ?)');
  insertTask.run('ご飯を炊く (1合)', riceResult.lastInsertRowid, safety1Result.lastInsertRowid);
  insertTask.run('電気配線の接続', wiresResult.lastInsertRowid, safety1Result.lastInsertRowid);

  const insertSystem = db.prepare('INSERT INTO system_settings (id, base_prompt_id) VALUES (1, ?)');
  insertSystem.run(baseResult.lastInsertRowid);

  const insertCredit = db.prepare('INSERT INTO credits (name, content, is_active) VALUES (?, ?, ?)');
  insertCredit.run('標準クレジット', 'VOICEVOX:四国めたん\nVOICEVOX:青山龍星\nVRM Model: Sample Avatar\nPowered by Gemini/OpenAI', 1);

  console.log('Seeding complete.');
}

module.exports = { db, initDB, seedDB };