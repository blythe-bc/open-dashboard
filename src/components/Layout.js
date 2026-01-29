import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Layout = ({ children, title, actions }) => {
    const router = useRouter();
    const showBackButton = router.pathname !== '/';

    return (
        <div style={{ display: 'flex', height: '100vh', flexDirection: 'column', background: 'var(--accents-1)' }}>
            <header className="layout-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {showBackButton && (
                        <button 
                            className="btn secondary" 
                            onClick={() => router.back()}
                            style={{ padding: '0 8px', height: '32px' }}
                            title="Go Back"
                        >
                            ←
                        </button>
                    )}
                    <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ fontWeight: 700, fontSize: '18px', letterSpacing: '-0.02em' }}>Gemini BI</div>
                    </Link>
                    {title && (
                        <>
                            <span style={{ color: 'var(--accents-3)' }}>/</span>
                            <div style={{ fontWeight: 600, fontSize: '16px' }}>{title}</div>
                        </>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {actions}
                </div>
            </header>
            
            <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
