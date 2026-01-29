import React, { useState, useEffect } from 'react';
import { fetcher, postData } from '../../lib/api-client';

const RoleBindingsPage = () => {
    const [bindings, setBindings] = useState([]);
    const [workspaces, setWorkspaces] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Form State
    const [wsId, setWsId] = useState('');
    const [adGroup, setAdGroup] = useState('');
    const [role, setRole] = useState('Viewer');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [bData, wData] = await Promise.all([
                fetcher('/api/admin/role-bindings'),
                fetcher('/api/admin/workspaces')
            ]);
            setBindings(bData);
            setWorkspaces(wData);
            if (wData.length > 0) setWsId(wData[0].id);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await postData('/api/admin/role-bindings', {
                workspaceId: wsId,
                adGroup,
                role
            });
            setAdGroup('');
            loadData();
        } catch (err) {
            alert('Failed to create binding');
        }
    };

    if (loading) return <div className="container" style={{ marginTop: '20px' }}>Loading...</div>;

    return (
        <div className="container">
            <h1 style={{ marginBottom: '20px' }}>Role Bindings</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                <div className="card">
                    <h3 style={{ marginTop: 0 }}>Add New Binding</h3>
                    <form onSubmit={handleCreate}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Workspace</label>
                            <select 
                                className="select"
                                value={wsId} 
                                onChange={(e) => setWsId(e.target.value)}
                            >
                                {workspaces.map(ws => (
                                    <option key={ws.id} value={ws.id}>{ws.name}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>AD Group / User</label>
                            <input 
                                className="input"
                                placeholder="e.g. DOMAIN\group"
                                value={adGroup}
                                onChange={(e) => setAdGroup(e.target.value)}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Role</label>
                            <select 
                                className="select"
                                value={role} 
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <option value="Viewer">Viewer</option>
                                <option value="Editor">Editor</option>
                                <option value="PlatformAdmin">PlatformAdmin</option>
                            </select>
                        </div>
                        <button className="btn" type="submit">Add Binding</button>
                    </form>
                </div>

                <div className="card">
                    <h3 style={{ marginTop: 0 }}>Existing Bindings</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ background: '#f9f9f9', borderBottom: '2px solid #eee' }}>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Workspace</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>AD Group</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Role</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bindings.map(b => (
                                <tr key={b.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px' }}>
                                        {workspaces.find(w => w.id === b.workspaceId)?.name || b.workspaceId}
                                    </td>
                                    <td style={{ padding: '10px' }}>{b.adGroup}</td>
                                    <td style={{ padding: '10px' }}>
                                        <span style={{ 
                                            padding: '2px 6px', 
                                            borderRadius: '4px', 
                                            background: '#eef',
                                            color: 'var(--primary-color)',
                                            fontSize: '12px'
                                        }}>
                                            {b.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px', color: '#888' }}>
                                        {new Date(b.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RoleBindingsPage;
