import { openDb } from '../../../lib/db';
import crypto from 'crypto';

export default async function handler(req, res) {
    const db = await openDb();

    if (req.method === 'GET') {
        const maps = await db.all('SELECT * FROM SPParameterMap');
        await db.close();
        return res.status(200).json(maps);
    }

    if (req.method === 'POST') {
        const { endpointId, paramName, spParam, transform, maxItems, regex } = req.body;
        const id = crypto.randomUUID();
        await db.run(
            'INSERT INTO SPParameterMap (id, endpointId, paramName, spParam, transform, maxItems, regex) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, endpointId, paramName, spParam, transform, maxItems, regex]
        );
        await db.close();
        return res.status(201).json({ id });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
