import React, { useState, useEffect } from 'react';
import { fetcher, postData } from '../../lib/api-client';

const WorkspacesPage = () => {
    const [workspaces, setWorkspaces] = useState([]);
    const [newName, setNewName] = useState('');

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

    return (
        <div style={{ padding: '20px' }}>
            <h1>Workspaces & Policies</h1>
            
            <form onSubmit={handleCreate}>
                <input 
                    type="text" 
                    value={newName} 
                    onChange={(e) => setNewName(e.target.value)} 
                    placeholder="Workspace Name"
                />
                <button type="submit">Create Workspace</button>
            </form>

            <ul style={{ marginTop: '20px' }}>
                {workspaces.map(ws => (
                    <li key={ws.id}>
                        {ws.name} (ID: {ws.id})
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default WorkspacesPage;