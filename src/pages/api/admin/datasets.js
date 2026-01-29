import { openDb } from '../../../lib/db';
import crypto from 'crypto';

export default async function handler(req, res) {
    const db = await openDb();

    if (req.method === 'GET') {
        const datasets = await db.all('SELECT * FROM SemanticDataset');
        // enrich with metrics
        for (const ds of datasets) {
            ds.metrics = await db.all('SELECT * FROM SemanticMetric WHERE datasetId = ?', [ds.id]);
        }
        await db.close();
        return res.status(200).json(datasets);
    }

    if (req.method === 'POST') {
        const { name, allowedParams } = req.body;
        const id = crypto.randomUUID();
        await db.run(
            'INSERT INTO SemanticDataset (id, name, allowedParams) VALUES (?, ?, ?)',
            [id, name, allowedParams]
        );
        await db.close();
        return res.status(201).json({ id, name, allowedParams });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
