import { openDb } from '../../../lib/db';
import crypto from 'crypto';

export default async function handler(req, res) {
    const db = await openDb();

    if (req.method === 'GET') {
        const workspaces = await db.all('SELECT * FROM Workspace');
        await db.close();
        return res.status(200).json(workspaces);
    }

    if (req.method === 'POST') {
        const { name } = req.body;
        const id = crypto.randomUUID();
        await db.run('INSERT INTO Workspace (id, name) VALUES (?, ?)', [id, name]);
        
        // Also create a default policy for the new workspace
        const policyId = crypto.randomUUID();
        await db.run('INSERT INTO WorkspacePolicy (id, workspaceId) VALUES (?, ?)', [policyId, id]);

        await db.close();
        return res.status(201).json({ id, name });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
