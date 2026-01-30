import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { fetcher, postData } from '../../lib/api-client';
import useUndoRedo from '../../lib/useUndoRedo';
import { DASHBOARD_THEMES } from '../../lib/themes';
import Layout from '../../components/Layout';
import Widget from '../../components/Widget';

const ResponsiveGridLayout = dynamic(() => import('../../components/ResponsiveGridLayout'), { ssr: false });

const BuilderPage = () => {
    const router = useRouter();
    const { dashboardId } = router.query;

    const [dashboard, setDashboard] = useState(null);
    const [policies, setPolicies] = useState(null);
    const [selectedWidgetId, setSelectedWidgetId] = useState(null);
    const [activeTab, setActiveTab] = useState('data'); // 'data' | 'visual'
    const [loading, setLoading] = useState(true);

    const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'error'

    // Use Undo/Redo hook for version state
    const [version, setVersion, undo, redo, canUndo, canRedo, resetVersion] = useUndoRedo(null);

    useEffect(() => {
        if (!dashboardId) return;
        loadData();
    }, [dashboardId]);

    // Auto-save effect
    useEffect(() => {
        if (!version) return;
        setSaveStatus('unsaved');
        const timer = setTimeout(() => {
            handleSave(true);
        }, 2000);
        return () => clearTimeout(timer);
    }, [version]);

    const loadData = async () => {
        try {
            const [dashData, policyData] = await Promise.all([
                fetcher(`/api/builder/${dashboardId}`),
                fetcher('/api/me/policies')
            ]);
            setDashboard(dashData.meta);
            
            // Ensure settings exist in version
            const versionData = dashData.version || {};
            if (!versionData.settings) {
                versionData.settings = { theme: 'default' };
            }
            
            resetVersion(versionData);
            setPolicies(policyData);
            setSaveStatus('saved');
        } catch (error) {
            console.error('Failed to load builder data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLayoutChange = (layout) => {
        if (!version) return;
        
        // Basic check to prevent unnecessary updates
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
            config: { 
                chartType: 'bar',
                datasetId: '',
                metricId: '',
                filters: {},
                grouping: [],
                gridColumns: []
            }
        };
        // Find first available spot is handled by RGL usually, but we set explicit 0,0
        const newItem = { i: id, x: 0, y: Infinity, w: 4, h: 4 };

        setVersion({
            ...version,
            widgets: { ...version.widgets, [id]: newWidget },
            layout: [...version.layout, newItem]
        });
        setSelectedWidgetId(id);
    };

    const handleSave = async (silent = false) => {
        setSaveStatus('saving');
        try {
            await fetch(`/api/builder/${dashboardId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    layout: version.layout,
                    widgets: version.widgets,
                    globalFilters: version.globalFilters,
                    settings: version.settings
                })
            });
            setSaveStatus('saved');
            if (!silent) alert('Saved successfully');
        } catch (err) {
            setSaveStatus('error');
            if (!silent) alert('Save failed');
        }
    };

    const handlePublish = async () => {
        try {
            await handleSave(true); // Save first silently
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
    };

    const handleDeleteWidget = () => {
        if (!selectedWidgetId) return;
        if (!window.confirm('Are you sure you want to delete this widget?')) return;

        const newWidgets = { ...version.widgets };
        delete newWidgets[selectedWidgetId];

        const newLayout = version.layout.filter(item => item.i !== selectedWidgetId);

        setVersion({
            ...version,
            widgets: newWidgets,
            layout: newLayout
        });
        setSelectedWidgetId(null);
    };

    const getCatalog = () => {
        if (!policies || !policies.workspaces || policies.workspaces.length === 0) return null;
        return policies.workspaces[0].catalog;
    };

    if (loading) return <div style={{ padding: '20px', color: 'var(--accents-5)' }}>Loading Builder...</div>;
    if (!dashboard || !version) return <div style={{ padding: '20px' }}>Dashboard not found</div>;

    const selectedWidget = version.widgets[selectedWidgetId];
    const catalog = getCatalog();

    // Helper to get available metrics based on selected dataset
    const availableMetrics = catalog && selectedWidget?.config?.datasetId
        ? catalog.metrics.filter(m => m.datasetId === selectedWidget.config.datasetId)
        : (catalog?.metrics || []);

    // Helper to get selected dataset object
    const selectedDataset = catalog && selectedWidget?.config?.datasetId
        ? catalog.datasets.find(d => d.datasetId === selectedWidget.config.datasetId)
        : null;

    const headerTitle = (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>{dashboard.name}</span>
            <span style={{ fontSize: '12px', padding: '2px 8px', background: 'var(--accents-2)', borderRadius: '12px', color: 'var(--accents-5)' }}>
                v{version.version} • {version.status}
            </span>
            <span style={{ 
                fontSize: '12px', 
                color: saveStatus === 'error' ? 'var(--geist-error)' : 'var(--accents-4)',
                marginLeft: '8px'
            }}>
                {saveStatus === 'saving' ? 'Saving...' : (saveStatus === 'saved' ? 'Saved' : 'Unsaved changes')}
            </span>
        </div>
    );

    const headerActions = (
        <>
            <button className="btn secondary" onClick={undo} disabled={!canUndo}>Undo</button>
            <button className="btn secondary" onClick={redo} disabled={!canRedo}>Redo</button>
            <div style={{ width: '8px' }}></div>
            <button className="btn" onClick={handleAddWidget}>+ Add Widget</button>
            <button className="btn secondary" onClick={() => handleSave(false)}>Save Draft</button>
            <button className="btn" style={{ background: 'var(--geist-success)', borderColor: 'var(--geist-success)', color: 'white' }} onClick={handlePublish}>Publish</button>
            <a className="btn secondary" href={`/dash/${dashboardId}`} target="_blank" style={{ textDecoration: 'none' }}>View Live</a>
        </>
    );

    return (
        <Layout title={headerTitle} actions={headerActions}>
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <div style={{ flex: 1, overflow: 'auto', padding: '20px', background: 'var(--accents-1)' }}>
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
                                 const isSelected = selectedWidgetId === item.i;
                                 return (
                                    <div key={item.i} onClick={() => setSelectedWidgetId(item.i)} 
                                        style={{ 
                                            background: 'var(--geist-background)', 
                                            border: `1px solid ${isSelected ? 'var(--geist-success)' : 'var(--border-color)'}`, 
                                            boxShadow: isSelected ? '0 0 0 2px rgba(0, 112, 243, 0.2)' : 'none',
                                            borderRadius: 'var(--radius)', 
                                            padding: '12px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                                        }}>
                                        <div className="drag-handle" style={{ 
                                            cursor: 'move', 
                                            background: 'var(--accents-2)', 
                                            height: '4px', 
                                            width: '24px', 
                                            borderRadius: '2px', 
                                            alignSelf: 'center', 
                                            marginBottom: '8px' 
                                        }}></div>
                                        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                                             {w ? (
                                                 <Widget 
                                                    widget={w}
                                                    workspaceId={dashboard?.workspaceId}
                                                    theme={version.settings?.theme || 'default'}
                                                 />
                                             ) : (
                                                 <div style={{ color: 'var(--accents-4)', fontSize: '12px' }}>Unknown Widget</div>
                                             )}
                                        </div>
                                    </div>
                                 );
                            })}
                        </ResponsiveGridLayout>
                    )}
                </div>

                <div style={{ width: '320px', borderLeft: '1px solid var(--border-color)', background: 'var(--geist-background)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
                        <div 
                            style={{ 
                                flex: 1, padding: '12px', textAlign: 'center', fontSize: '13px', cursor: 'pointer', fontWeight: 500,
                                borderBottom: activeTab === 'data' ? '2px solid var(--geist-foreground)' : 'none',
                                color: activeTab === 'data' ? 'var(--geist-foreground)' : 'var(--accents-4)'
                            }}
                            onClick={() => setActiveTab('data')}
                        >
                            Data
                        </div>
                        <div 
                            style={{ 
                                flex: 1, padding: '12px', textAlign: 'center', fontSize: '13px', cursor: 'pointer', fontWeight: 500,
                                borderBottom: activeTab === 'visual' ? '2px solid var(--geist-foreground)' : 'none',
                                color: activeTab === 'visual' ? 'var(--geist-foreground)' : 'var(--accents-4)'
                            }}
                            onClick={() => setActiveTab('visual')}
                        >
                            Visual
                        </div>
                        <div 
                            style={{ 
                                flex: 1, padding: '12px', textAlign: 'center', fontSize: '13px', cursor: 'pointer', fontWeight: 500,
                                borderBottom: activeTab === 'dash' ? '2px solid var(--geist-foreground)' : 'none',
                                color: activeTab === 'dash' ? 'var(--geist-foreground)' : 'var(--accents-4)'
                            }}
                            onClick={() => setActiveTab('dash')}
                        >
                            Dash
                        </div>
                    </div>
                    
                    <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                        {selectedWidget ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                
                                {activeTab === 'data' && (
                                    <>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', color: 'var(--accents-5)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Source</label>
                                            
                                            <div style={{ marginBottom: '12px' }}>
                                                <div style={{ fontSize: '13px', marginBottom: '4px' }}>Dataset</div>
                                                <select 
                                                    className="select"
                                                    value={selectedWidget.config.datasetId || ''} 
                                                    onChange={(e) => {
                                                        const newDatasetId = e.target.value;
                                                        // Perform atomic update to avoid state race conditions
                                                        setVersion({
                                                            ...version,
                                                            widgets: {
                                                                ...version.widgets,
                                                                [selectedWidgetId]: {
                                                                    ...version.widgets[selectedWidgetId],
                                                                    endpointId: '', // Reset endpoint
                                                                    config: {
                                                                        ...version.widgets[selectedWidgetId].config,
                                                                        datasetId: newDatasetId,
                                                                        metricId: '' // Reset metric
                                                                    }
                                                                }
                                                            }
                                                        });
                                                    }}
                                                >
                                                    <option value="">Select Dataset...</option>
                                                    {catalog && catalog.datasets.map(ds => (
                                                        <option key={ds.datasetId} value={ds.datasetId}>{ds.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div style={{ marginBottom: '12px' }}>
                                                <div style={{ fontSize: '13px', marginBottom: '4px' }}>Metric</div>
                                                <select 
                                                    className="select"
                                                    value={selectedWidget.config.metricId || ''} 
                                                    onChange={(e) => {
                                                        const metricId = e.target.value;
                                                        const metric = catalog.metrics.find(m => m.metricId === metricId);
                                                        
                                                        setVersion({
                                                            ...version,
                                                            widgets: {
                                                                ...version.widgets,
                                                                [selectedWidgetId]: {
                                                                    ...version.widgets[selectedWidgetId],
                                                                    endpointId: (metric && metric.endpointId) ? metric.endpointId : '',
                                                                    config: {
                                                                        ...version.widgets[selectedWidgetId].config,
                                                                        metricId: metricId
                                                                    }
                                                                }
                                                            }
                                                        });
                                                    }}
                                                    disabled={!selectedWidget.config.datasetId}
                                                >
                                                    <option value="">Select Metric...</option>
                                                    {availableMetrics.map(m => (
                                                        <option key={m.metricId} value={m.metricId}>{m.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', color: 'var(--accents-5)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Query Parameters</label>
                                            
                                            {selectedDataset && selectedDataset.allowedParams.length > 0 ? (
                                                selectedDataset.allowedParams.map(param => (
                                                    <div key={param} style={{ marginBottom: '12px' }}>
                                                        <div style={{ fontSize: '13px', marginBottom: '4px' }}>Filter: {param}</div>
                                                        <input 
                                                            className="input"
                                                            placeholder="Value..."
                                                            value={selectedWidget.config.filters?.[param] || ''}
                                                            onChange={(e) => {
                                                                const newFilters = { ...selectedWidget.config.filters, [param]: e.target.value };
                                                                if (!e.target.value) delete newFilters[param];
                                                                handleWidgetConfigUpdate('filters', newFilters);
                                                            }}
                                                        />
                                                    </div>
                                                ))
                                            ) : (
                                                <div style={{ fontSize: '13px', color: 'var(--accents-4)', fontStyle: 'italic' }}>
                                                    No filters available for this dataset.
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', color: 'var(--accents-5)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Grouping</label>
                                            <div style={{ fontSize: '13px', marginBottom: '4px' }}>Group By (comma separated)</div>
                                            <input 
                                                className="input"
                                                placeholder="e.g. region, date"
                                                value={selectedWidget.config.grouping ? selectedWidget.config.grouping.join(', ') : ''}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    const arr = val ? val.split(',').map(s => s.trim()) : [];
                                                    handleWidgetConfigUpdate('grouping', arr);
                                                }}
                                            />
                                        </div>
                                    </>
                                )}

                                {activeTab === 'visual' && (
                                    <>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', color: 'var(--accents-5)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>General</label>
                                            <div style={{ marginBottom: '12px' }}>
                                                <div style={{ fontSize: '13px', marginBottom: '4px' }}>Name</div>
                                                <input 
                                                    className="input"
                                                    value={selectedWidget.name} 
                                                    onChange={(e) => handleWidgetUpdate('name', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '13px', marginBottom: '4px' }}>Widget Type</div>
                                                <select 
                                                    className="select"
                                                    value={selectedWidget.type} 
                                                    onChange={(e) => handleWidgetUpdate('type', e.target.value)}
                                                >
                                                    <option value="CHART">Chart</option>
                                                    <option value="GRID">Grid</option>
                                                </select>
                                            </div>
                                        </div>

                                        {selectedWidget.type === 'CHART' && (
                                            <div>
                                                <label style={{ display: 'block', fontSize: '12px', color: 'var(--accents-5)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Chart Settings</label>
                                                <div>
                                                    <div style={{ fontSize: '13px', marginBottom: '4px' }}>Chart Type</div>
                                                    <select
                                                        className="select"
                                                        value={selectedWidget.config.chartType || 'bar'}
                                                        onChange={(e) => handleWidgetConfigUpdate('chartType', e.target.value)}
                                                    >
                                                        <option value="bar">Bar Chart</option>
                                                        <option value="line">Line Chart</option>
                                                        <option value="pie">Pie Chart</option>
                                                        <option value="area">Area Chart</option>
                                                        <option value="scatter">Scatter Plot</option>
                                                        <option value="heatmap">Heatmap</option>
                                                        <option value="kpi">KPI Card</option>
                                                    </select>
                                                </div>
                                                
                                                {(selectedWidget.config.chartType === 'bar' || selectedWidget.config.chartType === 'area') && (
                                                    <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center' }}>
                                                        <input 
                                                            type="checkbox"
                                                            id="stacked-check"
                                                            checked={selectedWidget.config.stacked || false}
                                                            onChange={(e) => handleWidgetConfigUpdate('stacked', e.target.checked)}
                                                            style={{ marginRight: '8px' }}
                                                        />
                                                        <label htmlFor="stacked-check" style={{ fontSize: '13px' }}>Stacked</label>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {selectedWidget.type === 'GRID' && (
                                            <div>
                                                <label style={{ display: 'block', fontSize: '12px', color: 'var(--accents-5)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Grid Settings</label>
                                                <div>
                                                    <div style={{ fontSize: '13px', marginBottom: '4px' }}>Columns (comma separated)</div>
                                                    <input 
                                                        className="input"
                                                        placeholder="e.g. name, value, date"
                                                        value={selectedWidget.config.gridColumns ? selectedWidget.config.gridColumns.join(', ') : ''}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            const arr = val ? val.split(',').map(s => s.trim()) : [];
                                                            handleWidgetConfigUpdate('gridColumns', arr);
                                                        }}
                                                    />
                                                    <div style={{ fontSize: '11px', color: 'var(--accents-4)', marginTop: '4px' }}>Leave empty to auto-detect</div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                                
                                {activeTab === 'dash' && (
                                    <>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', color: 'var(--accents-5)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dashboard Settings</label>
                                            
                                            <div style={{ marginBottom: '12px' }}>
                                                <div style={{ fontSize: '13px', marginBottom: '4px' }}>Color Theme</div>
                                                <select 
                                                    className="select"
                                                    value={version.settings?.theme || 'default'} 
                                                    onChange={(e) => {
                                                        setVersion({
                                                            ...version,
                                                            settings: {
                                                                ...version.settings,
                                                                theme: e.target.value
                                                            }
                                                        });
                                                    }}
                                                >
                                                    {Object.keys(DASHBOARD_THEMES).map(key => (
                                                        <option key={key} value={key}>{DASHBOARD_THEMES[key].name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            
                                            <div style={{ padding: '12px', background: 'var(--accents-1)', borderRadius: '4px' }}>
                                                <div style={{ display: 'flex', gap: '4px', height: '20px' }}>
                                                    {DASHBOARD_THEMES[version.settings?.theme || 'default'].colors.map(c => (
                                                        <div key={c} style={{ flex: 1, background: c, borderRadius: '2px' }}></div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div style={{ paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
                                    <button 
                                        className="btn danger" 
                                        style={{ width: '100%' }}
                                        onClick={handleDeleteWidget}
                                    >
                                        Delete Widget
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--accents-4)', textAlign: 'center' }}>
                                <div style={{ fontSize: '24px', marginBottom: '8px' }}>👆</div>
                                <div style={{ fontSize: '13px' }}>Select a widget on the canvas to edit its properties.</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default BuilderPage;