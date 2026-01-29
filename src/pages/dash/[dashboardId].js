import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { fetcher, postData } from '../../lib/api-client';
import Widget from '../../components/Widget';
import { Responsive as ResponsiveGridLayout, WidthProvider } from 'react-grid-layout';

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

    if (loading) return <div className="container" style={{ marginTop: '20px', color: 'var(--accents-5)' }}>Loading dashboard...</div>;
    if (error) return <div className="container" style={{ marginTop: '20px', color: 'var(--geist-error)' }}>Error: {error}</div>;
    if (!dashboard) return <div className="container" style={{ marginTop: '20px' }}>Dashboard not found</div>;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--accents-1)' }}>
            <nav className="layout-header">
                <h1 style={{ margin: 0, fontSize: '1.25rem' }}>{dashboard.name}</h1>
                
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                     <button className="btn" onClick={handleAskAI} disabled={llmLoading} style={{ background: 'linear-gradient(90deg, #7928CA, #FF0080)', color: 'white', border: 'none' }}>
                        {llmLoading ? 'Thinking...' : '✨ Ask AI'}
                    </button>
                </div>
            </nav>

            <div className="container" style={{ paddingTop: '24px' }}>
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

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px', paddingBottom: '40px' }}>
                    {dashboard.widgets.map(widget => (
                        <div key={widget.id} style={{ height: '320px' }}>
                            <Widget 
                                widget={widget} 
                                workspaceId={dashboard.workspaceId} 
                                filters={filters}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardViewer;