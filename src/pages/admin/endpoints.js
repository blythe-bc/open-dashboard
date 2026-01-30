import React, { useState, useEffect } from 'react';
import { fetcher } from '../../lib/api-client';
import AdminLayout from '../../components/AdminLayout';

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

    if (loading) return <AdminLayout title="Endpoints">Loading...</AdminLayout>;

    return (
        <AdminLayout title="Endpoints">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
                        <h3 style={{ margin: 0, fontSize: '18px' }}>Endpoints List</h3>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {endpoints.map(ep => (
                            <li 
                                key={ep.id} 
                                onClick={() => loadImpact(ep)}
                                style={{ 
                                    padding: '16px 20px', 
                                    borderBottom: '1px solid var(--border-color)', 
                                    cursor: 'pointer',
                                    background: selectedEp?.id === ep.id ? 'var(--accents-1)' : 'transparent',
                                    transition: 'background 0.15s ease'
                                }}
                            >
                                <div style={{ fontWeight: 600, fontSize: '15px', color: selectedEp?.id === ep.id ? 'var(--geist-foreground)' : 'var(--accents-6)' }}>{ep.name}</div>
                                <div style={{ fontSize: '12px', color: 'var(--accents-4)', marginTop: '4px', fontFamily: 'monospace' }}>Metric: {ep.metricId}</div>
                            </li>
                        ))}
                    </ul>
                </div>

                {selectedEp && impact ? (
                    <div className="card">
                        <div style={{ paddingBottom: '20px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
                            <h3 style={{ margin: 0, fontSize: '18px' }}>Impact Preview: {selectedEp.name}</h3>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                            <div style={{ background: 'var(--accents-1)', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                                <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--geist-foreground)', letterSpacing: '-0.02em' }}>{impact.stats.totalCalls}</div>
                                <div style={{ fontSize: '12px', color: 'var(--accents-5)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Calls (24h)</div>
                            </div>
                            <div style={{ background: 'var(--accents-1)', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                                <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--geist-foreground)', letterSpacing: '-0.02em' }}>{Math.round(impact.stats.avgDuration || 0)}ms</div>
                                <div style={{ fontSize: '12px', color: 'var(--accents-5)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Duration</div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '12px', fontSize: '13px', fontWeight: 600, color: 'var(--accents-6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Affected Dashboards ({impact.dashboards.length})
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {impact.dashboards.map(d => (
                                <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--geist-background)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                                    <a href={`/dash/${d.id}`} target="_blank" style={{ fontWeight: 600, textDecoration: 'none', color: 'var(--geist-foreground)', fontSize: '14px' }}>{d.name}</a>
                                    <span style={{ fontSize: '12px', padding: '2px 8px', background: 'var(--accents-2)', borderRadius: '12px', color: 'var(--accents-5)' }}>v{d.publishedVersion}</span>
                                </div>
                            ))}
                            {impact.dashboards.length === 0 && (
                                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--accents-4)', background: 'var(--accents-1)', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
                                    No dashboards are currently using this endpoint.
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accents-4)', fontStyle: 'italic' }}>
                        Select an endpoint to see its usage impact.
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default EndpointsPage;