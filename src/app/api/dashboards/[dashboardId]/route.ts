import { NextResponse } from "next/server";

import { getAuthContext } from "@/lib/auth";
import { getDashboard, saveDraft } from "@/lib/dashboards";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function GET(
  _request: Request,
  { params }: { params: { dashboardId: string } }
) {
  const authContext = getAuthContext();

  if (!authContext) {
    return NextResponse.json(
      { error: "Missing authentication headers." },
      { status: 401 }
    );
  }

  const dashboard = getDashboard(params.dashboardId);

  if (!dashboard) {
    return NextResponse.json({ error: "Dashboard not found." }, { status: 404 });
  }

  return NextResponse.json(dashboard);
}

export async function PUT(
  request: Request,
  { params }: { params: { dashboardId: string } }
) {
  const authContext = getAuthContext();

  if (!authContext) {
    return NextResponse.json(
      { error: "Missing authentication headers." },
      { status: 401 }
    );
  }

  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  if (!isRecord(body)) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const globalFilters = isRecord(body.globalFilters)
    ? (body.globalFilters as Record<string, string>)
    : {};
  const layout = Array.isArray(body.layout)
    ? (body.layout as Array<{ id: string; x: number; y: number; w: number; h: number }>)
    : [];
  const widgets = isRecord(body.widgets)
    ? (body.widgets as Record<string, Record<string, unknown>>)
    : {};

  const updated = saveDraft(params.dashboardId, {
    globalFilters,
    layout,
    widgets
  });

  return NextResponse.json(updated);
}
