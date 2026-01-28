import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { fetcher, postData } from '../../lib/api-client';
import useUndoRedo from '../../lib/useUndoRedo';
import crypto from 'crypto';

// Dynamic import or require to handle CJS module in Next.js
let ResponsiveGridLayout;

try {
    const RGL = require('react-grid-layout');
    const Responsive = RGL.Responsive;
    const WidthProvider = RGL.WidthProvider;
    ResponsiveGridLayout = WidthProvider(Responsive);
} catch (e) {
    console.error("Failed to load react-grid-layout", e);
}

const BuilderPage = () => {
    const router = useRouter();
    const { dashboardId } = router.query;

    const [dashboard, setDashboard] = useState(null);
    const [policies, setPolicies] = useState(null);
    const [selectedWidgetId, setSelectedWidgetId] = useState(null);
    const [loading, setLoading] = useState(true);

    // Use Undo/Redo hook for version state
    const [version, setVersion, undo, redo, canUndo, canRedo, resetVersion] = useUndoRedo(null);

    useEffect(() => {
        if (!dashboardId) return;
        loadData();
    }, [dashboardId]);

    const loadData = async () => {
        try {
            const [dashData, policyData] = await Promise.all([
                fetcher(`/api/builder/${dashboardId}`),
                fetcher('/api/me/policies')
            ]);
            setDashboard(dashData.meta);
            resetVersion(dashData.version);
            setPolicies(policyData);
        } catch (error) {
            console.error('Failed to load builder data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLayoutChange = (layout) => {
        if (!version) return;
        
        // Basic check to prevent unnecessary updates if layout hasn't logically changed
        // This is a naive check; RGL sometimes reshuffles.
        if (JSON.stringify(version.layout) === JSON.stringify(layout)) return;

        setVersion({
            ...version,
            layout: layout
        });
    };

    const handleAddWidget = () => {
        const id = `w_${Math.random().toString(36).substr(2, 9)}`;
        const newWidget = {
            id,
            type: 'CHART',
            name: 'New Widget',
            endpointId: '',
            config: { chartType: 'bar' }
        };
        const newItem = { i: id, x: 0, y: 0, w: 4, h: 4 };

        setVersion({
            ...version,
            widgets: { ...version.widgets, [id]: newWidget },
            layout: [...version.layout, newItem]
        });
    };

    const handleSave = async () => {
        try {
            await fetch(`/api/builder/${dashboardId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    layout: version.layout,
                    widgets: version.widgets,
                    globalFilters: version.globalFilters
                })
            });
            alert('Saved successfully');
        } catch (err) {
            alert('Save failed');
        }
    };

    const handlePublish = async () => {
        try {
            await handleSave(); // Save first
            await postData(`/api/builder/${dashboardId}/publish`, {});
            alert('Published successfully');
            loadData(); // Reload to see updated versions
        } catch (err) {
            alert('Publish failed: ' + err.message);
        }
    };

    const handleWidgetUpdate = (key, value) => {
        if (!selectedWidgetId) return;
        setVersion({
            ...version,
            widgets: {
                ...version.widgets,
                [selectedWidgetId]: {
                    ...version.widgets[selectedWidgetId],
                    [key]: value
                }
            }
        });
    };
    
    const handleWidgetConfigUpdate = (key, value) => {
        if (!selectedWidgetId) return;
         setVersion({
            ...version,
            widgets: {
                ...version.widgets,
                [selectedWidgetId]: {
                    ...version.widgets[selectedWidgetId],
                    config: {
                        ...version.widgets[selectedWidgetId].config,
                         [key]: value
                    }
                }
            }
        });
    }

    if (loading) return <div>Loading Builder...</div>;
    if (!dashboard || !version) return <div>Dashboard not found</div>;

    const selectedWidget = version.widgets[selectedWidgetId];

    return (
        <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
            <header style={{ padding: '10px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <strong>{dashboard.name}</strong> (v{version.version} - {version.status})
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={undo} disabled={!canUndo}>Undo</button>
                    <button onClick={redo} disabled={!canRedo}>Redo</button>
                    <div style={{ width: '20px' }}></div>
                    <button onClick={handleAddWidget}>+ Add Widget</button>
                    <button onClick={handleSave}>Save Draft</button>
                    <button onClick={handlePublish}>Publish</button>
                    <a href={`/dash/${dashboardId}`} target="_blank">View Published</a>
                </div>
            </header>
            
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <div style={{ flex: 1, overflow: 'auto', padding: '10px', background: '#f5f5f5' }}>
                    {ResponsiveGridLayout && (
                        <ResponsiveGridLayout
                            className="layout"
                            layouts={{ lg: version.layout }}
                            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                            rowHeight={30}
                            onLayoutChange={(layout) => handleLayoutChange(layout)}
                        >
                            {version.layout.map(item => {
                                 const w = version.widgets[item.i];
                                 return (
                                    <div key={item.i} onClick={() => setSelectedWidgetId(item.i)} style={{ background: 'white', border: selectedWidgetId === item.i ? '2px solid blue' : '1px solid #ccc', padding: '5px' }}>
                                        <div className="drag-handle" style={{ cursor: 'move', background: '#eee', padding: '2px' }}>::</div>
                                        {w ? w.name : 'Unknown Widget'}
                                        <br/>
                                        <small>{w ? w.type : ''}</small>
                                    </div>
                                 );
                            })}
                        </ResponsiveGridLayout>
                    )}
                </div>

                <div style={{ width: '300px', borderLeft: '1px solid #ddd', padding: '10px', overflow: 'auto', background: 'white' }}>
                    <h3>Inspector</h3>
                    {selectedWidget ? (
                        <div>
                            <h4>Basic</h4>
                            <label style={{display: 'block'}}>Name</label>
                            <input 
                                value={selectedWidget.name} 
                                onChange={(e) => handleWidgetUpdate('name', e.target.value)}
                                style={{ width: '100%', marginBottom: '10px' }}
                            />
                            
                            <label style={{display: 'block'}}>Type</label>
                            <select 
                                value={selectedWidget.type} 
                                onChange={(e) => handleWidgetUpdate('type', e.target.value)}
                                style={{ width: '100%', marginBottom: '10px' }}
                            >
                                <option value="CHART">Chart</option>
                                <option value="GRID">Grid</option>
                            </select>

                            <h4>Data</h4>
                            <label style={{display: 'block'}}>Endpoint</label>
                            <select
                                value={selectedWidget.endpointId || ''}
                                onChange={(e) => handleWidgetUpdate('endpointId', e.target.value)}
                                style={{ width: '100%', marginBottom: '10px' }}
                            >
                                <option value="">-- Select Endpoint --</option>
                                {policies && policies.workspaces[0].catalog.endpoints.map(ep => (
                                    <option key={ep.endpointId} value={ep.endpointId}>
                                        {ep.name}
                                    </option>
                                ))}
                            </select>

                            {selectedWidget.type === 'CHART' && (
                                <>
                                    <h4>Visual</h4>
                                    <label style={{display: 'block'}}>Chart Type</label>
                                    <select
                                        value={selectedWidget.config.chartType || 'bar'}
                                        onChange={(e) => handleWidgetConfigUpdate('chartType', e.target.value)}
                                        style={{ width: '100%', marginBottom: '10px' }}
                                    >
                                        <option value="bar">Bar</option>
                                        <option value="line">Line</option>
                                        <option value="pie">Pie</option>
                                        <option value="area">Area</option>
                                        <option value="scatter">Scatter</option>
                                        <option value="heatmap">Heatmap</option>
                                        <option value="kpi">KPI Card</option>
                                    </select>
                                </>
                            )}
                        </div>
                    ) : (
                        <p>Select a widget to edit properties.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BuilderPage;
