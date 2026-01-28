import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { fetcher, postData } from '../../lib/api-client';
import Widget from '../../components/Widget';

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
                // Exclude next.js specific params
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
        
        // Update URL shallowly
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
            // Context: Send widget list and current filters
            // In a real app, we might send summarized data points or schema
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

    if (loading) return <div>Loading dashboard...</div>;
    if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
    if (!dashboard) return <div>Dashboard not found</div>;

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>{dashboard.name}</h1>
                
                <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ border: '1px solid #ddd', padding: '10px', background: '#f9f9f9' }}>
                        <strong>Saved Views</strong>
                        <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                            <input 
                                placeholder="New view name" 
                                value={newViewName} 
                                onChange={(e) => setNewViewName(e.target.value)}
                            />
                            <button onClick={handleSaveView}>Save</button>
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {savedViews.map(view => (
                                <li key={view.id} style={{ cursor: 'pointer', color: 'blue' }} onClick={() => handleLoadView(view)}>
                                    {view.name}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div style={{ padding: '10px', background: '#eef' }}>
                        <button onClick={handleAskAI} disabled={llmLoading}>
                            {llmLoading ? 'Thinking...' : '✨ Ask AI'}
                        </button>
                        {llmResult && (
                            <div style={{ marginTop: '10px', padding: '10px', background: 'white', border: '1px solid #ccc', maxWidth: '300px' }}>
                                <strong>AI Insight:</strong>
                                <p style={{ whiteSpace: 'pre-wrap' }}>{llmResult}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mock Global Filter UI */}
            <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #eee' }}>
                <strong>Global Filters (Test): </strong>
                <label style={{ marginLeft: '10px' }}>Region: </label>
                <select 
                    value={filters['region'] || ''} 
                    onChange={(e) => handleFilterChange('region', e.target.value)}
                >
                    <option value="">All</option>
                    <option value="US">US</option>
                    <option value="KR">KR</option>
                </select>
                
                <span style={{ marginLeft: '20px', color: '#666' }}>
                    Current Filters: {JSON.stringify(filters)}
                </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {dashboard.widgets.map(widget => (
                    <Widget 
                        key={widget.id} 
                        widget={widget} 
                        workspaceId={dashboard.workspaceId} 
                        filters={filters}
                    />
                ))}
            </div>
        </div>
    );
};

export default DashboardViewer;
