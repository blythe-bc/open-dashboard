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

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ padding: '20px', display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
                <h1>Dashboards Management</h1>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {dashboards.map(d => (
                        <li 
                            key={d.id} 
                            onClick={() => loadVersions(d.id)}
                            style={{ 
                                padding: '10px', 
                                border: '1px solid #ccc',
                                marginBottom: '5px',
                                cursor: 'pointer',
                                background: selectedDash?.id === d.id ? '#eef' : 'white'
                            }}
                        >
                            <strong>{d.name}</strong> (v{d.publishedVersion} published / v{d.latestVersion} latest)
                        </li>
                    ))}
                </ul>
            </div>

            {selectedDash && (
                <div style={{ flex: 1, borderLeft: '1px solid #ddd', paddingLeft: '20px' }}>
                    <h2>Version History: {selectedDash.name}</h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#eee', textAlign: 'left' }}>
                                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Ver</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Status</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Date</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {versions.map(v => (
                                <tr key={v.id} style={{ background: v.version === selectedDash.publishedVersion ? '#f0fff0' : 'transparent' }}>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{v.version}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{v.status}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{new Date(v.createdAt).toLocaleString()}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                        {v.version !== selectedDash.publishedVersion && v.status === 'published' && (
                                            <button onClick={() => handleRollback(v.version)}>Rollback to this</button>
                                        )}
                                        {v.version === selectedDash.publishedVersion && (
                                            <span>Current Published</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default DashboardsAdminPage;
