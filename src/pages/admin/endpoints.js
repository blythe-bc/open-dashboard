import React, { useState, useEffect } from 'react';
import { fetcher } from '../../lib/api-client';

const EndpointsPage = () => {
    const [endpoints, setEndpoints] = useState([]);
    const [selectedEp, setSelectedEp] = useState(null);
    const [impact, setImpact] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEndpoints();
    }, []);

    const loadEndpoints = async () => {
        try {
            const data = await fetcher('/api/admin/endpoints');
            setEndpoints(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadImpact = async (ep) => {
        setSelectedEp(ep);
        try {
            const data = await fetcher(`/api/admin/endpoints/${ep.id}/impact`);
            setImpact(data);
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ padding: '20px', display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
                <h1>Endpoints Management</h1>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {endpoints.map(ep => (
                        <li 
                            key={ep.id} 
                            onClick={() => loadImpact(ep)}
                            style={{ 
                                padding: '10px', 
                                border: '1px solid #ccc', 
                                marginBottom: '5px', 
                                cursor: 'pointer',
                                background: selectedEp?.id === ep.id ? '#eef' : 'white'
                            }}
                        >
                            <strong>{ep.name}</strong> (Metric: {ep.metricId})
                        </li>
                    ))}
                </ul>
            </div>

            {selectedEp && impact && (
                <div style={{ flex: 1, borderLeft: '1px solid #ddd', paddingLeft: '20px' }}>
                    <h2>Impact Preview: {selectedEp.name}</h2>
                    <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
                        <h3>Usage Statistics (Last 24h)</h3>
                        <p>Total Calls: {impact.stats.totalCalls}</p>
                        <p>Avg Duration: {Math.round(impact.stats.avgDuration || 0)}ms</p>
                    </div>

                    <h3>Affected Dashboards ({impact.dashboards.length})</h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {impact.dashboards.map(d => (
                            <li key={d.id} style={{ padding: '5px 0', borderBottom: '1px solid #eee' }}>
                                {d.name}
                            </li>
                        ))}
                    </ul>
                    {impact.dashboards.length === 0 && <p>No dashboards affected.</p>}
                </div>
            )}
        </div>
    );
};

export default EndpointsPage;