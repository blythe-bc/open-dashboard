import React, { useState, useEffect } from 'react';
import { fetcher, postData } from '../../lib/api-client';
import AdminLayout from '../../components/AdminLayout';

const ParamMapEditorPage = () => {
    const [maps, setMaps] = useState([]);
    const [endpoints, setEndpoints] = useState([]);
    const [loading, setLoading] = useState(true);

    const [endpointId, setEndpointId] = useState('');
    const [paramName, setParamName] = useState('');
    const [spParam, setSpParam] = useState('@');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [mData, eData] = await Promise.all([
                fetcher('/api/admin/param-maps'),
                fetcher('/api/admin/endpoints')
            ]);
            setMaps(mData);
            setEndpoints(eData);
            if (eData.length > 0) setEndpointId(eData[0].id);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await postData('/api/admin/param-maps', {
                endpointId,
                paramName,
                spParam
            });
            setParamName('');
            setSpParam('@');
            loadData();
        } catch (err) {
            alert('Failed to add mapping');
        }
    };

    if (loading) return <AdminLayout title="Parameter Maps">Loading...</AdminLayout>;

    return (
        <AdminLayout title="Parameter Maps">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                <div className="card">
                    <h3 style={{ marginTop: 0, fontSize: '18px' }}>Add Parameter Map</h3>
                    <form onSubmit={handleCreate}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--accents-5)' }}>Endpoint</label>
                            <select 
                                className="select"
                                value={endpointId} 
                                onChange={(e) => setEndpointId(e.target.value)}
                            >
                                {endpoints.map(ep => (
                                    <option key={ep.id} value={ep.id}>{ep.name}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--accents-5)' }}>Client Param Name</label>
                            <input 
                                className="input"
                                placeholder="e.g. region"
                                value={paramName} 
                                onChange={(e) => setParamName(e.target.value)}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--accents-5)' }}>SP Parameter</label>
                            <input 
                                className="input"
                                placeholder="e.g. @region_code"
                                value={spParam} 
                                onChange={(e) => setSpParam(e.target.value)}
                                required
                            />
                        </div>
                        <button className="btn" type="submit" style={{ width: '100%' }}>Add Mapping</button>
                    </form>
                </div>

                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
                         <h3 style={{ margin: 0, fontSize: '18px' }}>Existing Mappings</h3>
                    </div>
                    
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ background: 'var(--accents-1)', borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: 'var(--accents-5)', letterSpacing: '0.05em' }}>Endpoint</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: 'var(--accents-5)', letterSpacing: '0.05em' }}>Client Param</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: 'var(--accents-5)', letterSpacing: '0.05em' }}>SP Param</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: 'var(--accents-5)', letterSpacing: '0.05em' }}>Transform</th>
                            </tr>
                        </thead>
                        <tbody>
                            {maps.map(m => (
                                <tr key={m.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '12px 16px', color: 'var(--accents-6)' }}>
                                        {endpoints.find(e => e.id === m.endpointId)?.name || m.endpointId}
                                    </td>
                                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{m.paramName}</td>
                                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: 'var(--geist-success)' }}>{m.spParam}</td>
                                    <td style={{ padding: '12px 16px', color: 'var(--accents-4)' }}>{m.transform || '-'}</td>
                                </tr>
                            ))}
                            {maps.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: 'var(--accents-4)' }}>No mappings found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ParamMapEditorPage;
