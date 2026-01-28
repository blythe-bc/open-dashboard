import React from 'react';
import Link from 'next/link';

const HomePage = () => {
    return (
        <div>
            <nav>
                <ul>
                    <li>
                        <Link href="/admin/workspaces">
                            <a>Workspaces & Policies</a>
                        </Link>
                    </li>
                    <li>
                        <Link href="/admin/role-bindings">
                            <a>Role Bindings</a>
                        </Link>
                    </li>
                    <li>
                        <Link href="/admin/datasets">
                            <a>Datasets</a>
                        </Link>
                    </li>
                    <li>
                        <Link href="/admin/endpoints">
                            <a>Endpoints</a>
                        </Link>
                    </li>
                    <li>
                        <Link href="/admin/param-map-editor">
                            <a>Parameter Map Editor</a>
                        </Link>
                    </li>
                    <li>
                        <Link href="/admin/dashboards">
                            <a>Dashboards Management (Release/Rollback)</a>
                        </Link>
                    </li>
                    <li>
                        <Link href="/admin/performance">
                            <a>Performance Dashboard</a>
                        </Link>
                    </li>
                    <li>
                        <Link href="/dash/dash_sample">
                            <a>Sample Dashboard (Viewer)</a>
                        </Link>
                    </li>
                    <li>
                        <Link href="/builder/dash_sample">
                            <a>Sample Dashboard (Builder)</a>
                        </Link>
                    </li>
                </ul>
            </nav>
            <h1>Hello, World!</h1>
        </div>
    );
};

export default HomePage;
