import React, { useState, useEffect } from 'react';
import { postData } from '../lib/api-client';
import { getThemeColors } from '../lib/themes';
import { 
    BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, 
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter 
} from 'recharts';

const Widget = ({ widget, workspaceId, filters, theme = 'default' }) => {
    const COLORS = getThemeColors(theme);
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

    const prepareChartData = () => {
        if (!data || !data.rows) return [];
        
        return data.rows.map(row => {
            const obj = {};
            data.columns.forEach((col, index) => {
                obj[col.name] = row[index];
            });
            return obj;
        });
    };

    const renderChart = () => {
        if (loading) return <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--accents-4)', fontSize: '13px' }}>Loading...</div>;
        if (error) return <div style={{ padding: '20px', color: 'var(--geist-error)', fontSize: '13px' }}>Error: {error}</div>;
        if (!data && widget.endpointId) return <div style={{ padding: '20px', color: 'var(--accents-4)', fontSize: '13px' }}>No data</div>;
        if (!widget.endpointId) return <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--accents-4)', fontSize: '13px' }}>Select an endpoint</div>;

        const config = typeof widget.config === 'string' ? JSON.parse(widget.config || '{}') : (widget.config || {});
        const chartType = config.chartType || 'bar';

        if (chartType === 'kpi') {
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
        }

        const chartData = prepareChartData();
        // Assume first column is X-axis (category), others are data series
        const categoryKey = data.columns[0].name;
        const dataKeys = data.columns.slice(1).map(c => c.name);

        const renderChartContent = () => {
            switch (chartType) {
                case 'bar':
                    return (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--accents-2)" />
                                <XAxis dataKey={categoryKey} tick={{fontSize: 12, fill: 'var(--accents-5)'}} />
                                <YAxis tick={{fontSize: 12, fill: 'var(--accents-5)'}} />
                                <Tooltip 
                                    contentStyle={{backgroundColor: 'var(--geist-background)', borderColor: 'var(--accents-2)', borderRadius: '4px'}}
                                    itemStyle={{color: 'var(--geist-foreground)'}}
                                />
                                <Legend />
                                {dataKeys.map((key, i) => (
                                    <Bar 
                                        key={key} 
                                        dataKey={key} 
                                        stackId={config.stacked ? 'a' : undefined}
                                        fill={COLORS[i % COLORS.length]} 
                                        radius={config.stacked ? [0, 0, 0, 0] : [4, 4, 0, 0]} 
                                    />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    );
                case 'line':
                    return (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--accents-2)" />
                                <XAxis dataKey={categoryKey} tick={{fontSize: 12, fill: 'var(--accents-5)'}} />
                                <YAxis tick={{fontSize: 12, fill: 'var(--accents-5)'}} />
                                <Tooltip 
                                    contentStyle={{backgroundColor: 'var(--geist-background)', borderColor: 'var(--accents-2)', borderRadius: '4px'}}
                                    itemStyle={{color: 'var(--geist-foreground)'}}
                                />
                                <Legend />
                                {dataKeys.map((key, i) => (
                                    <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{r: 4}} activeDot={{r: 6}} />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    );
                case 'area':
                    return (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--accents-2)" />
                                <XAxis dataKey={categoryKey} tick={{fontSize: 12, fill: 'var(--accents-5)'}} />
                                <YAxis tick={{fontSize: 12, fill: 'var(--accents-5)'}} />
                                <Tooltip 
                                    contentStyle={{backgroundColor: 'var(--geist-background)', borderColor: 'var(--accents-2)', borderRadius: '4px'}}
                                    itemStyle={{color: 'var(--geist-foreground)'}}
                                />
                                <Legend />
                                {dataKeys.map((key, i) => (
                                    <Area 
                                        key={key} 
                                        type="monotone" 
                                        dataKey={key} 
                                        stackId={config.stacked ? '1' : undefined}
                                        stroke={COLORS[i % COLORS.length]} 
                                        fill={COLORS[i % COLORS.length]} 
                                        fillOpacity={0.3} 
                                    />
                                ))}
                            </AreaChart>
                        </ResponsiveContainer>
                    );
                case 'pie':
                    return (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    dataKey={dataKeys[0]} 
                                    nameKey={categoryKey}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    label
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{backgroundColor: 'var(--geist-background)', borderColor: 'var(--accents-2)', borderRadius: '4px'}}
                                    itemStyle={{color: 'var(--geist-foreground)'}}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    );
                case 'scatter':
                    return (
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--accents-2)" />
                                <XAxis type="category" dataKey={categoryKey} tick={{fontSize: 12, fill: 'var(--accents-5)'}} name={categoryKey} />
                                <YAxis type="number" dataKey={dataKeys[0]} tick={{fontSize: 12, fill: 'var(--accents-5)'}} name={dataKeys[0]} />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} 
                                    contentStyle={{backgroundColor: 'var(--geist-background)', borderColor: 'var(--accents-2)', borderRadius: '4px'}}
                                    itemStyle={{color: 'var(--geist-foreground)'}}
                                />
                                <Legend />
                                <Scatter name={dataKeys[0]} data={chartData} fill={COLORS[0]} />
                            </ScatterChart>
                        </ResponsiveContainer>
                    );
                case 'heatmap':
                default:
                    // Fallback to simple list view for unsupported or default
                    return (
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
                    );
            }
        };

        return (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '10px', fontSize: '10px', color: 'var(--accents-5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{chartType} View</div>
                <div style={{ flex: 1, minHeight: 0 }}>
                    {renderChartContent()}
                </div>
            </div>
        );
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