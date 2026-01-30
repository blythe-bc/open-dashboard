import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const AdminLayout = ({ children, title }) => {
    const router = useRouter();

    const menuItems = [
        { label: 'Dashboards', path: '/admin/dashboards' },
        { label: 'Workspaces', path: '/admin/workspaces' },
        { label: 'Datasets', path: '/admin/datasets' },
        { label: 'Parameter Maps', path: '/admin/param-map-editor' },
        { label: 'Endpoints', path: '/admin/endpoints' },
        { label: 'Role Bindings', path: '/admin/role-bindings' },
        { label: 'Performance', path: '/admin/performance' },
    ];

    return (
        <div style={{ display: 'flex', height: '100vh', flexDirection: 'column', background: 'var(--accents-1)' }}>
            <header className="layout-header" style={{ background: 'var(--geist-foreground)', color: 'var(--geist-background)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ fontWeight: 700, fontSize: '18px', letterSpacing: '-0.02em' }}>Gemini BI Admin</div>
                    </Link>
                    <span style={{ color: 'var(--accents-5)' }}>/</span>
                    <div style={{ fontWeight: 600, fontSize: '16px' }}>{title}</div>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                     <Link href="/" style={{ color: 'var(--accents-2)', textDecoration: 'none', fontSize: '14px' }}>
                        Exit Admin
                    </Link>
                </div>
            </header>
            
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <aside style={{ width: '240px', background: 'var(--geist-background)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
                    <nav style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {menuItems.map(item => {
                            const isActive = router.pathname === item.path;
                            return (
                                <Link 
                                    key={item.path} 
                                    href={item.path}
                                    style={{
                                        display: 'block',
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        textDecoration: 'none',
                                        fontSize: '14px',
                                        color: isActive ? 'var(--geist-foreground)' : 'var(--accents-5)',
                                        background: isActive ? 'var(--accents-2)' : 'transparent',
                                        fontWeight: isActive ? 500 : 400
                                    }}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                <main style={{ flex: 1, overflow: 'auto', padding: '32px', background: 'var(--accents-1)' }}>
                    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
