import { openDb } from '../../../../lib/db';

export default async function handler(req, res) {
    const db = await openDb();

    if (req.method === 'GET') {
        try {
            const endpoints = await db.all('SELECT * FROM SemanticMetricEndpoint');
            res.status(200).json(endpoints);
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
