import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { fetcher, postData } from '../../lib/api-client';
import Widget from '../../components/Widget';
import Layout from '../../components/Layout';

const ResponsiveGridLayout = dynamic(() => import('../../components/ResponsiveGridLayout'), { ssr: false });

const DashboardViewer = () => {
    const router = useRouter();
    const { dashboardId, ...queryParams } = router.query;
    
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Filters state synced with URL
    const [filters, setFilters] = useState({});
    
    // Saved Views state
    const [savedViews, setSavedViews] = useState([]);
    const [newViewName, setNewViewName] = useState('');

    // LLM State
    const [llmResult, setLlmResult] = useState('');
    const [llmLoading, setLlmLoading] = useState(false);

    useEffect(() => {
        if (!dashboardId) return;

        const loadDashboard = async () => {
            try {
                const data = await fetcher(`/api/dash/${dashboardId}`);
                setDashboard(data);
                
                // Initialize filters from URL
                const initialFilters = { ...queryParams };
                setFilters(initialFilters);

                loadSavedViews();
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, [dashboardId]);

    const loadSavedViews = async () => {
        try {
            const views = await fetcher(`/api/dash/${dashboardId}/views`);
            setSavedViews(views);
        } catch (err) {
            console.error(err);
        }
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        if (!value) delete newFilters[key];
        
        setFilters(newFilters);
        
        router.replace({
            pathname: router.pathname,
            query: { dashboardId, ...newFilters }
        }, undefined, { shallow: true });
    };

    const handleSaveView = async () => {
        if (!newViewName) return;
        try {
            await postData(`/api/dash/${dashboardId}/views`, {
                name: newViewName,
                filters: filters
            });
            setNewViewName('');
            loadSavedViews();
            alert('View saved');
        } catch (err) {
            alert('Failed to save view');
        }
    };

    const handleLoadView = (view) => {
        const viewFilters = JSON.parse(view.filters || '{}');
        setFilters(viewFilters);
        
        router.replace({
            pathname: router.pathname,
            query: { dashboardId, ...viewFilters }
        }, undefined, { shallow: true });
    };

    const handleAskAI = async () => {
        setLlmLoading(true);
        setLlmResult('');
        try {
            const context = {
                widgets: dashboard.widgets.map(w => ({ name: w.name, type: w.type })),
                filters
            };

            const data = await postData('/api/llm/generate', {
                dashboardId,
                context,
                prompt: "Summarize this dashboard"
            });
            setLlmResult(data.result);
        } catch (err) {
            setLlmResult('Error generating insight: ' + err.message);
        } finally {
            setLlmLoading(false);
        }
    };

    if (loading) return <Layout title="Loading...">Loading dashboard...</Layout>;
    if (error) return <Layout title="Error">Error: {error}</Layout>;
    if (!dashboard) return <Layout title="Not Found">Dashboard not found</Layout>;

    const headerActions = (
        <button className="btn" onClick={handleAskAI} disabled={llmLoading} style={{ background: 'linear-gradient(90deg, #7928CA, #FF0080)', color: 'white', border: 'none' }}>
            {llmLoading ? 'Thinking...' : '✨ Ask AI'}
        </button>
    );

    return (
        <Layout title={dashboard.name} actions={headerActions}>
            <div className="container" style={{ paddingTop: '24px', flex: 1, overflowY: 'auto' }}>
                {llmResult && (
                    <div className="card" style={{ marginBottom: '24px', background: 'var(--geist-background)', border: '1px solid var(--accents-2)' }}>
                        <h4 style={{ margin: '0 0 10px 0' }}>AI Insight</h4>
                        <p style={{ whiteSpace: 'pre-wrap', margin: 0, fontSize: '14px', lineHeight: '1.6' }}>{llmResult}</p>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', marginBottom: '24px' }}>
                    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap' }}>Global Filters:</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ fontSize: '13px', color: 'var(--accents-5)' }}>Region</label>
                            <select 
                                className="select"
                                style={{ width: '150px' }}
                                value={filters['region'] || ''} 
                                onChange={(e) => handleFilterChange('region', e.target.value)}
                            >
                                <option value="">All Regions</option>
                                <option value="US">US</option>
                                <option value="KR">KR</option>
                            </select>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                            <input 
                                className="input"
                                placeholder="Save current view..." 
                                value={newViewName} 
                                onChange={(e) => setNewViewName(e.target.value)}
                            />
                            <button className="btn secondary" onClick={handleSaveView}>Save</button>
                        </div>
                        {savedViews.length > 0 && (
                            <div>
                                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--accents-5)', marginBottom: '8px', letterSpacing: '0.05em' }}>Saved Views</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {savedViews.map(view => (
                                        <button key={view.id} className="btn secondary" style={{ height: '24px', fontSize: '12px', padding: '0 8px' }} onClick={() => handleLoadView(view)}>
                                            {view.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ paddingBottom: '40px' }}>
                    <ResponsiveGridLayout
                        className="layout"
                        layouts={{ lg: dashboard.layout || [] }}
                        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                        rowHeight={30}
                        isDraggable={false}
                        isResizable={false}
                    >
                        {dashboard.layout && dashboard.layout.map(item => {
                             const widget = dashboard.widgets.find(w => w.id === item.i);
                             if (!widget) return null;
                             
                             return (
                                <div key={item.i} style={{ 
                                    background: 'var(--geist-background)', 
                                    border: '1px solid var(--border-color)', 
                                    borderRadius: 'var(--radius)', 
                                    padding: '12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflow: 'hidden'
                                }}>
                                     <Widget 
                                        widget={widget} 
                                        workspaceId={dashboard.workspaceId} 
                                        filters={filters}
                                        theme={dashboard.settings?.theme || 'default'}
                                     />
                                </div>
                             );
                        })}
                    </ResponsiveGridLayout>
                </div>
            </div>
        </Layout>
    );
};

export default DashboardViewer;