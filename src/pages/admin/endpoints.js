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

    if (loading) return <div className="container" style={{ marginTop: '20px' }}>Loading...</div>;

    return (
        <div className="container">
            <h1 style={{ marginBottom: '20px' }}>Endpoints Management</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                <div className="card">
                    <h3 style={{ marginTop: 0 }}>Endpoints</h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {endpoints.map(ep => (
                            <li 
                                key={ep.id} 
                                onClick={() => loadImpact(ep)}
                                style={{ 
                                    padding: '12px', 
                                    borderBottom: '1px solid #eee', 
                                    cursor: 'pointer',
                                    background: selectedEp?.id === ep.id ? '#f0f7ff' : 'transparent',
                                    color: selectedEp?.id === ep.id ? 'var(--primary-color)' : 'inherit'
                                }}
                            >
                                <div style={{ fontWeight: 600 }}>{ep.name}</div>
                                <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>Metric: {ep.metricId}</div>
                            </li>
                        ))}
                    </ul>
                </div>

                {selectedEp && impact && (
                    <div className="card">
                        <h3 style={{ marginTop: 0 }}>Impact Preview: {selectedEp.name}</h3>
                        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                            <div style={{ flex: 1, background: '#f9f9f9', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary-color)' }}>{impact.stats.totalCalls}</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Calls (24h)</div>
                            </div>
                            <div style={{ flex: 1, background: '#f9f9f9', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{Math.round(impact.stats.avgDuration || 0)}ms</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Avg Duration</div>
                            </div>
                        </div>

                        <h4>Affected Dashboards ({impact.dashboards.length})</h4>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {impact.dashboards.map(d => (
                                <li key={d.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                                    <a href={`/dash/${d.id}`} target="_blank" style={{ fontWeight: 600 }}>{d.name}</a>
                                    <span style={{ fontSize: '12px', color: '#888', marginLeft: '10px' }}>(v{d.publishedVersion})</span>
                                </li>
                            ))}
                        </ul>
                        {impact.dashboards.length === 0 && <p style={{ color: '#888', fontStyle: 'italic' }}>No dashboards are currently using this endpoint.</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EndpointsPage;