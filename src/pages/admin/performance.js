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

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h1>Performance Dashboard</h1>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#eee', textAlign: 'left' }}>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Endpoint ID</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Calls</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Avg Duration (ms)</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Max Duration (ms)</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Errors</th>
                    </tr>
                </thead>
                <tbody>
                    {stats.map((s, i) => (
                        <tr key={i}>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{s.endpointId}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{s.callCount}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{Math.round(s.avgDuration)}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{s.maxDuration}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{s.errorCount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PerformancePage;
