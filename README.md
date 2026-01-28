# Open Dashboard (Gemini BI Platform)

A full-stack Business Intelligence (BI) platform built with **Next.js**, designed to provide a secure, policy-driven environment for creating, deploying, and viewing dashboards. Inspired by PowerBI and MS Fabric, it features a robust "Draft -> Publish" workflow, strict admin governance, and optional AI integrations.

## 🚀 Key Features

*   **Policy-Driven Security**: All data access is governed by strict workspace policies and semantic layer definitions defined by admins.
*   **Draft & Publish Workflow**: Builders work in a safe draft environment. Changes are only visible to viewers after a formal publish action.
*   **Drag-and-Drop Builder**: Intuitive grid-based layout editor (`react-grid-layout`) with undo/redo support.
*   **Interactive Viewer**: dynamic filtering, drill-down support (URL-synced), and saved views.
*   **Enterprise Grade**:
    *   **Release Management**: Version history and rollback capabilities.
    *   **Performance Monitoring**: Track query performance and errors per endpoint.
    *   **Impact Analysis**: Preview affected dashboards before changing data models.
    *   **Export & Embed**: CSV export, Print-to-PDF styles, and secure iframe embedding.
*   **LLM Integration**: "Ask AI" feature to summarize dashboard insights (controlled by workspace policy).

## 🛠 Tech Stack

*   **Framework**: Next.js (React)
*   **Database**: SQLite (Development) with a custom migration/seed system.
    *   *Note: Designed to swap with PostgreSQL/MySQL for production.*
*   **Styling**: CSS Modules / Global CSS (Minimal dependencies).
*   **Layout Engine**: `react-grid-layout`.

## 📂 Project Structure

```
├── scripts/              # Database initialization and seed scripts
│   ├── init-db.js        # Schema definition (Tables: Workspace, Dashboard, AuditLog, etc.)
│   ├── seed.js           # Default data (Workspaces, Datasets, Sample Dashboard)
│   └── migrate-*.js      # Phase-specific migrations
├── src/
│   ├── components/       # Reusable UI components (Widget, etc.)
│   ├── lib/              # Utilities (DB connection, API client, Undo/Redo hook)
│   ├── pages/
│   │   ├── admin/        # Admin Console (Workspaces, Policies, Perf, Endpoints)
│   │   ├── api/          # Backend API Routes (Next.js API Routes)
│   │   │   ├── admin/    # Admin APIs
│   │   │   ├── builder/  # Builder Draft/Publish APIs
│   │   │   ├── dash/     # Viewer APIs (Saved Views)
│   │   │   ├── llm/      # AI Generation Endpoints
│   │   │   ├── me/       # Context/Auth Policies
│   │   │   └── query/    # Core Query Execution Engine
│   │   ├── builder/      # Dashboard Builder UI
│   │   ├── dash/         # Dashboard Viewer UI
│   │   └── embed/        # Embedded Viewer UI
│   └── styles/           # Global styles and print overrides
```

## ⚡ Getting Started

### 1. Installation

```bash
npm install
```

### 2. Initialize Database

Initialize the SQLite database and populate it with seed data (Default Workspace, Sales Dataset, Sample Dashboard).

```bash
# Creates dev.db and tables
node scripts/init-db.js 

# Seeds initial data
node scripts/seed.js

# (Optional) Apply latest migrations if not included in init
node scripts/migrate-phase6.js
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## 📖 Usage Guide

### for Admins
*   Navigate to **/admin/workspaces** to manage policies (e.g., enable Expert Mode, LLM features).
*   Use **/admin/endpoints** to view data lineage and impact analysis.
*   Monitor system health at **/admin/performance**.
*   Manage dashboard releases at **/admin/dashboards**.

### for Builders
*   Go to **/builder/dash_sample** (or create new).
*   Drag widgets from the "Add Widget" menu.
*   Configure data binding (Endpoint) and visualization (Chart Type) in the Inspector.
*   **Save Draft** to keep changes private.
*   **Publish** to make changes live for viewers.

### for Viewers
*   Access dashboards via **/dash/dash_sample**.
*   Use filters to slice data (URL is updated automatically for sharing).
*   **Save View** to bookmark specific filter configurations.
*   **Ask AI** (if enabled) to get a summary of the current view.
*   **Export CSV** from grid widgets for offline analysis.

## 🛡 Security & Governance

*   **Single Source of Truth**: The `/api/me/policies` endpoint bundles all permissions, preventing UI from offering unauthorized actions.
*   **Query Safety**: Direct DB access is blocked. All queries go through `SemanticMetricEndpoint` definitions with strict parameter allowlists and timeouts.
*   **Audit Logging**: Every query execution, dashboard publish, and policy change is recorded in the `AuditLog` table.

## 🤝 Contributing

This project followed a phased development lifecycle (Phase 0 - Phase 6). Please refer to `GEMINI.md` and the `00_MASTER_PLAN.md` for architectural decisions and future roadmap.
