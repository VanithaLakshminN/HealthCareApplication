import mongoose, { Schema, model, models } from "mongoose";

const DoctorSchema = new Schema({
  name: String,
  specialty: String,
  experience: Number,
  rating: Number,
  availableSlots: [String], // e.g. ["09:00","09:10",...]
  consultationFee: Number,
  image: String,
});

const HospitalSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  phone: { type: String },
  ambulanceNumber: { type: String },
  rating: { type: Number, default: 0 },
  totalBeds: { type: Number, default: 0 },
  availableBeds: { type: Number, default: 0 },
  isOpen: { type: Boolean, default: true },
  openHours: { type: String, default: "24/7" },
  specializations: [String],
  doctors: [DoctorSchema],
  image: { type: String },
  location: {
    lat: Number,
    lng: Number,
  },
}, { timestamps: true });

export const Hospital = models.Hospital || model("Hospital", HospitalSchema);
