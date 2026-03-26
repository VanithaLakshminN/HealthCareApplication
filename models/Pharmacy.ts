import { Schema, model, models } from "mongoose";

const MedicineSchema = new Schema({
  name: String,
  category: String,
  inStock: { type: Boolean, default: true },
  price: Number,
});

const PharmacySchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  phone: { type: String },
  nearbyHospital: { type: String }, // hospital name it's near to
  isOpen: { type: Boolean, default: true },
  openHours: { type: String, default: "08:00 - 22:00" },
  rating: { type: Number, default: 0 },
  medicines: [MedicineSchema],
  location: { lat: Number, lng: Number },
}, { timestamps: true });

export const Pharmacy = models.Pharmacy || model("Pharmacy", PharmacySchema);
