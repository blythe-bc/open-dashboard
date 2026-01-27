import { NextResponse } from "next/server";

import { policiesSeed } from "@/lib/policies";

export function GET() {
  return NextResponse.json(policiesSeed);
}
