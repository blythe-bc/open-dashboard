export default function handler(req, res) {
    if (req.method === 'POST') {
        const { dashboardId } = req.body;
        // Mock token generation
        // In real world, sign with secret
        const token = Buffer.from(JSON.stringify({
            dashboardId,
            exp: Date.now() + 3600000, // 1 hour
            user: 'embed_user'
        })).toString('base64');
        
        res.status(200).json({ token });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}