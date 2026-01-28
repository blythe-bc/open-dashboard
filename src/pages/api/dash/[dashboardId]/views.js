import { openDb } from '../../../../lib/db';
import crypto from 'crypto';

export default async function handler(req, res) {
    const { dashboardId } = req.query;
    const db = await openDb();

    // Mock User
    const userId = req.headers['x-auth-user'] || 'DOMAIN\\guest';

    if (req.method === 'GET') {
        try {
            const views = await db.all(
                `SELECT * FROM SavedView WHERE dashboardId = ? AND userId = ? ORDER BY createdAt DESC`,
                [dashboardId, userId]
            );
            res.status(200).json(views);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        } finally {
            await db.close();
        }
    } else if (req.method === 'POST') {
        const { name, filters } = req.body;
        if (!name) return res.status(400).json({ message: 'Name is required' });

        try {
            const id = crypto.randomUUID();
            await db.run(
                `INSERT INTO SavedView (id, dashboardId, name, userId, filters) VALUES (?, ?, ?, ?, ?)`,
                [id, dashboardId, name, userId, JSON.stringify(filters || {})]
            );
            res.status(201).json({ id, name });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        } finally {
            await db.close();
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
