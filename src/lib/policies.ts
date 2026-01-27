import type { AuthContext } from "@/lib/auth";

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

type WorkspaceSeed = Omit<WorkspacePolicyBundle, "role">;

type WorkspaceRoleBinding = {
  workspaceId: string;
  adGroup: string;
  role: string;
};

type PoliciesSeed = {
  workspaces: WorkspaceSeed[];
  roleBindings: WorkspaceRoleBinding[];
};

const policiesSeed: PoliciesSeed = {
  workspaces: [
    {
      id: "ws_default",
      name: "Default Workspace",
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
  ],
  roleBindings: [
    {
      workspaceId: "ws_default",
      adGroup: "BI-Viewers",
      role: "DataViewer"
    },
    {
      workspaceId: "ws_default",
      adGroup: "BI-Admins",
      role: "DataAdmin"
    },
    {
      workspaceId: "ws_default",
      adGroup: "Platform-Admins",
      role: "PlatformAdmin"
    }
  ]
};

const rolePriority = ["PlatformAdmin", "DataAdmin", "DataViewer"];

export function buildPoliciesResponse(auth: AuthContext): PoliciesResponse {
  const userGroups = new Set(auth.adGroups.map((group) => group.toLowerCase()));

  const workspaces = policiesSeed.workspaces.flatMap((workspace) => {
    const matchingRoles = policiesSeed.roleBindings
      .filter((binding) => binding.workspaceId === workspace.id)
      .filter((binding) => userGroups.has(binding.adGroup.toLowerCase()))
      .map((binding) => binding.role);

    if (matchingRoles.length === 0) {
      return [];
    }

    const role = rolePriority.find((candidate) => matchingRoles.includes(candidate));

    if (!role) {
      return [];
    }

    return [
      {
        ...workspace,
        role
      }
    ];
  });

  return {
    workspaces
  };
}

export function getPoliciesSeed() {
  return policiesSeed;
}
