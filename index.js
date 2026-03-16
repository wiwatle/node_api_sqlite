const express = require('express');

//const sqlite3 = require('sqlite3').verbose();
//const { DatabaseSync } = require('node:sqlite');
const Database = require('better-sqlite3');
//const db = new DatabaseSync('database.db');
const db = new Database('database.db');
const app = express();
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`API is live on port ${PORT}`);
});

//const path = require('path');
//const isAzure = process.env.WEBSITES_ENABLE_APP_SERVICE_STORAGE === 'true';
// On Azure, use the persistent /home directory
// Locally, use a local 'data' folder
//const dbPath = isAzure 
//  ? '/home/site/wwwroot/data/database.sqlite' 
//  : path.join(__dirname, 'data', 'database.sqlite');

//const db = new sqlite3.Database(dbPath);


// Middleware to parse JSON bodies
app.use(express.json());

// Connect to SQLite database
//const db = new sqlite3.Database('./database.sqlite', (err) => {
    //if (err) console.error(err.message);
    //console.log('Connected to the SQLite database.');
//});
//db.run('PRAGMA journal_mode = WAL;');

// Create a table for 'items'
const createTable = `
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstname TEXT NOT NULL,
    lastname TEXT NOT NULL,
    age integer NOT NULL,
    description TEXT
);`;

db.exec(createTable);

module.exports = db;
// --- API Routes ---///////

// GET: Fetch all items
app.get('/students', (req, res) => {
    const stmt = db.prepare('SELECT * FROM students');
    const items = stmt.all();
    res.json(items);
});

// POST: Create a new item
app.post('/students', (req, res) => {
    const { firstname,lastname,age, description } = req.body;
    const stmt = db.prepare('INSERT INTO students (firstname, lastname,age,description) VALUES (?, ?,?,?)');
    const info = stmt.run(firstname,lastname,age, description);
    
    res.status(201).json({ id: info.lastInsertRowid, firstname,lastname,age, description });
});


// DELETE: Remove an item
app.delete('/students/:id', (req, res) => {
    const stmt = db.prepare('DELETE FROM students WHERE id = ?');
    const info = stmt.run(req.params.id);
    
    if (info.changes === 0) return res.status(404).json({ error: 'Item not found' });
    res.status(204).send();
});


// put: update an item
app.put('/students/:id', (req, res) => {
    const { firstname,lastname,age, description } = req.body;
    const stmt = db.prepare('UPDATE students SET firstname = ?,lastname = ?,age = ?, description = ? WHERE id = ?');
    const info = stmt.run(firstname,lastname,age, description, req.params.id);
    
    if (info.changes === 0) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Item updated successfully' });
});


