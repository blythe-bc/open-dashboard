import { openDb } from '../../../../lib/db';
import crypto from 'crypto';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { dashboardId } = req.query;
    const db = await openDb();

    try {
        const latest = await db.get(
            `SELECT * FROM DashboardVersion WHERE dashboardId = ? ORDER BY version DESC LIMIT 1`,
            [dashboardId]
        );

        if (latest.status === 'published') {
            return res.status(400).json({ message: 'Latest version is already published' });
        }

        // Publish the draft
        await db.run(
            `UPDATE DashboardVersion SET status = 'published', publishedAt = CURRENT_TIMESTAMP WHERE id = ?`,
            [latest.id]
        );

        // Update Dashboard meta
        await db.run(
            `UPDATE Dashboard SET publishedVersion = ? WHERE id = ?`,
            [latest.version, dashboardId]
        );

        res.status(200).json({ success: true, version: latest.version });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    } finally {
        await db.close();
    }
}
