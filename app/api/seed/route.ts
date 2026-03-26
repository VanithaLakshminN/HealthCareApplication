// Only for development — seeds hospitals, pharmacies, and admin account
import { connectDB } from "@/lib/mongodb";
import { Hospital } from "@/models/Hospital";
import { Pharmacy } from "@/models/Pharmacy";
import { Admin } from "@/models/Admin";
import { HOSPITALS } from "@/lib/seedHospitals";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function GET() {
  if (process.env.NODE_ENV === "production")
    return NextResponse.json({ error: "Not allowed in production" }, { status: 403 });

  await connectDB();

  // Seed hospitals
  await Hospital.deleteMany({});
  await Hospital.insertMany(HOSPITALS);

  // Seed pharmacies near each hospital
  const pharmacies = [
    { name: "MedPlus Pharmacy", address: "HAL Airport Road, Bengaluru", city: "Bengaluru", phone: "080-25001234", nearbyHospital: "Manipal Hospital", isOpen: true, openHours: "08:00-22:00", rating: 4.5, location: { lat: 12.9600, lng: 77.6480 }, medicines: [{ name: "Paracetamol 500mg", category: "OTC", inStock: true, price: 12 }, { name: "Amoxicillin 250mg", category: "Antibiotic", inStock: true, price: 45 }, { name: "Ibuprofen 400mg", category: "OTC", inStock: false, price: 18 }] },
    { name: "Apollo Pharmacy", address: "Bommasandra, Bengaluru", city: "Bengaluru", phone: "080-71001234", nearbyHospital: "Narayana Health City", isOpen: true, openHours: "24/7", rating: 4.7, location: { lat: 12.8350, lng: 77.6780 }, medicines: [{ name: "Metformin 500mg", category: "Diabetes", inStock: true, price: 30 }, { name: "Atorvastatin 20mg", category: "Cholesterol", inStock: true, price: 55 }, { name: "Omeprazole 20mg", category: "Digestive", inStock: true, price: 22 }] },
    { name: "Wellness Forever", address: "Cunningham Road, Bengaluru", city: "Bengaluru", phone: "080-66001234", nearbyHospital: "Fortis Hospital", isOpen: true, openHours: "09:00-21:00", rating: 4.4, location: { lat: 12.9910, lng: 77.5960 }, medicines: [{ name: "Cetirizine 10mg", category: "Antihistamine", inStock: true, price: 9 }, { name: "Azithromycin 500mg", category: "Antibiotic", inStock: false, price: 40 }, { name: "Vitamin C 1000mg", category: "Supplement", inStock: true, price: 15 }] },
    { name: "Netmeds Store", address: "Bannerghatta Road, Bengaluru", city: "Bengaluru", phone: "080-26001234", nearbyHospital: "Apollo Hospital", isOpen: true, openHours: "08:00-22:00", rating: 4.6, location: { lat: 12.8960, lng: 77.5970 }, medicines: [{ name: "Losartan 50mg", category: "Hypertension", inStock: true, price: 28 }, { name: "Levothyroxine 50mcg", category: "Thyroid", inStock: true, price: 18 }, { name: "Aspirin 75mg", category: "Cardio", inStock: true, price: 10 }] },
    { name: "Frank Ross Pharmacy", address: "Millers Road, Bengaluru", city: "Bengaluru", phone: "080-40001234", nearbyHospital: "Vikram Hospital", isOpen: false, openHours: "09:00-20:00", rating: 4.3, location: { lat: 12.9960, lng: 77.5810 }, medicines: [{ name: "Prednisone 10mg", category: "Steroid", inStock: true, price: 27 }, { name: "Fish Oil 1000mg", category: "Supplement", inStock: true, price: 22 }, { name: "Multivitamin", category: "Supplement", inStock: false, price: 20 }] },
    { name: "Guardian Pharmacy", address: "Brigade Gateway, Bengaluru", city: "Bengaluru", phone: "080-61001234", nearbyHospital: "Columbia Asia Hospital", isOpen: true, openHours: "08:00-22:00", rating: 4.5, location: { lat: 13.0110, lng: 77.5560 }, medicines: [{ name: "Sertraline 50mg", category: "Antidepressant", inStock: true, price: 35 }, { name: "Calcium + D3", category: "Supplement", inStock: true, price: 16 }, { name: "Hydroxyzine 25mg", category: "Antihistamine", inStock: true, price: 19 }] },
  ];
  await Pharmacy.deleteMany({});
  await Pharmacy.insertMany(pharmacies);

  // Seed admin account
  const existing = await Admin.findOne({ email: "admin@healthcare.com" });
  if (!existing) {
    const hashed = await bcrypt.hash("Admin@123", 10);
    await Admin.create({ name: "Super Admin", email: "admin@healthcare.com", password: hashed, role: "superadmin" });
  }

  return NextResponse.json({ message: "Seeded hospitals, pharmacies, and admin account successfully" });
}
