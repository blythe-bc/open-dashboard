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

    const renderChart = () => {
        if (loading) return <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--accents-4)', fontSize: '13px' }}>Loading...</div>;
        if (error) return <div style={{ padding: '20px', color: 'var(--geist-error)', fontSize: '13px' }}>Error: {error}</div>;
        if (!data && widget.endpointId) return <div style={{ padding: '20px', color: 'var(--accents-4)', fontSize: '13px' }}>No data</div>;
        if (!widget.endpointId) return <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--accents-4)', fontSize: '13px' }}>Select an endpoint</div>;

        const config = typeof widget.config === 'string' ? JSON.parse(widget.config || '{}') : (widget.config || {});
        const chartType = config.chartType || 'bar';

        switch (chartType) {
            case 'kpi':
                // Assume first row, second column is value
                const value = data.rows[0] ? data.rows[0][1] : 'N/A';
                return (
                    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                        <div style={{ fontSize: '3.5rem', fontWeight: 700, letterSpacing: '-0.05em', color: 'var(--geist-foreground)' }}>
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </div>
                        {data.columns[1] && <div style={{ color: 'var(--accents-5)', fontSize: '13px', marginTop: '5px' }}>{data.columns[1].name}</div>}
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
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ marginBottom: '10px', fontSize: '10px', color: 'var(--accents-5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{chartType} View</div>
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                             <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                                {data.rows.map((row, i) => (
                                    <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--accents-2)', fontSize: '13px' }}>
                                        <span style={{ color: 'var(--accents-6)' }}>{row[0]}</span>
                                        <span style={{ fontWeight: 500, color: 'var(--geist-foreground)' }}>{row[1]}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                );
        }
    };

    const renderGrid = () => {
        if (loading) return <div style={{ padding: '20px', color: 'var(--accents-4)', fontSize: '13px' }}>Loading...</div>;
        if (!data) return <div style={{ padding: '20px', color: 'var(--accents-4)', fontSize: '13px' }}>No data</div>;
        
        const config = typeof widget.config === 'string' ? JSON.parse(widget.config || '{}') : (widget.config || {});
        let displayColumns = data.columns;
        let displayIndices = data.columns.map((_, i) => i);

        // Filter columns if configured
        if (config.gridColumns && config.gridColumns.length > 0) {
            const requestedCols = config.gridColumns.map(c => c.toLowerCase());
            const filtered = data.columns.reduce((acc, col, index) => {
                if (requestedCols.includes(col.name.toLowerCase())) {
                    acc.cols.push(col);
                    acc.indices.push(index);
                }
                return acc;
            }, { cols: [], indices: [] });

            if (filtered.cols.length > 0) {
                displayColumns = filtered.cols;
                displayIndices = filtered.indices;
            }
        }

        return (
            <div style={{ overflow: 'auto', maxHeight: '100%', width: '100%' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead style={{ position: 'sticky', top: 0, background: 'var(--geist-background)', boxShadow: '0 1px 0 var(--accents-2)' }}>
                        <tr>
                            {displayColumns.map(col => (
                                <th key={col.name} style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--accents-5)', fontWeight: 500, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {col.name}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.rows.map((row, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid var(--accents-2)' }}>
                                {displayIndices.map((colIndex, j) => (
                                    <td key={j} style={{ padding: '8px 12px', color: 'var(--geist-foreground)' }}>{row[colIndex]}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="widget-container">
            <div className="widget-header">
                <span>{widget.name}</span>
                {widget.type === 'GRID' && (
                    <button onClick={handleExportCSV} className="btn secondary" style={{ height: '24px', fontSize: '12px', padding: '0 8px' }}>Export</button>
                )}
            </div>
            
            <div className="widget-body">
                {widget.type === 'CHART' ? renderChart() : renderGrid()}
            </div>
        </div>
    );
};

export default Widget;
