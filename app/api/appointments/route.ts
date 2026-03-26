import { connectDB } from "@/lib/mongodb";
import { Appointment } from "@/models/Appointment";
import { Hospital } from "@/models/Hospital";
import { getUserFromToken } from "@/lib/authMiddleware";
import { NextResponse } from "next/server";

export async function GET() {
  const user = getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const appointments = await Appointment.find({ userId: user.userId }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ appointments });
}

export async function POST(req: Request) {
  const user = getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const body = await req.json();

  // Remove booked slot from hospital doctor
  await Hospital.updateOne(
    { _id: body.hospitalId, "doctors.name": body.doctorName },
    { $pull: { "doctors.$.availableSlots": body.slot } }
  );

  const appointment = await Appointment.create({ ...body, userId: user.userId });
  return NextResponse.json({ appointment }, { status: 201 });
}
