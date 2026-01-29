import { openDb } from '../../../lib/db';
import crypto from 'crypto';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { workspaceId, endpointId, params, context, requestId = `req_${crypto.randomUUID()}` } = req.body;

    // mock headers for dev
    const adGroups = (req.headers['x-auth-groups'] || 'EVERYONE').split(',');

    const db = await openDb();

    try {
        // 1. Validate Workspace Access
        const placeholders = adGroups.map(() => '?').join(',');
        const roleBinding = await db.get(
            `SELECT * FROM WorkspaceRoleBinding WHERE workspaceId = ? AND adGroup IN (${placeholders})`,
            [workspaceId, ...adGroups]
        );

        if (!roleBinding) {
            return res.status(403).json({
                status: 403,
                errorCode: 'FORBIDDEN',
                message: 'No access to this workspace',
                requestId
            });
        }

        // 2. Validate Endpoint
        // In a real scenario, we'd check if this endpoint belongs to the workspace's allowed catalog.
        // For MVP, we'll check if it exists.
        const endpoint = await db.get(`SELECT * FROM SemanticMetricEndpoint WHERE id = ?`, [endpointId]);
        if (!endpoint) {
            return res.status(400).json({
                status: 400,
                errorCode: 'VALIDATION_FAILED',
                message: 'Endpoint not found',
                requestId
            });
        }

        // 3. Validate Parameters against allowlist
        const metric = await db.get(`SELECT * FROM SemanticMetric WHERE id = ?`, [endpoint.metricId]);
        const dataset = await db.get(`SELECT * FROM SemanticDataset WHERE id = ?`, [metric.datasetId]);
        const allowedParams = dataset.allowedParams ? dataset.allowedParams.split(',') : [];

        const inputParamNames = Object.keys(params || {});
        for (const p of inputParamNames) {
            if (!allowedParams.includes(p)) {
                return res.status(400).json({
                    status: 400,
                    errorCode: 'VALIDATION_FAILED',
                    message: `Parameter '${p}' is not allowed for this dataset`,
                    requestId
                });
            }
        }

        // 4. Simulate Daemon Execution (Mock data)
        const startTime = Date.now();
        
        // Mocking some delay
        await new Promise(resolve => setTimeout(resolve, 300));

        // Generate dynamic mock data based on endpointId to make it look real
        const columns = [
            { name: "category", type: "string" },
            { name: "value", type: "number" }
        ];

        const rowCount = Math.floor(Math.random() * 20) + 5; // 5 to 25 rows
        const rows = [];
        const categories = ['North', 'South', 'East', 'West', 'Central', 'EMEA', 'APAC', 'LATAM'];
        const products = ['Widget A', 'Widget B', 'Gadget X', 'Gadget Y', 'Tool Z'];
        
        for (let i = 0; i < rowCount; i++) {
            let label;
            if (endpointId.includes('region')) {
                label = categories[i % categories.length];
            } else {
                label = `${products[i % products.length]} - ${Math.floor(i / products.length) + 1}`;
            }
            
            // Random value between 100 and 10000
            const value = Math.floor(Math.random() * 9900) + 100;
            rows.push([label, value]);
        }
        
        // Sort by value desc for better charts
        rows.sort((a, b) => b[1] - a[1]);

        const durationMs = Date.now() - startTime;

        // 5. Audit Log
        await db.run(
            `INSERT INTO AuditLog (id, event, user, details) VALUES (?, ?, ?, ?)`,
            [
                crypto.randomUUID(),
                'QUERY_EXECUTE',
                req.headers['x-auth-user'] || 'DOMAIN\guest',
                JSON.stringify({ endpointId, workspaceId, durationMs, rowCount: rows.length, requestId })
            ]
        );

        res.status(200).json({
            columns,
            rows,
            meta: {
                normalizedParams: params,
                warnings: [],
                cacheKey: `q:${crypto.createHash('md5').update(JSON.stringify({ endpointId, params })).digest('hex')}`,
                cached: false,
                durationMs
            },
            requestId
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            errorCode: 'DAEMON_ERROR',
            message: error.message,
            requestId
        });
    } finally {
        await db.close();
    }
}
