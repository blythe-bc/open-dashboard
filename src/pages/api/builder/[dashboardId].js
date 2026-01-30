import { openDb } from '../../../lib/db';
import crypto from 'crypto';

export default async function handler(req, res) {
    const { dashboardId } = req.query;
    const db = await openDb();

    if (req.method === 'GET') {
        try {
            // Get dashboard meta
            const dashboard = await db.get(`SELECT * FROM Dashboard WHERE id = ?`, [dashboardId]);
            if (!dashboard) {
                return res.status(404).json({ message: 'Dashboard not found' });
            }

            // Get latest version (likely draft)
            const version = await db.get(
                `SELECT * FROM DashboardVersion WHERE dashboardId = ? ORDER BY version DESC LIMIT 1`,
                [dashboardId]
            );
            
            // If no version exists (shouldn't happen with correct seed/create), create a clean draft from published or scratch
            // For now assume seed/create ensures at least one version.

            res.status(200).json({
                meta: dashboard,
                version: {
                    ...version,
                    globalFilters: JSON.parse(version.globalFilters || '{}'),
                    layout: JSON.parse(version.layout || '[]'),
                    widgets: JSON.parse(version.widgets || '{}'),
                    settings: JSON.parse(version.settings || '{}')
                }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        } finally {
            await db.close();
        }
    } else if (req.method === 'PUT') {
        // Save Draft
        const { layout, widgets, globalFilters, settings } = req.body;
        try {
            // Check if latest version is draft
            const latest = await db.get(
                `SELECT * FROM DashboardVersion WHERE dashboardId = ? ORDER BY version DESC LIMIT 1`,
                [dashboardId]
            );

            if (latest.status === 'draft') {
                // Update existing draft
                await db.run(
                    `UPDATE DashboardVersion SET layout = ?, widgets = ?, globalFilters = ?, settings = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
                    [JSON.stringify(layout), JSON.stringify(widgets), JSON.stringify(globalFilters), JSON.stringify(settings || {}), latest.id]
                );
            } else {
                // Latest is published, create new draft version
                const newVersion = latest.version + 1;
                await db.run(
                    `INSERT INTO DashboardVersion (id, dashboardId, version, status, layout, widgets, globalFilters, settings) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [crypto.randomUUID(), dashboardId, newVersion, 'draft', JSON.stringify(layout), JSON.stringify(widgets), JSON.stringify(globalFilters), JSON.stringify(settings || {})]
                );
                await db.run(`UPDATE Dashboard SET latestVersion = ? WHERE id = ?`, [newVersion, dashboardId]);
            }

            res.status(200).json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        } finally {
            await db.close();
        }
    } else {
        res.setHeader('Allow', ['GET', 'PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
