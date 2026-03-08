const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3000;


app.get('/', (req, res) => {
    return res.json({ msg: 'hello deploy node js ' });
});