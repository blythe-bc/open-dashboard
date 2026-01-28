import { openDb } from '../../../lib/db';

export default async function handler(req, res) {
    const db = await openDb();

    try {
        // Aggregate statistics from AuditLog
        const stats = await db.all(`
            SELECT 
                json_extract(details, '$.endpointId') as endpointId,
                COUNT(*) as callCount,
                AVG(json_extract(details, '$.durationMs')) as avgDuration,
                MAX(json_extract(details, '$.durationMs')) as maxDuration,
                SUM(CASE WHEN json_extract(details, '$.errorCode') IS NOT NULL THEN 1 ELSE 0 END) as errorCount
            FROM AuditLog 
            WHERE event = 'QUERY_EXECUTE'
            GROUP BY endpointId
        `);

        res.status(200).json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    } finally {
        await db.close();
    }
}
