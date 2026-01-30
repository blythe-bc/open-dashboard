require('dotenv').config({ path: '.env.local' });
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.SQLITE_DB_PATH || path.join(__dirname, '../dev.db');
const db = new sqlite3.Database(dbPath);

db.run("ALTER TABLE DashboardVersion ADD COLUMN settings TEXT DEFAULT '{}'", (err) => {
    if (err) {
        console.log("Column might already exist or error:", err.message);
    } else {
        console.log("Column 'settings' added successfully.");
    }
    db.close();
});
