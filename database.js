const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'characters.db');

// Crée le répertoire s'il n'existe pas
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS characters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        channel_id TEXT NOT NULL,
        identity JSON,
        skills JSON,
        history JSON,
        disciplines JSON,
        hunger INTEGER DEFAULT 0,
        max_damage INTEGER DEFAULT 0,
        aggravated_damage INTEGER DEFAULT 0,
        superficial_damage INTEGER DEFAULT 0,
        max_willpower INTEGER DEFAULT 0,
        aggravated_willpower INTEGER DEFAULT 0,
        superficial_willpower INTEGER DEFAULT 0,
        stains INTEGER DEFAULT 0,
        xp INTEGER DEFAULT 0
    );`);

    db.run(`CREATE TABLE IF NOT EXISTS roll_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        channel_id TEXT NOT NULL,
        label TEXT,
        rolls TEXT,
        hunger INTEGER DEFAULT 0
    );`);

    db.run(`CREATE TABLE IF NOT EXISTS archives (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        date DATE,
        author TEXT,
        keywords JSON,
        article TEXT
    );`);

    db.run(`CREATE TABLE IF NOT EXISTS game_in_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        current_date_in_game DATE NOT NULL,
        news_channel TEXT NOT NULL
    );`);

});

module.exports = db;
