import React, { useState, useEffect } from 'react';
import { fetcher, postData } from '../../lib/api-client';
import AdminLayout from '../../components/AdminLayout';

const WorkspacesPage = () => {
    const [workspaces, setWorkspaces] = useState([]);
    const [newName, setNewName] = useState('');
    const [selectedWs, setSelectedWs] = useState(null);
    const [policy, setPolicy] = useState(null);

    useEffect(() => {
        loadWorkspaces();
    }, []);

    const loadWorkspaces = async () => {
        try {
            const data = await fetcher('/api/admin/workspaces');
            setWorkspaces(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newName) return;
        await postData('/api/admin/workspaces', { name: newName });
        setNewName('');
        loadWorkspaces();
    };

    const loadPolicy = async (ws) => {
        setSelectedWs(ws);
        try {
            const data = await fetcher(`/api/admin/workspaces/${ws.id}/policy`);
            setPolicy(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handlePolicyUpdate = async (e) => {
        e.preventDefault();
        try {
            await fetch(`/api/admin/workspaces/${selectedWs.id}/policy`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(policy)
            });
            alert('Policy updated');
        } catch (err) {
            alert('Update failed');
        }
    };

    return (
        <AdminLayout title="Workspaces & Policies">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                <div className="card">
                    <h3 style={{ fontSize: '16px', marginBottom: '16px', marginTop: 0 }}>Workspaces</h3>
                    <form onSubmit={handleCreate} style={{ marginBottom: '20px', display: 'flex', gap: '8px' }}>
                        <input 
                            className="input"
                            type="text" 
                            value={newName} 
                            onChange={(e) => setNewName(e.target.value)} 
                            placeholder="New Workspace Name"
                        />
                        <button className="btn" type="submit" style={{ background: 'var(--geist-foreground)', color: 'var(--geist-background)' }}>Add</button>
                    </form>

                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {workspaces.map(ws => (
                            <li 
                                key={ws.id} 
                                onClick={() => loadPolicy(ws)}
                                style={{ 
                                    padding: '12px', 
                                    borderBottom: '1px solid var(--border-color)',
                                    cursor: 'pointer',
                                    background: selectedWs?.id === ws.id ? 'var(--accents-1)' : 'transparent',
                                    color: selectedWs?.id === ws.id ? 'var(--geist-foreground)' : 'var(--accents-5)',
                                    fontWeight: selectedWs?.id === ws.id ? 500 : 400,
                                    borderRadius: 'var(--radius)',
                                    marginBottom: '4px',
                                    transition: 'background 0.15s ease'
                                }}
                            >
                                {ws.name}
                            </li>
                        ))}
                    </ul>
                </div>

                {selectedWs && policy ? (
                    <div className="card">
                        <div style={{ paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                            <h3 style={{ fontSize: '16px', margin: 0 }}>Policy: {selectedWs.name}</h3>
                        </div>
                        <form onSubmit={handlePolicyUpdate}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={!!policy.expertOverride} 
                                        onChange={(e) => setPolicy({...policy, expertOverride: e.target.checked})}
                                        style={{ accentColor: 'var(--geist-success)' }}
                                    /> 
                                    <span style={{ fontSize: '14px' }}>Expert Override</span>
                                </label>
                                <p style={{ fontSize: '12px', color: 'var(--accents-4)', marginLeft: '24px', marginTop: '4px' }}>Allow advanced users to bypass standard query restrictions.</p>
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={!!policy.allowPublishByBuilder} 
                                        onChange={(e) => setPolicy({...policy, allowPublishByBuilder: e.target.checked})}
                                        style={{ accentColor: 'var(--geist-success)' }}
                                    /> 
                                    <span style={{ fontSize: '14px' }}>Allow Publish by Builder</span>
                                </label>
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={!!policy.llmEnabled} 
                                        onChange={(e) => setPolicy({...policy, llmEnabled: e.target.checked ? 1 : 0})}
                                        style={{ accentColor: 'var(--geist-success)' }}
                                    /> 
                                    <span style={{ fontSize: '14px' }}>Enable LLM Features</span>
                                </label>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--accents-5)' }}>Max Chart Points</label>
                                    <input 
                                        className="input"
                                        type="number" 
                                        value={policy.maxChartPoints} 
                                        onChange={(e) => setPolicy({...policy, maxChartPoints: parseInt(e.target.value) || 0})}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--accents-5)' }}>Max Grid Client Rows</label>
                                    <input 
                                        className="input"
                                        type="number" 
                                        value={policy.maxGridClientRows} 
                                        onChange={(e) => setPolicy({...policy, maxGridClientRows: parseInt(e.target.value) || 0})}
                                    />
                                </div>
                            </div>
                            
                            <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-color)', textAlign: 'right' }}>
                                <button className="btn" type="submit" style={{ background: 'var(--geist-foreground)', color: 'var(--geist-background)' }}>Save Changes</button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accents-4)', fontStyle: 'italic' }}>
                        Select a workspace to manage its policy.
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default WorkspacesPage;