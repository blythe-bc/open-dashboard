import type { QueryRequest, QueryResponse } from "@/lib/query";

export type DaemonErrorCode = "DAEMON_ERROR";

export type DaemonError = {
  status: number;
  errorCode: DaemonErrorCode;
  message: string;
  requestId: string;
};

export async function executeDaemonQuery(
  request: QueryRequest
): Promise<QueryResponse> {
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
