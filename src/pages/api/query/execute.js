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
        console.log(`[Query] Executing for ws:${workspaceId}, ep:${endpointId}, groups:${adGroups}`);

        // 1. Validate Workspace Access
        const placeholders = adGroups.map(() => '?').join(',');
        const roleBinding = await db.get(
            `SELECT * FROM WorkspaceRoleBinding WHERE workspaceId = ? AND adGroup IN (${placeholders})`,
            [workspaceId, ...adGroups]
        );

        if (!roleBinding) {
            console.error('[Query] Access Denied: No role binding');
            return res.status(403).json({
                status: 403,
                errorCode: 'FORBIDDEN',
                message: 'No access to this workspace',
                requestId
            });
        }

        // 2. Validate Endpoint
        const endpoint = await db.get(`SELECT * FROM SemanticMetricEndpoint WHERE id = ?`, [endpointId]);
        if (!endpoint) {
             console.error(`[Query] Endpoint not found: ${endpointId}`);
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
        
        if (!dataset) {
             console.error(`[Query] Dataset not found for metric: ${endpoint.metricId}`);
             throw new Error('Dataset configuration error');
        }

        const allowedParams = dataset.allowedParams ? dataset.allowedParams.split(',') : [];
        console.log(`[Query] Allowed params: ${allowedParams.join(',')}`);

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
            { name: "Value A", type: "number" },
            { name: "Value B", type: "number" }
        ];

        const rowCount = Math.floor(Math.random() * 10) + 5; // 5 to 15 rows
        const rows = [];
        const categories = ['North', 'South', 'East', 'West', 'Central', 'EMEA', 'APAC', 'LATAM'];
        
        for (let i = 0; i < rowCount; i++) {
            const label = categories[i % categories.length] + (i >= categories.length ? ` ${Math.floor(i/categories.length) + 1}` : '');
            
            // Random values
            const valA = Math.floor(Math.random() * 5000) + 500;
            const valB = Math.floor(Math.random() * 3000) + 200;
            rows.push([label, valA, valB]);
        }
        
        // Sort by category name for stability
        rows.sort((a, b) => a[0].localeCompare(b[0]));

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
