import { getDashboard } from "@/lib/dashboards";

const cardStyle = {
  background: "#ffffff",
  borderRadius: 16,
  padding: 24,
  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
  display: "grid",
  gap: 16
} as const;

export default function BuilderPage({
  params
}: {
  params: { dashboardId: string };
}) {
  const dashboard = getDashboard(params.dashboardId);

  if (!dashboard) {
    return (
      <main style={{ padding: 48 }}>
        <h1>Dashboard not found</h1>
        <p>Create a draft by calling the save API.</p>
      </main>
    );
  }

  const latestVersion = dashboard.versions.at(-1);

  return (
    <main
      style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: "48px 24px",
        display: "grid",
        gap: 24
      }}
    >
      <header style={{ display: "grid", gap: 8 }}>
        <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>Builder MVP</p>
        <h1 style={{ margin: 0, fontSize: 32 }}>{dashboard.meta.name}</h1>
        <p style={{ margin: 0, color: "#4b5563", maxWidth: 640 }}>
          Draft editing is represented by the latest dashboard version. This page
          will be replaced by the full react-grid-layout builder UI in Phase 2.
        </p>
      </header>

      <section style={cardStyle}>
        <h2 style={{ margin: 0 }}>Meta</h2>
        <div>Workspace: {dashboard.meta.workspaceId}</div>
        <div>Latest version: {dashboard.meta.latestVersion}</div>
        <div>Published version: {dashboard.meta.publishedVersion ?? "-"}</div>
      </section>

      <section style={cardStyle}>
        <h2 style={{ margin: 0 }}>Latest Version Snapshot</h2>
        <pre
          style={{
            margin: 0,
            background: "#f9fafb",
            padding: 16,
            borderRadius: 12,
            overflowX: "auto"
          }}
        >
          {JSON.stringify(latestVersion, null, 2)}
        </pre>
      </section>
    </main>
  );
}
