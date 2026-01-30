require('dotenv').config({ path: '.env.local' });
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.SQLITE_DB_PATH || path.join(__dirname, '../dev.db');
const db = new sqlite3.Database(dbPath);

db.all("SELECT * FROM Dashboard", (err, rows) => {
    console.log("--- Dashboards ---");
    console.log(rows);
});

db.all("SELECT * FROM DashboardVersion WHERE dashboardId = 'dash_sample' AND version = 1", (err, rows) => {
    console.log("\n--- Dashboard Version 1 ---");
    if (rows && rows[0]) {
        console.log("Status:", rows[0].status);
        console.log("Widgets:", JSON.parse(rows[0].widgets));
        console.log("Layout:", JSON.parse(rows[0].layout));
    }
});

db.all("SELECT * FROM SemanticMetricEndpoint", (err, rows) => {
    console.log("\n--- SemanticMetricEndpoints ---");
    console.log(rows);
    db.close();
});

