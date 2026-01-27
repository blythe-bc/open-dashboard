export type WorkspacePolicy = {
  expertMode: boolean;
  allowCustomSql: boolean;
  allowExport: boolean;
};

export type WorkspaceDatasetHierarchy = {
  id: string;
  name: string;
};

export type WorkspaceDataset = {
  id: string;
  name: string;
  allowedParams: string[];
  hierarchies: WorkspaceDatasetHierarchy[];
};

export type WorkspaceMetric = {
  id: string;
  name: string;
  datasetId: string;
  endpointId: string;
};

export type WorkspaceEndpoint = {
  id: string;
  name: string;
  timeoutMs: number;
  maxRows: number;
  maxItems: number;
};

export type WorkspaceStandards = {
  allowedClassNames: string[];
  themeId: string;
};

export type WorkspacePolicyBundle = {
  id: string;
  name: string;
  role: string;
  policy: WorkspacePolicy;
  datasets: WorkspaceDataset[];
  metrics: WorkspaceMetric[];
  endpoints: WorkspaceEndpoint[];
  standards: WorkspaceStandards;
};

export type PoliciesResponse = {
  workspaces: WorkspacePolicyBundle[];
};

export const policiesSeed: PoliciesResponse = {
  workspaces: [
    {
      id: "ws_default",
      name: "Default Workspace",
      role: "DataViewer",
      policy: {
        expertMode: false,
        allowCustomSql: false,
        allowExport: false
      },
      datasets: [
        {
          id: "ds_sales",
          name: "Sales",
          allowedParams: ["date_from", "date_to", "region"],
          hierarchies: [
            {
              id: "h_region",
              name: "Region"
            }
          ]
        }
      ],
      metrics: [
        {
          id: "m_revenue",
          name: "Revenue",
          datasetId: "ds_sales",
          endpointId: "ep_sales_summary"
        }
      ],
      endpoints: [
        {
          id: "ep_sales_summary",
          name: "sp_sales_summary",
          timeoutMs: 30000,
          maxRows: 10000,
          maxItems: 200
        }
      ],
      standards: {
        allowedClassNames: ["ok", "warn", "fail", "muted", "info", "accent"],
        themeId: "corp_default"
      }
    }
  ]
};
