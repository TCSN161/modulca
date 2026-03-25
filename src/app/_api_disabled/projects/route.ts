import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ projects: [], message: "Coming in Task 05" });
}
export async function POST() {
  return NextResponse.json({ message: "Coming in Task 05" }, { status: 501 });
}
