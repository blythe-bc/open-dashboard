import React, { useState, useEffect } from 'react';
import { fetcher, postData } from '../../lib/api-client';
import AdminLayout from '../../components/AdminLayout';

const DashboardsAdminPage = () => {
    const [dashboards, setDashboards] = useState([]);
    const [selectedDash, setSelectedDash] = useState(null);
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboards();
    }, []);

    const loadDashboards = async () => {
        try {
            const data = await fetcher('/api/admin/dashboards');
            setDashboards(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadVersions = async (dashId) => {
        setSelectedDash(dashboards.find(d => d.id === dashId));
        try {
            const data = await fetcher(`/api/admin/dashboards/${dashId}/versions`);
            setVersions(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleRollback = async (version) => {
        if (!window.confirm(`Rollback to version ${version}?`)) return;
        try {
            await postData(`/api/admin/dashboards/${selectedDash.id}/rollback`, { version });
            alert('Rollback successful');
            loadDashboards(); // Refresh meta
            loadVersions(selectedDash.id); // Refresh versions
        } catch (err) {
            alert('Rollback failed');
        }
    };

    if (loading) return <AdminLayout title="Dashboard Management">Loading...</AdminLayout>;

    return (
        <AdminLayout title="Dashboard Management">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
                        <h3 style={{ margin: 0, fontSize: '18px' }}>Dashboards</h3>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {dashboards.map(d => (
                            <li 
                                key={d.id} 
                                onClick={() => loadVersions(d.id)}
                                style={{ 
                                    padding: '16px 20px', 
                                    borderBottom: '1px solid var(--border-color)',
                                    cursor: 'pointer',
                                    background: selectedDash?.id === d.id ? 'var(--accents-1)' : 'transparent',
                                    transition: 'background 0.15s ease'
                                }}
                            >
                                <div style={{ fontWeight: 600, fontSize: '15px', color: selectedDash?.id === d.id ? 'var(--geist-foreground)' : 'var(--accents-6)' }}>{d.name}</div>
                                <div style={{ fontSize: '12px', color: 'var(--accents-4)', marginTop: '4px' }}>
                                    v{d.publishedVersion} published • v{d.latestVersion} latest
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {selectedDash && (
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                         <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
                             <h3 style={{ margin: 0, fontSize: '18px' }}>Version History: {selectedDash.name}</h3>
                         </div>
                        
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                <thead>
                                    <tr style={{ background: 'var(--accents-1)', borderBottom: '1px solid var(--border-color)' }}>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: 'var(--accents-5)', letterSpacing: '0.05em' }}>Ver</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: 'var(--accents-5)', letterSpacing: '0.05em' }}>Status</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: 'var(--accents-5)', letterSpacing: '0.05em' }}>Date</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: 'var(--accents-5)', letterSpacing: '0.05em' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {versions.map(v => (
                                        <tr key={v.id} style={{ borderBottom: '1px solid var(--border-color)', background: v.version === selectedDash.publishedVersion ? 'rgba(0, 112, 243, 0.05)' : 'transparent' }}>
                                            <td style={{ padding: '12px 16px', fontWeight: 600 }}>{v.version}</td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <span style={{ 
                                                    padding: '2px 8px', 
                                                    borderRadius: '12px', 
                                                    background: v.status === 'published' ? 'var(--accents-2)' : 'var(--accents-1)',
                                                    fontSize: '12px',
                                                    fontWeight: 500,
                                                    color: v.status === 'published' ? 'var(--geist-foreground)' : 'var(--accents-5)'
                                                }}>
                                                    {v.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 16px', color: 'var(--accents-4)' }}>{new Date(v.createdAt).toLocaleString()}</td>
                                            <td style={{ padding: '12px 16px' }}>
                                                {v.version !== selectedDash.publishedVersion && v.status === 'published' && (
                                                    <button className="btn secondary" style={{ height: '28px', fontSize: '12px', padding: '0 12px' }} onClick={() => handleRollback(v.version)}>Rollback</button>
                                                )}
                                                {v.version === selectedDash.publishedVersion && (
                                                    <span style={{ color: 'var(--geist-success)', fontWeight: 600, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <span style={{ width: '6px', height: '6px', background: 'currentColor', borderRadius: '50%' }}></span>
                                                        Published
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {!selectedDash && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accents-4)', fontStyle: 'italic' }}>
                        Select a dashboard to view its version history and manage releases.
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default DashboardsAdminPage;
