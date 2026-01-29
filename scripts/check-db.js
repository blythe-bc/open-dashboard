require('dotenv').config({ path: '.env.local' });
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.SQLITE_DB_PATH || path.join(__dirname, '../dev.db');
const db = new sqlite3.Database(dbPath);

async function check() {
    const query = (sql) => new Promise((resolve, reject) => {
        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });

    try {
        console.log("--- SemanticDataset ---");
        console.log(await query("SELECT * FROM SemanticDataset"));

        console.log("\n--- SemanticMetric ---");
        console.log(await query("SELECT * FROM SemanticMetric"));

        console.log("\n--- SemanticMetricEndpoint ---");
        console.log(await query("SELECT * FROM SemanticMetricEndpoint"));
    } catch (e) {
        console.error(e);
    } finally {
        db.close();
    }
}

check();