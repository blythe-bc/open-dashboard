import { openDb } from '../../../lib/db';
import crypto from 'crypto';

export default async function handler(req, res) {
    const db = await openDb();

    if (req.method === 'GET') {
        const bindings = await db.all('SELECT * FROM WorkspaceRoleBinding');
        await db.close();
        return res.status(200).json(bindings);
    }

    if (req.method === 'POST') {
        const { workspaceId, adGroup, role } = req.body;
        const id = crypto.randomUUID();
        await db.run(
            'INSERT INTO WorkspaceRoleBinding (id, workspaceId, adGroup, role) VALUES (?, ?, ?, ?)',
            [id, workspaceId, adGroup, role]
        );
        await db.close();
        return res.status(201).json({ id, workspaceId, adGroup, role });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
