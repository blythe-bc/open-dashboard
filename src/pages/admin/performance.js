import React, { useState, useEffect } from 'react';
import { fetcher } from '../../lib/api-client';
import AdminLayout from '../../components/AdminLayout';

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

    if (loading) return <AdminLayout title="System Performance">Loading...</AdminLayout>;

    return (
        <AdminLayout title="System Performance">
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
                    <h3 style={{ margin: 0, fontSize: '18px' }}>Endpoint Stats</h3>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ background: 'var(--accents-1)', borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: 'var(--accents-5)', letterSpacing: '0.05em' }}>Endpoint ID</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', textTransform: 'uppercase', color: 'var(--accents-5)', letterSpacing: '0.05em' }}>Calls</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', textTransform: 'uppercase', color: 'var(--accents-5)', letterSpacing: '0.05em' }}>Avg (ms)</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', textTransform: 'uppercase', color: 'var(--accents-5)', letterSpacing: '0.05em' }}>Max (ms)</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', textTransform: 'uppercase', color: 'var(--accents-5)', letterSpacing: '0.05em' }}>Errors</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.map((s, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: 'var(--accents-6)' }}>{s.endpointId}</td>
                                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 500 }}>{s.callCount}</td>
                                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                    <span style={{ 
                                        color: s.avgDuration > 1000 ? 'var(--geist-error)' : 'inherit',
                                        fontWeight: s.avgDuration > 1000 ? 600 : 400
                                    }}>
                                        {Math.round(s.avgDuration)}
                                    </span>
                                </td>
                                <td style={{ padding: '12px 16px', textAlign: 'right' }}>{s.maxDuration}</td>
                                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                    {s.errorCount > 0 ? (
                                        <span style={{ color: 'var(--geist-error)', fontWeight: 600 }}>{s.errorCount}</span>
                                    ) : (
                                        <span style={{ color: 'var(--accents-3)' }}>0</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {stats.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--accents-4)' }}>
                                    No performance data available yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
};

export default PerformancePage;
