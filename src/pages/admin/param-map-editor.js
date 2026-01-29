import React, { useState, useEffect } from 'react';
import { fetcher, postData } from '../../lib/api-client';

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

    if (loading) return <div className="container" style={{ marginTop: '20px' }}>Loading...</div>;

    return (
        <div className="container">
            <h1 style={{ marginBottom: '20px' }}>Parameter Map Editor</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                <div className="card">
                    <h3 style={{ marginTop: 0 }}>Add Parameter Map</h3>
                    <form onSubmit={handleCreate}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Endpoint</label>
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
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Client Param Name</label>
                            <input 
                                className="input"
                                placeholder="e.g. region"
                                value={paramName} 
                                onChange={(e) => setParamName(e.target.value)}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>SP Parameter</label>
                            <input 
                                className="input"
                                placeholder="e.g. @region_code"
                                value={spParam} 
                                onChange={(e) => setSpParam(e.target.value)}
                                required
                            />
                        </div>
                        <button className="btn" type="submit">Add Mapping</button>
                    </form>
                </div>

                <div className="card">
                    <h3 style={{ marginTop: 0 }}>Existing Mappings</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ background: '#f9f9f9', borderBottom: '2px solid #eee' }}>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Endpoint</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Client Param</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>SP Param</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Transform</th>
                            </tr>
                        </thead>
                        <tbody>
                            {maps.map(m => (
                                <tr key={m.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px' }}>
                                        {endpoints.find(e => e.id === m.endpointId)?.name || m.endpointId}
                                    </td>
                                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{m.paramName}</td>
                                    <td style={{ padding: '10px', fontFamily: 'monospace', color: 'var(--primary-color)' }}>{m.spParam}</td>
                                    <td style={{ padding: '10px', color: '#888' }}>{m.transform || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ParamMapEditorPage;
