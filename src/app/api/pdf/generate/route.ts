import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "Coming in Task 09" }, { status: 501 });
}
