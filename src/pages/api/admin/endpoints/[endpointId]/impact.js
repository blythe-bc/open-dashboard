import { openDb } from '../../../../../lib/db';

export default async function handler(req, res) {
    const { endpointId } = req.query;
    const db = await openDb();

    try {
        // Find all DashboardVersions that contain this endpointId in their widgets JSON
        // Since we store widgets as JSON in DashboardVersion, we use SQL LIKE or JSON functions
        const impact = await db.all(`
            SELECT DISTINCT d.id, d.name
            FROM Dashboard d
            JOIN DashboardVersion dv ON d.id = dv.dashboardId
            WHERE dv.widgets LIKE ?
        `, [`%${endpointId}%`]);

        // Get usage stats
        const stats = await db.get(`
            SELECT COUNT(*) as totalCalls, AVG(durationMs) as avgDuration
            FROM (
                SELECT json_extract(details, '$.durationMs') as durationMs
                FROM AuditLog
                WHERE event = 'QUERY_EXECUTE' AND details LIKE ?
            )
        `, [`%${endpointId}%`]);

        res.status(200).json({ dashboards: impact, stats });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        await db.close();
    }
}
