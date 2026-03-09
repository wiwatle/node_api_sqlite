const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = process.env.PORT || 8080;

const path = require('path');
const isAzure = process.env.WEBSITES_ENABLE_APP_SERVICE_STORAGE === 'true';
// On Azure, use the persistent /home directory
// Locally, use a local 'data' folder
const dbPath = isAzure 
  ? '/home/site/wwwroot/data/database.sqlite' 
  : path.join(__dirname, 'data', 'database.sqlite');

//const db = new sqlite3.Database(dbPath);


// Middleware to parse JSON bodies
app.use(express.json());

// Connect to SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error(err.message);
    console.log('Connected to the SQLite database.');
});
db.run('PRAGMA journal_mode = WAL;');
// Create a sample table
db.run(`CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstname TEXT NOT NULL,
    lastname TEXT NOT NULL,
    age integer NOT NULL,
    description TEXT
)`);

// --- API Routes ---

// GET: Fetch all items
app.get('/students', (req, res) => {
    db.all("SELECT * FROM students", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST: Create a new item
app.post('/students', (req, res) => {
    const { firstname,lastname,age, description } = req.body;
    db.run("INSERT INTO students (firstname,lastname,age, description) VALUES (?,?,?, ?)", [firstname,lastname,age, description], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, firstname,lastname,age, description });
    });
});

// DELETE: Remove an item
app.delete('/students/:id', (req, res) => {
    db.run("DELETE FROM students WHERE id = ?", req.params.id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
});


// PATCH: update an item
app.patch('/students/', (req, res) => {
    const { id,firstname,lastname,age, description } = req.body;
    db.run("UPDATE students set firstname=?,lastname=?,age=?,description=? WHERE id = ?", [
        firstname
        ,lastname
        ,age
        ,description
        ,id
    ], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ updated: this.changes });
    });
});


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});