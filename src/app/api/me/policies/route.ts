import { NextResponse } from "next/server";

import { getAuthContext } from "@/lib/auth";
import { buildPoliciesResponse } from "@/lib/policies";

export function GET() {
  const authContext = getAuthContext();

  if (!authContext) {
    return NextResponse.json(
      { error: "Missing authentication headers." },
      { status: 401 }
    );
  }

  return NextResponse.json(buildPoliciesResponse(authContext));
}
