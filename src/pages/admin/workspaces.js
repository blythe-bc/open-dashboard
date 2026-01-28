import React, { useState, useEffect } from 'react';
import { fetcher, postData } from '../../lib/api-client';

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
        <div style={{ padding: '20px', display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
                <h1>Workspaces & Policies</h1>
                
                <form onSubmit={handleCreate} style={{ marginBottom: '20px' }}>
                    <input 
                        type="text" 
                        value={newName} 
                        onChange={(e) => setNewName(e.target.value)} 
                        placeholder="Workspace Name"
                    />
                    <button type="submit">Create Workspace</button>
                </form>

                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {workspaces.map(ws => (
                        <li 
                            key={ws.id} 
                            onClick={() => loadPolicy(ws)}
                            style={{ 
                                padding: '10px', 
                                border: '1px solid #ccc',
                                marginBottom: '5px',
                                cursor: 'pointer',
                                background: selectedWs?.id === ws.id ? '#eef' : 'white'
                            }}
                        >
                            {ws.name}
                        </li>
                    ))}
                </ul>
            </div>

            {selectedWs && policy && (
                <div style={{ flex: 1, borderLeft: '1px solid #ddd', paddingLeft: '20px' }}>
                    <h2>Policy: {selectedWs.name}</h2>
                    <form onSubmit={handlePolicyUpdate}>
                        <div style={{ marginBottom: '10px' }}>
                            <label>
                                <input 
                                    type="checkbox" 
                                    checked={!!policy.expertOverride} 
                                    onChange={(e) => setPolicy({...policy, expertOverride: e.target.checked})}
                                /> Expert Override
                            </label>
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label>
                                <input 
                                    type="checkbox" 
                                    checked={!!policy.allowPublishByBuilder} 
                                    onChange={(e) => setPolicy({...policy, allowPublishByBuilder: e.target.checked})}
                                /> Allow Publish by Builder
                            </label>
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label>
                                <input 
                                    type="checkbox" 
                                    checked={!!policy.llmEnabled} 
                                    onChange={(e) => setPolicy({...policy, llmEnabled: e.target.checked ? 1 : 0})}
                                /> Enable LLM Features
                            </label>
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label style={{ display: 'block' }}>Max Chart Points</label>
                            <input 
                                type="number" 
                                value={policy.maxChartPoints} 
                                onChange={(e) => setPolicy({...policy, maxChartPoints: parseInt(e.target.value) || 0})}
                            />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label style={{ display: 'block' }}>Max Grid Client Rows</label>
                            <input 
                                type="number" 
                                value={policy.maxGridClientRows} 
                                onChange={(e) => setPolicy({...policy, maxGridClientRows: parseInt(e.target.value) || 0})}
                            />
                        </div>
                        <button type="submit">Save Policy</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default WorkspacesPage;