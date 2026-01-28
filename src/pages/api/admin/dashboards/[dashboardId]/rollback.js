import { openDb } from '../../../../../lib/db';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { dashboardId } = req.query;
    const { version } = req.body;

    if (!version) return res.status(400).json({ message: 'Version is required' });

    const db = await openDb();

    try {
        // Verify version exists
        const ver = await db.get(
            `SELECT * FROM DashboardVersion WHERE dashboardId = ? AND version = ?`,
            [dashboardId, version]
        );

        if (!ver) return res.status(404).json({ message: 'Version not found' });

        // Update Dashboard publishedVersion
        await db.run(
            `UPDATE Dashboard SET publishedVersion = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
            [version, dashboardId]
        );

        // Update Audit Log
        await db.run(
            `INSERT INTO AuditLog (id, event, user, details) VALUES (?, ?, ?, ?)`,
            [
                require('crypto').randomUUID(),
                'DASHBOARD_ROLLBACK',
                req.headers['x-auth-user'] || 'DOMAIN\\admin',
                JSON.stringify({ dashboardId, version })
            ]
        );

        res.status(200).json({ success: true, publishedVersion: version });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    } finally {
        await db.close();
    }
}
