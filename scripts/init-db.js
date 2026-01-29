require('dotenv').config({ path: '.env.local' });
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.SQLITE_DB_PATH || path.join(__dirname, '../dev.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + dbPath + ': ' + err.message);
        process.exit(1);
    }
    console.log('Connected to the development database at: ' + dbPath);
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS Workspace (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS WorkspacePolicy (
        id TEXT PRIMARY KEY,
        workspaceId TEXT UNIQUE,
        expertOverride INTEGER DEFAULT 0,
        allowPublishByBuilder INTEGER DEFAULT 1,
        maxChartPoints INTEGER DEFAULT 5000,
        maxGridClientRows INTEGER DEFAULT 5000,
        llmEnabled INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (workspaceId) REFERENCES Workspace (id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS WorkspaceRoleBinding (
        id TEXT PRIMARY KEY,
        workspaceId TEXT,
        adGroup TEXT NOT NULL,
        role TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (workspaceId) REFERENCES Workspace (id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS SemanticDataset (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        allowedParams TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS SemanticMetric (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        datasetId TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (datasetId) REFERENCES SemanticDataset (id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS SemanticHierarchy (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS SemanticDatasetHierarchy (
        id TEXT PRIMARY KEY,
        datasetId TEXT,
        hierarchyId TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (datasetId) REFERENCES SemanticDataset (id),
        FOREIGN KEY (hierarchyId) REFERENCES SemanticHierarchy (id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS SemanticMetricEndpoint (
        id TEXT PRIMARY KEY,
        metricId TEXT UNIQUE,
        name TEXT NOT NULL,
        timeoutMs INTEGER DEFAULT 30000,
        maxRows INTEGER DEFAULT 50000,
        maxItems INTEGER DEFAULT 5000,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (metricId) REFERENCES SemanticMetric (id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS SPParameterMap (
        id TEXT PRIMARY KEY,
        endpointId TEXT,
        paramName TEXT NOT NULL,
        spParam TEXT NOT NULL,
        transform TEXT,
        maxItems INTEGER,
        regex TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (endpointId) REFERENCES SemanticMetricEndpoint (id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS AuditLog (
        id TEXT PRIMARY KEY,
        event TEXT NOT NULL,
        user TEXT NOT NULL,
        details TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS Dashboard (
        id TEXT PRIMARY KEY,
        workspaceId TEXT,
        name TEXT NOT NULL,
        latestVersion INTEGER DEFAULT 1,
        publishedVersion INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (workspaceId) REFERENCES Workspace (id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS DashboardVersion (
        id TEXT PRIMARY KEY,
        dashboardId TEXT,
        version INTEGER NOT NULL,
        status TEXT NOT NULL, -- 'draft' | 'published'
        globalFilters TEXT, -- JSON
        layout TEXT, -- JSON react-grid-layout
        widgets TEXT, -- JSON map(id -> config)
        publishedAt TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (dashboardId) REFERENCES Dashboard (id),
        UNIQUE(dashboardId, version)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS SavedView (
        id TEXT PRIMARY KEY,
        dashboardId TEXT,
        name TEXT NOT NULL,
        userId TEXT NOT NULL,
        filters TEXT, -- JSON
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (dashboardId) REFERENCES Dashboard (id)
    )`);
});

db.close((err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Closed the database connection.');
});
