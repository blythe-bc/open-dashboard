import { getDashboard } from "@/lib/dashboards";

const cardStyle = {
  background: "#ffffff",
  borderRadius: 16,
  padding: 24,
  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
  display: "grid",
  gap: 16
} as const;

export default function ViewerPage({
  params
}: {
  params: { dashboardId: string };
}) {
  const dashboard = getDashboard(params.dashboardId);

  if (!dashboard || dashboard.meta.publishedVersion === null) {
    return (
      <main style={{ padding: 48 }}>
        <h1>No published dashboard found</h1>
        <p>Publish a draft before viewing.</p>
      </main>
    );
  }

  const published = dashboard.versions.find(
    (version) => version.version === dashboard.meta.publishedVersion
  );

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
        <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>Viewer MVP</p>
        <h1 style={{ margin: 0, fontSize: 32 }}>{dashboard.meta.name}</h1>
        <p style={{ margin: 0, color: "#4b5563", maxWidth: 640 }}>
          Published dashboard snapshot rendered for the Viewer flow. Chart/Grid
          widgets will render here once the runtime integration is complete.
        </p>
      </header>

      <section style={cardStyle}>
        <h2 style={{ margin: 0 }}>Published Version</h2>
        <pre
          style={{
            margin: 0,
            background: "#f9fafb",
            padding: 16,
            borderRadius: 12,
            overflowX: "auto"
          }}
        >
          {JSON.stringify(published, null, 2)}
        </pre>
      </section>
    </main>
  );
}
