import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ modules: [], message: "Coming in Task 06" });
}
