import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetcher, postData } from '../../lib/api-client';
import AdminLayout from '../../components/AdminLayout';

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

    if (loading) return <AdminLayout title="Datasets">Loading...</AdminLayout>;

    return (
        <AdminLayout title="Datasets">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                <div className="card">
                    <h3 style={{ marginTop: 0, fontSize: '18px' }}>Create Dataset</h3>
                    <form onSubmit={handleCreate}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--accents-5)' }}>Dataset Name</label>
                            <input 
                                className="input"
                                value={name} 
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Sales Data"
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--accents-5)' }}>Allowed Params (comma sep)</label>
                            <input 
                                className="input"
                                value={allowedParams} 
                                onChange={(e) => setAllowedParams(e.target.value)}
                                placeholder="e.g. region,dateFrom,dateTo"
                            />
                        </div>
                        <button className="btn" type="submit" style={{ width: '100%' }}>Create Dataset</button>
                    </form>
                </div>

                <div>
                    <h3 style={{ marginTop: 0, fontSize: '18px', marginBottom: '16px' }}>Existing Datasets</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {datasets.map(ds => (
                            <div key={ds.id} className="card" style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{ds.name}</h4>
                                        <div style={{ fontSize: '12px', color: 'var(--accents-4)', fontFamily: 'monospace' }}>{ds.id}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                         <span style={{ fontSize: '12px', color: 'var(--accents-5)' }}>
                                            {ds.allowedParams ? ds.allowedParams.split(',').length : 0} Filters
                                         </span>
                                    </div>
                                </div>
                                
                                <div style={{ fontSize: '14px', color: 'var(--accents-5)', marginBottom: '16px', background: 'var(--accents-1)', padding: '8px 12px', borderRadius: '4px' }}>
                                    <span style={{ fontWeight: 500 }}>Allowed Params: </span>
                                    {ds.allowedParams || 'None'}
                                </div>
                                
                                <div>
                                    <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px', color: 'var(--accents-6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Metrics & Endpoints</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {ds.metrics && ds.metrics.map(m => (
                                            <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                                                <span style={{ fontSize: '14px', fontWeight: 500 }}>{m.name}</span>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                     {/* In a real app we would link to a specific filtered view of params */}
                                                    <Link href="/admin/param-map-editor" className="btn secondary" style={{ height: '24px', fontSize: '12px', padding: '0 8px', textDecoration: 'none' }}>
                                                        Map Params
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                        {(!ds.metrics || ds.metrics.length === 0) && <span style={{ color: 'var(--accents-4)', fontSize: '13px', fontStyle: 'italic' }}>No metrics defined</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {datasets.length === 0 && <div style={{ color: 'var(--accents-4)', padding: '20px', textAlign: 'center' }}>No datasets found.</div>}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default DatasetsPage;
