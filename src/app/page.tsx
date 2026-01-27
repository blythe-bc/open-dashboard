import { getPoliciesSeed } from "@/lib/policies";

const cardStyle = {
  background: "#ffffff",
  borderRadius: 16,
  padding: 24,
  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
  display: "grid",
  gap: 16
} as const;

const tagStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "6px 12px",
  borderRadius: 999,
  background: "#eef2ff",
  color: "#3730a3",
  fontSize: 12,
  fontWeight: 600
} as const;

const sectionTitleStyle = {
  fontSize: 14,
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  color: "#6b7280",
  margin: 0
};

export default function Home() {
  const workspace = getPoliciesSeed().workspaces[0];

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
        <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>
          Phase 0 • Admin Foundation
        </p>
        <h1 style={{ margin: 0, fontSize: 32 }}>Policy Bundle Preview</h1>
        <p style={{ margin: 0, color: "#4b5563", maxWidth: 640 }}>
          This screen renders the initial <code>/api/me/policies</code> response so
          admins and builders can verify access rules before wiring the full UI.
        </p>
      </header>

      <section style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <div>
            <h2 style={{ margin: 0 }}>{workspace.name}</h2>
            <p style={{ margin: "6px 0 0", color: "#6b7280" }}>
              Workspace ID: {workspace.id}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={tagStyle}>Policy Seed</span>
            <p style={{ margin: "8px 0 0", color: "#6b7280", fontSize: 12 }}>
              Theme: {workspace.standards.themeId}
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <span style={tagStyle}>
              Expert mode: {workspace.policy.expertMode ? "On" : "Off"}
            </span>
            <span style={tagStyle}>
              Custom SQL: {workspace.policy.allowCustomSql ? "On" : "Off"}
            </span>
            <span style={tagStyle}>
              Export: {workspace.policy.allowExport ? "On" : "Off"}
            </span>
          </div>
        </div>
      </section>

      <section style={{ display: "grid", gap: 16 }}>
        <h3 style={sectionTitleStyle}>Datasets</h3>
        {workspace.datasets.map((dataset) => (
          <article key={dataset.id} style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ margin: 0 }}>{dataset.name}</h2>
                <p style={{ margin: "6px 0 0", color: "#6b7280" }}>
                  {dataset.id}
                </p>
              </div>
              <span style={tagStyle}>
                Params: {dataset.allowedParams.join(", ")}
              </span>
            </div>
            <div>
              <p style={{ margin: "0 0 8px", color: "#6b7280" }}>
                Hierarchies
              </p>
              <ul style={{ margin: 0, paddingLeft: 16, color: "#374151" }}>
                {dataset.hierarchies.map((hierarchy) => (
                  <li key={hierarchy.id}>
                    {hierarchy.name} ({hierarchy.id})
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section style={{ display: "grid", gap: 16 }}>
        <h3 style={sectionTitleStyle}>Metrics & Endpoints</h3>
        {workspace.metrics.map((metric) => {
          const endpoint = workspace.endpoints.find(
            (candidate) => candidate.id === metric.endpointId
          );
          return (
            <article key={metric.id} style={cardStyle}>
              <div style={{ display: "grid", gap: 12 }}>
                <div>
                  <h2 style={{ margin: 0 }}>{metric.name}</h2>
                  <p style={{ margin: "6px 0 0", color: "#6b7280" }}>
                    Metric ID: {metric.id}
                  </p>
                </div>
                <div style={{ display: "grid", gap: 6, color: "#374151" }}>
                  <div>Dataset: {metric.datasetId}</div>
                  <div>Endpoint: {metric.endpointId}</div>
                </div>
                {endpoint ? (
                  <div
                    style={{
                      display: "grid",
                      gap: 6,
                      padding: 16,
                      borderRadius: 12,
                      background: "#f9fafb"
                    }}
                  >
                    <strong>{endpoint.name}</strong>
                    <div>Timeout: {endpoint.timeoutMs} ms</div>
                    <div>Max rows: {endpoint.maxRows}</div>
                    <div>Max items: {endpoint.maxItems}</div>
                  </div>
                ) : (
                  <div style={{ color: "#b91c1c" }}>
                    Missing endpoint definition.
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </section>

      <section style={cardStyle}>
        <h3 style={sectionTitleStyle}>Standards</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {workspace.standards.allowedClassNames.map((name) => (
            <span key={name} style={tagStyle}>
              {name}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
