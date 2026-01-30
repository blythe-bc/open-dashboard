import { openDb } from '../../../lib/db';

export default async function handler(req, res) {
    const { dashboardId } = req.query;
    const db = await openDb();

    try {
        const dashboard = await db.get(`SELECT * FROM Dashboard WHERE id = ?`, [dashboardId]);
        if (!dashboard) {
            return res.status(404).json({ message: 'Dashboard not found' });
        }

        if (dashboard.publishedVersion < 1) {
             return res.status(403).json({ message: 'Dashboard not published' });
        }

        const version = await db.get(
            `SELECT * FROM DashboardVersion WHERE dashboardId = ? AND version = ?`, 
            [dashboardId, dashboard.publishedVersion]
        );

        if (!version) {
             return res.status(404).json({ message: 'Published version data not found' });
        }

        // Parse JSON fields
        const widgetsMap = JSON.parse(version.widgets || '{}');
        const widgets = Object.values(widgetsMap); // Convert map to array for frontend
        const layout = JSON.parse(version.layout || '[]');
        const globalFilters = JSON.parse(version.globalFilters || '{}');
        const settings = JSON.parse(version.settings || '{"theme": "default"}');

        res.status(200).json({
            ...dashboard,
            widgets,
            layout,
            globalFilters,
            settings,
            version: version.version,
            publishedAt: version.publishedAt
        });
    } catch (error) {
        console.error("Dashboard API Error:", error);
        res.status(500).json({ error: error.message });
    } finally {
        await db.close();
    }
}
