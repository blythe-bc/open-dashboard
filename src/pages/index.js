import React from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';

const HomePage = () => {
    const sections = [
        {
            title: "Administration",
            description: "Manage system configuration, security, and data sources.",
            links: [
                { href: "/admin/workspaces", label: "Workspaces & Policies" },
                { href: "/admin/role-bindings", label: "Role Bindings" },
                { href: "/admin/datasets", label: "Datasets & Metrics" },
                { href: "/admin/endpoints", label: "Endpoints" },
                { href: "/admin/param-map-editor", label: "Parameter Maps" },
                { href: "/admin/dashboards", label: "Dashboard Management" },
                { href: "/admin/performance", label: "System Performance" },
            ]
        },
        {
            title: "Dashboards",
            description: "View and create business intelligence dashboards.",
            links: [
                { href: "/dash/dash_sample", label: "Sample Dashboard (Viewer)" },
                { href: "/builder/dash_sample", label: "Sample Dashboard (Builder)" },
            ]
        }
    ];

    const actions = (
        <span style={{ fontSize: '12px', color: 'var(--accents-5)', alignSelf: 'center' }}>v0.1.0-beta</span>
    );

    return (
        <Layout title="Home" actions={actions}>
            <div className="container" style={{ paddingTop: '40px', overflowY: 'auto', flex: 1 }}>
                <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2.5rem', letterSpacing: '-0.04em', marginBottom: '10px' }}>Welcome Back</h1>
                    <p style={{ fontSize: '1.1rem', color: 'var(--accents-5)' }}>Select a module to get started.</p>
                </div>

                <div className="grid-layout">
                    {sections.map((section, idx) => (
                        <div key={idx} className="card">
                            <h3 style={{ marginBottom: '8px' }}>{section.title}</h3>
                            <p style={{ fontSize: '13px', marginBottom: '20px' }}>{section.description}</p>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {section.links.map(link => (
                                    <li key={link.href} style={{ marginBottom: '8px' }}>
                                        <Link href={link.href} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--geist-foreground)', fontSize: '14px' }}>
                                            <span style={{ color: 'var(--accents-4)' }}>→</span>
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export default HomePage;
