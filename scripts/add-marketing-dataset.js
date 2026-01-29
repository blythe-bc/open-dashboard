require('dotenv').config({ path: '.env.local' });
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const path = require('path');

const dbPath = process.env.SQLITE_DB_PATH || path.join(__dirname, '../dev.db');
const db = new sqlite3.Database(dbPath);

async function seed() {
    const dsId = 'ds_marketing';
    const mId = 'm_costs';
    const epId = 'ep_marketing_costs';
    
    const uuid = () => crypto.randomUUID();

    db.serialize(() => {
        // 1. Semantic Dataset
        db.run(`INSERT OR IGNORE INTO SemanticDataset (id, name, allowedParams) VALUES (?, ?, ?)`,
            [dsId, 'Marketing', 'dateFrom,dateTo,campaign']);

        // 2. Semantic Metric
        db.run(`INSERT OR IGNORE INTO SemanticMetric (id, name, datasetId) VALUES (?, ?, ?)`,
            [mId, 'Campaign Costs', dsId]);

        // 3. Metric Endpoint
        db.run(`INSERT OR IGNORE INTO SemanticMetricEndpoint (id, metricId, name, timeoutMs, maxRows, maxItems) VALUES (?, ?, ?, ?, ?, ?)`,
            [epId, mId, 'sp_marketing_costs', 30000, 50000, 5000]);

        console.log('Marketing dataset inserted successfully.');
    });
}

seed().then(() => db.close());
