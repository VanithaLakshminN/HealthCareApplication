import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTPEmail(email: string, otp: string) {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "HealthCare Pro", email: process.env.BREVO_SENDER_EMAIL },
      to: [{ email }],
      subject: "Your OTP for HealthCare Pro Registration",
      htmlContent: `
        <div style="font-family:sans-serif;max-width:400px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
          <h2 style="color:#2563eb">HealthCare Pro</h2>
          <p>Your OTP for registration is:</p>
          <h1 style="letter-spacing:8px;color:#1d4ed8">${otp}</h1>
          <p style="color:#6b7280;font-size:13px">This OTP expires in 10 minutes. Do not share it with anyone.</p>
        </div>`,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Brevo error: ${err}`);
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, email, password } = await req.json();

    if (!name || !email || !password)
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });

    const existing = await User.findOne({ email });
    if (existing?.isVerified)
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });

    const hashed = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    if (existing) {
      existing.name = name;
      existing.password = hashed;
      existing.otp = otp;
      existing.otpExpiry = otpExpiry;
      await existing.save();
    } else {
      await User.create({ name, email, password: hashed, otp, otpExpiry });
    }

    console.log(`[OTP for ${email}]: ${otp}`); // visible in terminal
    await sendOTPEmail(email, otp);
    return NextResponse.json({ message: "OTP sent to your email" });
  } catch (e: any) {
    console.error("[register]", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
