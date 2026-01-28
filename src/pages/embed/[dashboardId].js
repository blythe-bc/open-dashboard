import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { fetcher } from '../../lib/api-client';
import Widget from '../../components/Widget';

const EmbedViewer = () => {
    const router = useRouter();
    const { dashboardId, token } = router.query;
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!dashboardId || !token) return;

        const loadDashboard = async () => {
            try {
                // Verify token (Mock client-side check, real check should be in API middleware)
                const payload = JSON.parse(atob(token));
                if (payload.dashboardId !== dashboardId) throw new Error('Invalid token');
                if (payload.exp < Date.now()) throw new Error('Token expired');

                const data = await fetcher(`/api/dash/${dashboardId}`);
                setDashboard(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, [dashboardId, token]);

    if (!token) return <div>Missing token</div>;
    if (loading) return <div>Loading embed...</div>;
    if (error) return <div style={{ color: 'red' }}>Embed Error: {error}</div>;

    return (
        <div style={{ padding: '10px', background: 'white' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {dashboard.widgets.map(widget => (
                    <Widget 
                        key={widget.id} 
                        widget={widget} 
                        workspaceId={dashboard.workspaceId}
                        filters={{}} // No interactive filters for embed MVP
                    />
                ))}
            </div>
        </div>
    );
};

export default EmbedViewer;
