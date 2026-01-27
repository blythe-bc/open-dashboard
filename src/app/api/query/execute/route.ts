import { NextResponse } from "next/server";

import { getAuthContext } from "@/lib/auth";
import { executeDaemonQuery } from "@/lib/daemonClient";
import { validateQueryRequest, type QueryRequest } from "@/lib/query";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function POST(request: Request) {
  const authContext = getAuthContext();

  if (!authContext) {
    return NextResponse.json(
      { error: "Missing authentication headers." },
      { status: 401 }
    );
  }

  let payload: QueryRequest;

  try {
    const body = await request.json();

    if (!isRecord(body)) {
      throw new Error("Invalid body");
    }

    payload = {
      workspaceId: String(body.workspaceId ?? ""),
      endpointId: String(body.endpointId ?? ""),
      params: isRecord(body.params) ? (body.params as Record<string, string>) : {},
      clientContext: isRecord(body.clientContext)
        ? (body.clientContext as QueryRequest["clientContext"])
        : {},
      requestId: String(body.requestId ?? "")
    };
  } catch {
    return NextResponse.json(
      {
        status: 400,
        errorCode: "VALIDATION_FAILED",
        message: "Invalid JSON payload.",
        requestId: "unknown"
      },
      { status: 400 }
    );
  }

  if (!payload.requestId) {
    return NextResponse.json(
      {
        status: 400,
        errorCode: "VALIDATION_FAILED",
        message: "requestId is required.",
        requestId: "unknown"
      },
      { status: 400 }
    );
  }

  const validation = validateQueryRequest(authContext, payload);

  if (!validation.ok) {
    return NextResponse.json(validation.error, { status: validation.error.status });
  }

  const response = await executeDaemonQuery(payload);

  console.info("query.execute", {
    requestId: payload.requestId,
    endpointId: payload.endpointId,
    workspaceId: payload.workspaceId,
    durationMs: response.meta.durationMs,
    rowCount: response.rows.length
  });

  return NextResponse.json(response);
}
