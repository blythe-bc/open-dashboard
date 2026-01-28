import { openDb } from '../../../../../lib/db';

export default async function handler(req, res) {
    const { workspaceId } = req.query;
    const db = await openDb();

    if (req.method === 'GET') {
        const policy = await db.get('SELECT * FROM WorkspacePolicy WHERE workspaceId = ?', [workspaceId]);
        await db.close();
        return res.status(200).json(policy);
    }

    if (req.method === 'PUT') {
        const { expertOverride, allowPublishByBuilder, maxChartPoints, maxGridClientRows, llmEnabled } = req.body;
        await db.run(
            `UPDATE WorkspacePolicy SET 
                expertOverride = ?, 
                allowPublishByBuilder = ?, 
                maxChartPoints = ?, 
                maxGridClientRows = ?,
                llmEnabled = ?,
                updatedAt = CURRENT_TIMESTAMP
             WHERE workspaceId = ?`,
            [expertOverride ? 1 : 0, allowPublishByBuilder ? 1 : 0, maxChartPoints, maxGridClientRows, llmEnabled ? 1 : 0, workspaceId]
        );
        await db.close();
        return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
