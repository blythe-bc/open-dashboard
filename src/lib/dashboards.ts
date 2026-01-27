export type DashboardMeta = {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  latestVersion: number;
  publishedVersion: number | null;
  status: "active" | "archived";
  createdAt: string;
  updatedAt: string;
};

export type DashboardVersion = {
  dashboardId: string;
  version: number;
  status: "draft" | "published";
  globalFilters: Record<string, string>;
  layout: Array<{ id: string; x: number; y: number; w: number; h: number }>;
  widgets: Record<string, Record<string, unknown>>;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
};

export type DashboardRecord = {
  meta: DashboardMeta;
  versions: DashboardVersion[];
};

const dashboardsStore = new Map<string, DashboardRecord>();

function nowIso() {
  return new Date().toISOString();
}

function seedDashboard(): DashboardRecord {
  const timestamp = nowIso();
  const meta: DashboardMeta = {
    id: "dash_default",
    workspaceId: "ws_default",
    name: "Sales Overview",
    description: "Default sales dashboard seed",
    latestVersion: 1,
    publishedVersion: 1,
    status: "active",
    createdAt: timestamp,
    updatedAt: timestamp
  };

  const version: DashboardVersion = {
    dashboardId: meta.id,
    version: 1,
    status: "published",
    globalFilters: {
      date_from: "2024-01-01",
      date_to: "2024-01-31"
    },
    layout: [{ id: "widget_revenue", x: 0, y: 0, w: 6, h: 4 }],
    widgets: {
      widget_revenue: {
        type: "chart",
        metricId: "m_revenue",
        chartType: "bar"
      }
    },
    createdAt: timestamp,
    updatedAt: timestamp,
    publishedAt: timestamp
  };

  return {
    meta,
    versions: [version]
  };
}

function ensureSeed() {
  if (!dashboardsStore.has("dash_default")) {
    dashboardsStore.set("dash_default", seedDashboard());
  }
}

export function getDashboard(dashboardId: string): DashboardRecord | null {
  ensureSeed();
  return dashboardsStore.get(dashboardId) ?? null;
}

export function saveDraft(
  dashboardId: string,
  payload: Pick<DashboardVersion, "globalFilters" | "layout" | "widgets">
): DashboardRecord {
  ensureSeed();
  const existing = dashboardsStore.get(dashboardId);
  const timestamp = nowIso();

  if (!existing) {
    const meta: DashboardMeta = {
      id: dashboardId,
      workspaceId: "ws_default",
      name: "Untitled Dashboard",
      description: "",
      latestVersion: 1,
      publishedVersion: null,
      status: "active",
      createdAt: timestamp,
      updatedAt: timestamp
    };

    const version: DashboardVersion = {
      dashboardId,
      version: 1,
      status: "draft",
      globalFilters: payload.globalFilters,
      layout: payload.layout,
      widgets: payload.widgets,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    const record = { meta, versions: [version] };
    dashboardsStore.set(dashboardId, record);
    return record;
  }

  const updatedMeta: DashboardMeta = {
    ...existing.meta,
    latestVersion: existing.meta.latestVersion + 1,
    updatedAt: timestamp
  };

  const version: DashboardVersion = {
    dashboardId,
    version: updatedMeta.latestVersion,
    status: "draft",
    globalFilters: payload.globalFilters,
    layout: payload.layout,
    widgets: payload.widgets,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  const record = {
    meta: updatedMeta,
    versions: [...existing.versions, version]
  };

  dashboardsStore.set(dashboardId, record);
  return record;
}

export function publishDashboard(dashboardId: string): DashboardRecord | null {
  ensureSeed();
  const existing = dashboardsStore.get(dashboardId);
  if (!existing) {
    return null;
  }

  const latestDraft = [...existing.versions]
    .reverse()
    .find((version) => version.status === "draft");

  if (!latestDraft) {
    return existing;
  }

  const timestamp = nowIso();
  const nextVersion = existing.meta.latestVersion + 1;

  const publishedVersion: DashboardVersion = {
    ...latestDraft,
    version: nextVersion,
    status: "published",
    publishedAt: timestamp,
    updatedAt: timestamp
  };

  const updatedMeta: DashboardMeta = {
    ...existing.meta,
    latestVersion: nextVersion,
    publishedVersion: nextVersion,
    updatedAt: timestamp
  };

  const record = {
    meta: updatedMeta,
    versions: [...existing.versions, publishedVersion]
  };

  dashboardsStore.set(dashboardId, record);
  return record;
}
