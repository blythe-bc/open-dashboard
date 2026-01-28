const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');

const dbPath = '/home/user/.gemini/tmp/80d3bec0670d13b276225fdd26d51791b5ca65bc1cd0766dfefa1202b469cf17/dev.db';
const db = new sqlite3.Database(dbPath);

async function seed() {
    const wsId = 'ws_default';
    const dsId = 'ds_sales';
    const mId = 'm_revenue';
    const epId = 'ep_sales_revenue';
    const hId = 'h_region';
    const dashId = 'dash_sample';

    const uuid = () => crypto.randomUUID();

    db.serialize(() => {
        // 1. Workspace
        db.run(`INSERT OR IGNORE INTO Workspace (id, name) VALUES (?, ?)`, [wsId, 'Default Workspace']);

        // 2. Workspace Policy
        db.run(`INSERT OR IGNORE INTO WorkspacePolicy (id, workspaceId, expertOverride, allowPublishByBuilder) VALUES (?, ?, ?, ?)`, 
            [uuid(), wsId, 0, 1]);

        // 3. Role Binding
        db.run(`INSERT OR IGNORE INTO WorkspaceRoleBinding (id, workspaceId, adGroup, role) VALUES (?, ?, ?, ?)`,
            [uuid(), wsId, 'EVERYONE', 'PlatformAdmin']);

        // 4. Semantic Dataset
        db.run(`INSERT OR IGNORE INTO SemanticDataset (id, name, allowedParams) VALUES (?, ?, ?)`,
            [dsId, 'Sales', 'dateFrom,dateTo,region']);

        // 5. Semantic Metric
        db.run(`INSERT OR IGNORE INTO SemanticMetric (id, name, datasetId) VALUES (?, ?, ?)`,
            [mId, 'Revenue', dsId]);

        // 6. Semantic Hierarchy
        db.run(`INSERT OR IGNORE INTO SemanticHierarchy (id, name) VALUES (?, ?)`,
            [hId, 'Region']);

        // 7. Dataset Hierarchy link
        db.run(`INSERT OR IGNORE INTO SemanticDatasetHierarchy (id, datasetId, hierarchyId) VALUES (?, ?, ?)`,
            [uuid(), dsId, hId]);

        // 8. Metric Endpoint
        db.run(`INSERT OR IGNORE INTO SemanticMetricEndpoint (id, metricId, name, timeoutMs, maxRows, maxItems) VALUES (?, ?, ?, ?, ?, ?)`,
            [epId, mId, 'sp_sales_revenue', 30000, 50000, 5000]);

        // 9. Parameter Map
        db.run(`INSERT OR IGNORE INTO SPParameterMap (id, endpointId, paramName, spParam) VALUES (?, ?, ?, ?)`,
            [uuid(), epId, 'region', '@region_code']);

        // 10. Dashboard
        db.run(`INSERT OR IGNORE INTO Dashboard (id, workspaceId, name, latestVersion, publishedVersion) VALUES (?, ?, ?, ?, ?)`,
            [dashId, wsId, 'Sales Performance', 1, 1]);

        // 11. Dashboard Version (Draft - v1 is published)
        const widgets = {
            'w_sample_chart': {
                id: 'w_sample_chart',
                type: 'CHART',
                name: 'Revenue by Region',
                endpointId: epId,
                config: { chartType: 'bar' }
            }
        };
        const layout = [
            { i: 'w_sample_chart', x: 0, y: 0, w: 6, h: 4 }
        ];

        db.run(`INSERT OR IGNORE INTO DashboardVersion (id, dashboardId, version, status, globalFilters, layout, widgets, publishedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [uuid(), dashId, 1, 'published', '{}', JSON.stringify(layout), JSON.stringify(widgets), new Date().toISOString()]);
        
        // Also create a draft version (v2)
         db.run(`INSERT OR IGNORE INTO DashboardVersion (id, dashboardId, version, status, globalFilters, layout, widgets) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [uuid(), dashId, 2, 'draft', '{}', JSON.stringify(layout), JSON.stringify(widgets)]);
         
         db.run(`UPDATE Dashboard SET latestVersion = 2 WHERE id = ?`, [dashId]);
    });

    console.log('Seed data inserted successfully.');
}

seed().then(() => db.close());