import { openDb } from '../../../lib/db';

export default async function handler(req, res) {
    const { dashboardId } = req.query;
    const db = await openDb();

    try {
        const dashboard = await db.get(`SELECT * FROM Dashboard WHERE id = ?`, [dashboardId]);
        if (!dashboard) {
            return res.status(404).json({ message: 'Dashboard not found' });
        }

        if (dashboard.isPublished === 0) {
             // In production, we'd check if user has Builder access to see draft
             // For Viewer MVP, we only show Published.
             return res.status(403).json({ message: 'Dashboard not published' });
        }

        const widgets = await db.all(`SELECT * FROM Widget WHERE dashboardId = ?`, [dashboardId]);

        res.status(200).json({
            ...dashboard,
            widgets
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        await db.close();
    }
}
