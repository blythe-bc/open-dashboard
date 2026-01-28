import { openDb } from '../../../lib/db';

export default async function handler(req, res) {
    // 1. Get user info from headers (mocked for development if headers are missing)
    const adUser = req.headers['x-auth-user'] || 'DOMAIN\\guest';
    const adGroups = (req.headers['x-auth-groups'] || 'EVERYONE').split(',');

    const db = await openDb();

    try {
        // 2. Find workspaces user has access to based on AD Groups
        const placeholders = adGroups.map(() => '?').join(',');
        const roleBindings = await db.all(
            `SELECT * FROM WorkspaceRoleBinding WHERE adGroup IN (${placeholders})`,
            adGroups
        );

        const workspaceIds = [...new Set(roleBindings.map(rb => rb.workspaceId))];

        const workspaces = [];

        for (const workspaceId of workspaceIds) {
            const workspace = await db.get(`SELECT * FROM Workspace WHERE id = ?`, [workspaceId]);
            const policy = await db.get(`SELECT * FROM WorkspacePolicy WHERE workspaceId = ?`, [workspaceId]);
            const role = roleBindings.find(rb => rb.workspaceId === workspaceId).role;

            // Fetch Catalog
            const datasets = await db.all(`SELECT * FROM SemanticDataset`); // For MVP, we might show all or filter
            const metrics = await db.all(`SELECT * FROM SemanticMetric`);
            const endpoints = await db.all(`SELECT * FROM SemanticMetricEndpoint`);
            
            // Format response according to schema in Phase 0 doc
            workspaces.push({
                workspaceId: workspace.id,
                name: workspace.name,
                role: role,
                policy: {
                    expertOverride: !!policy.expertOverride,
                    allowPublishByBuilder: !!policy.allowPublishByBuilder,
                    maxChartPoints: policy.maxChartPoints,
                    maxGridClientRows: policy.maxGridClientRows
                },
                catalog: {
                    datasets: datasets.map(ds => ({
                        datasetId: ds.id,
                        name: ds.name,
                        allowedParams: ds.allowedParams ? ds.allowedParams.split(',') : [],
                        hierarchies: [] // TODO: join with SemanticDatasetHierarchy
                    })),
                    metrics: metrics.map(m => ({
                        metricId: m.id,
                        name: m.name,
                        datasetId: m.datasetId,
                        endpointId: endpoints.find(e => e.metricId === m.id)?.id
                    })),
                    endpoints: endpoints.map(e => ({
                        endpointId: e.id,
                        name: e.name,
                        timeoutMs: e.timeoutMs,
                        maxRows: e.maxRows,
                        maxItems: e.maxItems
                    }))
                },
                standards: {
                    allowedClassNames: ["ok", "warn", "fail", "muted", "info", "accent"],
                    themeId: "corp_default"
                }
            });
        }

        res.status(200).json({
            adUser,
            adGroups,
            workspaces
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await db.close();
    }
}
