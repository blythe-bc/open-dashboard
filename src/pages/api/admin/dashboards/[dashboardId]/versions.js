import { openDb } from '../../../../../lib/db';

export default async function handler(req, res) {
    const { dashboardId } = req.query;
    const db = await openDb();

    if (req.method === 'GET') {
        try {
            const versions = await db.all(
                `SELECT * FROM DashboardVersion WHERE dashboardId = ? ORDER BY version DESC`,
                [dashboardId]
            );
            res.status(200).json(versions);
        } catch (error) {
            res.status(500).json({ error: error.message });
        } finally {
            await db.close();
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
