import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { fetcher } from '../../lib/api-client';
import Widget from '../../components/Widget';

const DashboardViewer = () => {
    const router = useRouter();
    const { dashboardId } = router.query;
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!dashboardId) return;

        const loadDashboard = async () => {
            try {
                const data = await fetcher(`/api/dash/${dashboardId}`);
                setDashboard(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, [dashboardId]);

    if (loading) return <div>Loading dashboard...</div>;
    if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
    if (!dashboard) return <div>Dashboard not found</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h1>{dashboard.name}</h1>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {dashboard.widgets.map(widget => (
                    <Widget 
                        key={widget.id} 
                        widget={widget} 
                        workspaceId={dashboard.workspaceId} 
                    />
                ))}
            </div>
        </div>
    );
};

export default DashboardViewer;
