// import { AppointmentBooking } from '@/components/appointment-booking'
// import React from 'react'

// const page = () => {
//   return (
//     <div>
//         {/* <AppointmentBooking/> */}
        
//     </div>
//   )
// }

// export default page
// app/appointments/page.tsx

// app/appointments/page.tsx
"use client";
import { useState } from "react";

type Doctor = {
  id: number;
  name: string;
  specialty: string;
  experience: number;
  rating: number;
  clinic: string;
  slots: string[];
};

type Appointment = {
  doctor: Doctor;
  slot: string;
};

// Utility to generate slots in 10-minute intervals
const generateSlots = (start: string, end: string): string[] => {
  const slots: string[] = [];
  let [sh, sm] = start.split(":").map(Number);
  let [eh, em] = end.split(":").map(Number);

  while (sh < eh || (sh === eh && sm <= em)) {
    const hh = String(sh).padStart(2, "0");
    const mm = String(sm).padStart(2, "0");
    slots.push(`${hh}:${mm}`);

    sm += 10;
    if (sm >= 60) {
      sm = 0;
      sh++;
    }
  }
  return slots;
};

export default function AppointmentPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([
    {
      id: 1,
      name: "Dr. Sarah patil",
      specialty: "Cardiologist",
      experience: 15,
      rating: 4.9,
      clinic: "Heart Care Center",
      slots: generateSlots("09:00", "12:00").concat(generateSlots("14:00", "16:00")),
    },
    {
      id: 2,
      name: "Dr. Basavaraj",
      specialty: "Neurologist",
      experience: 12,
      rating: 4.8,
      clinic: "Brain & Spine Clinic",
      slots: generateSlots("10:00", "13:00").concat(generateSlots("15:00", "17:00")),
    },
    {
      id: 3,
      name: "Dr. Sharan",
      specialty: "Dermatologist",
      experience: 10,
      rating: 4.9,
      clinic: "Skin Care Institute",
      slots: generateSlots("09:30", "12:00").concat(generateSlots("14:00", "16:30")),
    },
    
    {
      id: 4,
      name: "Dr. Priya",
      specialty: "M.D",
      experience: 8,
      rating: 4.8,
      clinic: "General Ward ",
      slots: generateSlots("09:30", "12:00").concat(generateSlots("14:00", "16:30")),
    },
    {
      id: 5,
      name: "Dr. Rahul",
      specialty: "Dentist",
      experience: 5,
      rating: 4.9,
      clinic: "Dental Clinic",
      slots: generateSlots("10:00", "13:00").concat(generateSlots("15:00", "17:00")),
    },
  ]);

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const confirmBooking = () => {
    if (selectedDoctor && selectedSlot) {
      // Save appointment
      const newAppointment = { doctor: selectedDoctor, slot: selectedSlot };
      setAppointments([...appointments, newAppointment]);

      // Remove the booked slot from that doctor
      setDoctors((prev) =>
        prev.map((doc) =>
          doc.id === selectedDoctor.id
            ? { ...doc, slots: doc.slots.filter((s) => s !== selectedSlot) }
            : doc
        )
      );

      // Reset selection
      setSelectedDoctor(null);
      setSelectedSlot(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Book Appointment</h1>

      {/* Doctors List */}
      <div className="grid gap-6">
        {doctors.map((doc) => (
          <div
            key={doc.id}
            className={`p-5 rounded-2xl shadow-lg border ${
              selectedDoctor?.id === doc.id ? "border-blue-500" : "border-gray-700"
            } bg-neutral-900`}
          >
            <h2 className="text-xl font-semibold">{doc.name}</h2>
            <p className="text-sm text-gray-400">
              {doc.specialty} • {doc.experience} yrs
            </p>
            <p className="text-sm text-gray-400">{doc.clinic}</p>

            <div className="mt-4">
              <p className="text-sm mb-2 text-gray-300">Available Today:</p>
              {doc.slots.length > 0 ? (
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                  {doc.slots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => {
                        setSelectedDoctor(doc);
                        setSelectedSlot(slot);
                      }}
                      className={`px-3 py-1 rounded-lg border text-sm ${
                        selectedSlot === slot && selectedDoctor?.id === doc.id
                          ? "bg-blue-600 border-blue-600"
                          : "border-gray-600"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No slots available</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation */}
      {selectedDoctor && selectedSlot && (
        <div className="fixed bottom-6 right-6 bg-neutral-900 border border-gray-700 p-4 rounded-xl shadow-lg">
          <h3 className="text-lg font-bold mb-2">Confirm Appointment</h3>
          <p>
            {selectedDoctor.name} - {selectedDoctor.specialty}
          </p>
          <p>Time: {selectedSlot}</p>
          <button
            onClick={confirmBooking}
            className="mt-3 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Confirm Booking
          </button>
        </div>
      )}

      {/* My Bookings */}
      {appointments.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">My Appointments</h2>
          <ul className="space-y-3">
            {appointments.map((appt, idx) => (
              <li
                key={idx}
                className="p-4 border border-gray-700 rounded-lg bg-neutral-800"
              >
                <p className="font-semibold">{appt.doctor.name}</p>
                <p className="text-sm text-gray-400">{appt.doctor.specialty}</p>
                <p className="text-sm">Time: {appt.slot}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

