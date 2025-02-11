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
    // Génération des tables
    db.run(`CREATE TABLE IF NOT EXISTS characters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        channel_id TEXT NOT NULL,
        
        -- Personnage
        name TEXT,
        clan TEXT,
        generation TEXT,
        chronicle TEXT,
        predator TEXT,
        sire TEXT,
        desire TEXT,
        ambition TEXT,
        
        -- Stats
        max_health INTEGER,
        current_aggravated_health_damage INTEGER,
        current_bashing_health_damage INTEGER,
        max_willpower INTEGER,
        current_aggravated_willpower_damage INTEGER,
        current_bashing_willpower_damage INTEGER,
        humanity INTEGER,
        hunger INTEGER,
        blood_potency INTEGER,
        
        -- attributes
        strengh INTEGER,
        dexterity INTEGER,
        stamina INTEGER,
        charisma INTEGER,
        manipulation INTEGER,
        composure INTEGER,
        intelligence INTEGER,
        wits INTEGER,
        resolve INTEGER,
        
        -- Skills
        athletics INTEGER,
        brawl INTEGER,
        craft INTEGER,
        drive INTEGER,
        firearms INTEGER,
        larceny INTEGER,
        melee INTEGER,
        stealth INTEGER,
        survival INTEGER,
        
        animal_ken INTEGER,
        etiquette INTEGER,
        insight INTEGER,
        intimidation INTEGER,
        leadership INTEGER,
        performance INTEGER,
        persuasion INTEGER,
        streetwise INTEGER,
        subterfuge INTEGER,
        
        academics INTEGER,
        awareness INTEGER,
        finance INTEGER,
        investigation INTEGER,
        medicine INTEGER,
        occult INTEGER,
        politics INTEGER,
        science INTEGER,
        technology INTEGER,
        
        -- Background
        age INT,
        appearance TEXT,
        history TEXT,
        notes TEXT,
        haven TEXT,
        haven_rating INT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS disciplines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT
    );`);

    db.run(`CREATE TABLE IF NOT EXISTS abilities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        dots INT,
        description TEXT,
        id_discipline INT,
        FOREIGN KEY (id_discipline) REFERENCES disciplines(id)
    );`);

    db.run(`CREATE TABLE IF NOT EXISTS character_abilities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_character INT,
        id_ability INT,
        FOREIGN KEY (id_character) REFERENCES characters(id),
        FOREIGN KEY (id_ability) REFERENCES abilities(id)
    );`);

    db.run(`CREATE TABLE IF NOT EXISTS merits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        description TEXT
    );`);

    db.run(`CREATE TABLE IF NOT EXISTS character_merits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_character INT,
        id_merit INT,
        FOREIGN KEY (id_character) REFERENCES characters(id),
        FOREIGN KEY (id_merit) REFERENCES merits(id)
    );`);

    db.run(`CREATE TABLE IF NOT EXISTS flaws (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        description TEXT
    );`);

    db.run(`CREATE TABLE IF NOT EXISTS character_merits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_character INT,
        id_flaw INT,
        FOREIGN KEY (id_character) REFERENCES characters(id),
        FOREIGN KEY (id_flaw) REFERENCES flaws(id)
    );`);

    db.run(`CREATE TABLE IF NOT EXISTS backgrounds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        description TEXT
    );`);

    db.run(`CREATE TABLE IF NOT EXISTS character_backgrounds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_character INT,
        id_background INT,
        FOREIGN KEY (id_character) REFERENCES characters(id),
        FOREIGN KEY (id_background) REFERENCES backgrounds(id)
    );`);

});

module.exports = db;
