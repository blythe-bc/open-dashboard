import { NextResponse } from "next/server";

import { getAuthContext } from "@/lib/auth";
import { publishDashboard } from "@/lib/dashboards";

export async function POST(
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

  const dashboard = publishDashboard(params.dashboardId);

  if (!dashboard) {
    return NextResponse.json({ error: "Dashboard not found." }, { status: 404 });
  }

  return NextResponse.json(dashboard);
}
