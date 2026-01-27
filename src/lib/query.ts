import type { AuthContext } from "@/lib/auth";
import { buildPoliciesResponse } from "@/lib/policies";

export type QueryRequest = {
  workspaceId: string;
  endpointId: string;
  params: Record<string, string>;
  clientContext: {
    dashboardId?: string;
    widgetId?: string;
    purpose?: string;
  };
  requestId: string;
};

export type QueryErrorCode =
  | "VALIDATION_FAILED"
  | "FORBIDDEN"
  | "DAEMON_ERROR";

export type QueryErrorResponse = {
  status: number;
  errorCode: QueryErrorCode;
  message: string;
  requestId: string;
};

export type QueryResponse = {
  columns: Array<{ name: string; type: string }>;
  rows: Array<Array<string | number>>;
  meta: {
    normalizedParams: Record<string, string>;
    warnings: string[];
    cacheKey: string;
    cached: boolean;
    durationMs: number;
  };
  requestId: string;
};

export function validateQueryRequest(
  auth: AuthContext,
  request: QueryRequest
): { ok: true; allowedParams: string[] } | { ok: false; error: QueryErrorResponse } {
  const policies = buildPoliciesResponse(auth);
  const workspace = policies.workspaces.find(
    (candidate) => candidate.id === request.workspaceId
  );

  if (!workspace) {
    return {
      ok: false,
      error: {
        status: 403,
        errorCode: "FORBIDDEN",
        message: "Workspace access denied.",
        requestId: request.requestId
      }
    };
  }

  const endpoint = workspace.endpoints.find(
    (candidate) => candidate.id === request.endpointId
  );

  if (!endpoint) {
    return {
      ok: false,
      error: {
        status: 403,
        errorCode: "FORBIDDEN",
        message: "Endpoint access denied.",
        requestId: request.requestId
      }
    };
  }

  const metricsForEndpoint = workspace.metrics.filter(
    (metric) => metric.endpointId === endpoint.id
  );

  const datasetIds = new Set(metricsForEndpoint.map((metric) => metric.datasetId));
  const allowedParams = workspace.datasets
    .filter((dataset) => datasetIds.has(dataset.id))
    .flatMap((dataset) => dataset.allowedParams);

  const allowedSet = new Set(allowedParams);
  const invalidParam = Object.keys(request.params).find(
    (param) => !allowedSet.has(param)
  );

  if (invalidParam) {
    return {
      ok: false,
      error: {
        status: 400,
        errorCode: "VALIDATION_FAILED",
        message: `param_name '${invalidParam}' is not allowed`,
        requestId: request.requestId
      }
    };
  }

  return {
    ok: true,
    allowedParams
  };
}

export function buildMockQueryResponse(request: QueryRequest): QueryResponse {
  return {
    columns: [
      { name: "country", type: "string" },
      { name: "sales", type: "number" }
    ],
    rows: [
      ["US", 1200],
      ["KR", 900]
    ],
    meta: {
      normalizedParams: request.params,
      warnings: [],
      cacheKey: `mock:${request.endpointId}`,
      cached: false,
      durationMs: 42
    },
    requestId: request.requestId
  };
}
