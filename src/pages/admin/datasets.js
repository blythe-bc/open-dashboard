import React, { useState, useEffect } from 'react';
import { fetcher, postData } from '../../lib/api-client';

const DatasetsPage = () => {
    const [datasets, setDatasets] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [name, setName] = useState('');
    const [allowedParams, setAllowedParams] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await fetcher('/api/admin/datasets');
            setDatasets(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await postData('/api/admin/datasets', {
                name,
                allowedParams
            });
            setName('');
            setAllowedParams('');
            loadData();
        } catch (err) {
            alert('Failed to create dataset');
        }
    };

    if (loading) return <div className="container" style={{ marginTop: '20px' }}>Loading...</div>;

    return (
        <div className="container">
            <h1 style={{ marginBottom: '20px' }}>Datasets & Metrics</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                <div className="card">
                    <h3 style={{ marginTop: 0 }}>Create Dataset</h3>
                    <form onSubmit={handleCreate}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Dataset Name</label>
                            <input 
                                className="input"
                                value={name} 
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Sales Data"
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Allowed Params (comma sep)</label>
                            <input 
                                className="input"
                                value={allowedParams} 
                                onChange={(e) => setAllowedParams(e.target.value)}
                                placeholder="e.g. region,dateFrom,dateTo"
                            />
                        </div>
                        <button className="btn" type="submit">Create Dataset</button>
                    </form>
                </div>

                <div className="card">
                    <h3 style={{ marginTop: 0 }}>Existing Datasets</h3>
                    {datasets.map(ds => (
                        <div key={ds.id} style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h4 style={{ margin: '0 0 5px 0' }}>{ds.name}</h4>
                                <small style={{ color: '#888' }}>ID: {ds.id}</small>
                            </div>
                            <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                                Allowed Params: {ds.allowedParams || 'None'}
                            </div>
                            
                            <div style={{ background: '#f9f9f9', padding: '10px', borderRadius: '4px' }}>
                                <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>Metrics ({ds.metrics ? ds.metrics.length : 0})</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                    {ds.metrics && ds.metrics.map(m => (
                                        <span key={m.id} style={{ border: '1px solid #ddd', padding: '2px 6px', borderRadius: '4px', background: 'white', fontSize: '12px' }}>
                                            {m.name}
                                        </span>
                                    ))}
                                    {(!ds.metrics || ds.metrics.length === 0) && <span style={{ color: '#999', fontSize: '12px' }}>No metrics defined</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                    {datasets.length === 0 && <p>No datasets found.</p>}
                </div>
            </div>
        </div>
    );
};

export default DatasetsPage;
