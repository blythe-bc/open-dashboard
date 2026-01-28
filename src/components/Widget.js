import React, { useState, useEffect } from 'react';
import { fetcher, postData } from '../lib/api-client';

const Widget = ({ widget, workspaceId }) => {
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
                    params: {}, // MVP: empty params for now
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
        }
    }, [widget.endpointId, widget.id, workspaceId]);

    if (loading) return <div>Loading widget {widget.name}...</div>;
    if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
    if (!data) return <div>No data</div>;

    return (
        <div style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
            <h3>{widget.name}</h3>
            {widget.type === 'CHART' ? (
                <div>
                    <p>(Chart View: {JSON.parse(widget.config).chartType})</p>
                    <ul>
                        {data.rows.map((row, i) => (
                            <li key={i}>{row[0]}: {row[1]}</li>
                        ))}
                    </ul>
                </div>
            ) : (
                <table>
                    <thead>
                        <tr>
                            {data.columns.map(col => <th key={col.name}>{col.name}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {data.rows.map((row, i) => (
                            <tr key={i}>
                                {row.map((cell, j) => <td key={j}>{cell}</td>)}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Widget;
