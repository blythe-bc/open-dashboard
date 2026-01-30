import React, { useState, useEffect } from 'react';
import { fetcher, postData } from '../../lib/api-client';
import AdminLayout from '../../components/AdminLayout';

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

    if (loading) return <AdminLayout title="Role Bindings">Loading...</AdminLayout>;

    return (
        <AdminLayout title="Role Bindings">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                <div className="card">
                    <h3 style={{ marginTop: 0, fontSize: '18px' }}>Add New Binding</h3>
                    <form onSubmit={handleCreate}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--accents-5)' }}>Workspace</label>
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
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--accents-5)' }}>AD Group / User</label>
                            <input 
                                className="input"
                                placeholder="e.g. DOMAIN\group"
                                value={adGroup}
                                onChange={(e) => setAdGroup(e.target.value)}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--accents-5)' }}>Role</label>
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
                        <button className="btn" type="submit" style={{ width: '100%' }}>Add Binding</button>
                    </form>
                </div>

                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
                        <h3 style={{ margin: 0, fontSize: '18px' }}>Existing Bindings</h3>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ background: 'var(--accents-1)', borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: 'var(--accents-5)', letterSpacing: '0.05em' }}>Workspace</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: 'var(--accents-5)', letterSpacing: '0.05em' }}>AD Group</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: 'var(--accents-5)', letterSpacing: '0.05em' }}>Role</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: 'var(--accents-5)', letterSpacing: '0.05em' }}>Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bindings.map(b => (
                                <tr key={b.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '12px 16px' }}>
                                        {workspaces.find(w => w.id === b.workspaceId)?.name || b.workspaceId}
                                    </td>
                                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{b.adGroup}</td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <span style={{ 
                                            padding: '2px 8px', 
                                            borderRadius: '12px', 
                                            background: 'var(--accents-2)',
                                            color: 'var(--geist-foreground)',
                                            fontSize: '12px',
                                            fontWeight: 500
                                        }}>
                                            {b.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 16px', color: 'var(--accents-4)' }}>
                                        {new Date(b.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            {bindings.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: 'var(--accents-4)' }}>No bindings found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default RoleBindingsPage;
