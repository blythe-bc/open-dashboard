import React, { useState, useEffect } from 'react';
import { fetcher } from '../../lib/api-client';

const PerformancePage = () => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await fetcher('/api/admin/performance');
            setStats(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="container" style={{ marginTop: '20px' }}>Loading...</div>;

    return (
        <div className="container">
            <h1 style={{ marginBottom: '20px' }}>Performance Dashboard</h1>
            
            <div className="card">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ background: '#f9f9f9', borderBottom: '2px solid #eee' }}>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Endpoint ID</th>
                            <th style={{ padding: '12px', textAlign: 'right' }}>Calls</th>
                            <th style={{ padding: '12px', textAlign: 'right' }}>Avg Duration (ms)</th>
                            <th style={{ padding: '12px', textAlign: 'right' }}>Max Duration (ms)</th>
                            <th style={{ padding: '12px', textAlign: 'right' }}>Errors</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.map((s, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '12px' }}>{s.endpointId}</td>
                                <td style={{ padding: '12px', textAlign: 'right' }}>{s.callCount}</td>
                                <td style={{ padding: '12px', textAlign: 'right' }}>
                                    <span style={{ 
                                        color: s.avgDuration > 1000 ? 'red' : 'inherit',
                                        fontWeight: s.avgDuration > 1000 ? 'bold' : 'normal'
                                    }}>
                                        {Math.round(s.avgDuration)}
                                    </span>
                                </td>
                                <td style={{ padding: '12px', textAlign: 'right' }}>{s.maxDuration}</td>
                                <td style={{ padding: '12px', textAlign: 'right' }}>
                                    {s.errorCount > 0 ? (
                                        <span style={{ color: 'red', fontWeight: 'bold' }}>{s.errorCount}</span>
                                    ) : (
                                        <span style={{ color: '#ccc' }}>0</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {stats.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                                    No performance data available yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PerformancePage;
