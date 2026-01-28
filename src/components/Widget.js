import React, { useState, useEffect } from 'react';
import { postData } from '../lib/api-client';

const Widget = ({ widget, workspaceId, filters }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const result = await postData('/api/query/execute', {
                    workspaceId,
                    endpointId: widget.endpointId,
                    params: filters || {},
                    context: { widgetId: widget.id }
                });
                setData(result);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (widget.endpointId) {
            loadData();
        } else {
            setLoading(false);
        }
    }, [widget.endpointId, widget.id, workspaceId, filters]);

    const handleExportCSV = () => {
        if (!data || !data.rows || data.rows.length === 0) return;

        const header = data.columns.map(c => c.name).join(',');
        const rows = data.rows.map(row => row.join(',')).join('\n');
        const csvContent = `data:text/csv;charset=utf-8,${header}\n${rows}`;
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${widget.name || 'export'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
    if (!data && widget.endpointId) return <div>No data</div>;
    if (!widget.endpointId) return <div>Select an endpoint</div>;

    const chartType = JSON.parse(widget.config || '{}').chartType || 'bar';

    const renderChart = () => {
        switch (chartType) {
            case 'kpi':
                // Assume first row, second column is value
                const value = data.rows[0] ? data.rows[0][1] : 'N/A';
                return (
                    <div style={{ fontSize: '2em', textAlign: 'center', padding: '20px' }}>
                        {value}
                    </div>
                );
            case 'bar':
            case 'line':
            case 'area':
            case 'pie':
            case 'scatter':
            case 'heatmap':
            default:
                return (
                    <div>
                        <p><strong>{chartType.toUpperCase()} Chart</strong></p>
                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                             <ul>
                                {data.rows.map((row, i) => (
                                    <li key={i}>{row[0]}: {row[1]}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="widget-container" style={{ border: '1px solid #ccc', margin: '10px', padding: '10px', height: '100%', overflow: 'hidden', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: '0 0 10px 0' }}>{widget.name}</h3>
                {widget.type === 'GRID' && (
                    <button onClick={handleExportCSV} style={{ fontSize: '0.8em' }}>Export CSV</button>
                )}
            </div>
            
            {widget.type === 'CHART' ? renderChart() : (
                <div style={{ overflow: 'auto', maxHeight: '200px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#eee' }}>
                                {data.columns.map(col => <th key={col.name} style={{ border: '1px solid #ddd', padding: '4px' }}>{col.name}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {data.rows.map((row, i) => (
                                <tr key={i}>
                                    {row.map((cell, j) => <td key={j} style={{ border: '1px solid #ddd', padding: '4px' }}>{cell}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Widget;