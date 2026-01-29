import React, { useState, useEffect } from 'react';
import { fetcher, postData } from '../../lib/api-client';

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
        } catch (err) {
            alert('Rollback failed');
        }
    };

    if (loading) return <div className="container" style={{ marginTop: '20px' }}>Loading...</div>;

    return (
        <div className="container">
            <h1 style={{ marginBottom: '20px' }}>Dashboards Management</h1>
            
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div className="card" style={{ flex: 1 }}>
                    <h3 style={{ marginTop: 0 }}>Dashboards</h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {dashboards.map(d => (
                            <li 
                                key={d.id} 
                                onClick={() => loadVersions(d.id)}
                                style={{ 
                                    padding: '12px', 
                                    borderBottom: '1px solid #eee',
                                    cursor: 'pointer',
                                    background: selectedDash?.id === d.id ? '#f0f7ff' : 'transparent',
                                    color: selectedDash?.id === d.id ? 'var(--primary-color)' : 'inherit'
                                }}
                            >
                                <div style={{ fontWeight: 600 }}>{d.name}</div>
                                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                    v{d.publishedVersion} published / v{d.latestVersion} latest
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {selectedDash && (
                    <div className="card" style={{ flex: 2 }}>
                        <h3 style={{ marginTop: 0 }}>Version History: {selectedDash.name}</h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                <thead>
                                    <tr style={{ background: '#f9f9f9', borderBottom: '2px solid #eee' }}>
                                        <th style={{ padding: '10px', textAlign: 'left' }}>Ver</th>
                                        <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
                                        <th style={{ padding: '10px', textAlign: 'left' }}>Date</th>
                                        <th style={{ padding: '10px', textAlign: 'left' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {versions.map(v => (
                                        <tr key={v.id} style={{ borderBottom: '1px solid #eee', background: v.version === selectedDash.publishedVersion ? '#e6fffa' : 'transparent' }}>
                                            <td style={{ padding: '10px' }}>{v.version}</td>
                                            <td style={{ padding: '10px' }}>
                                                <span style={{ 
                                                    padding: '2px 6px', 
                                                    borderRadius: '4px', 
                                                    background: v.status === 'published' ? '#success' : '#eee',
                                                    fontSize: '12px'
                                                }}>
                                                    {v.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '10px' }}>{new Date(v.createdAt).toLocaleString()}</td>
                                            <td style={{ padding: '10px' }}>
                                                {v.version !== selectedDash.publishedVersion && v.status === 'published' && (
                                                    <button className="btn" style={{ fontSize: '12px', padding: '4px 8px' }} onClick={() => handleRollback(v.version)}>Rollback to this</button>
                                                )}
                                                {v.version === selectedDash.publishedVersion && (
                                                    <span style={{ color: 'green', fontWeight: 600 }}>Current Published</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardsAdminPage;
