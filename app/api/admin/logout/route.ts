import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ message: "Admin logged out" });
  res.cookies.set("adminToken", "", { maxAge: 0, path: "/" });
  return res;
}
