import { connectDB } from "@/lib/mongodb";
import { Contact } from "@/models/Contact";
import { getAdminFromToken } from "@/lib/authMiddleware";
import { NextResponse } from "next/server";

// POST — user submits a query (public)
export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const contact = await Contact.create(body);
  return NextResponse.json({ message: "Query submitted successfully", contact }, { status: 201 });
}

// GET — admin views all queries
export async function GET() {
  const admin = getAdminFromToken();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const queries = await Contact.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ queries });
}
