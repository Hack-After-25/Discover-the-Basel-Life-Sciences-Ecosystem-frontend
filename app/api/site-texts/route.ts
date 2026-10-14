import { NextResponse } from "next/server";
import { TEXTS } from "@/lib/texts";

// The catalog of editable texts with their defaults, read by the admin panel's
// Site texts screen so it always lists exactly the texts this version uses.
export function GET() {
  return NextResponse.json(TEXTS, {
    headers: { "Cache-Control": "public, max-age=300", "Access-Control-Allow-Origin": "*" },
  });
}
