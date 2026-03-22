import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Coming in Task 05" }, { status: 501 });
}
export async function PUT() {
  return NextResponse.json({ message: "Coming in Task 06" }, { status: 501 });
}
