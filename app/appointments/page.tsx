"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Phone, Star, Clock, ChevronDown, ChevronUp, Calendar, Ambulance, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Doctor = { name: string; specialty: string; experience: number; rating: number; consultationFee: number; availableSlots: string[]; _id: string };
type Hospital = { _id: string; name: string; address: string; phone: string; ambulanceNumber: string; rating: number; totalBeds: number; availableBeds: number; isOpen: boolean; openHours: string; specializations: string[]; doctors: Doctor[] };

export default function AppointmentsPage() {
  const router = useRouter();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<{ hospitalId: string; doctor: Doctor } | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [type, setType] = useState<"in-person" | "video">("in-person");
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [filterSpec, setFilterSpec] = useState("");
  const [loadingHospitals, setLoadingHospitals] = useState(true);

  useEffect(() => {
    fetch("/api/hospitals")
      .then(r => r.json())
      .then(d => {
        console.log("hospitals response:", d);
        setHospitals(d.hospitals || []);
        setLoadingHospitals(false);
      })
      .catch(e => {
        console.error("hospitals fetch error:", e);
        setLoadingHospitals(false);
      });
  }, []);

  const allSpecs = [...new Set(hospitals.flatMap(h => h.specializations))].sort();

  const filtered = filterSpec
    ? hospitals.filter(h => h.specializations.includes(filterSpec) || h.doctors.some(d => d.specialty === filterSpec))
    : hospitals;

  const confirmBooking = async () => {
    if (!selectedDoctor || !selectedSlot) return;
    setBooking(true);
    const hospital = hospitals.find(h => h._id === selectedDoctor.hospitalId)!;
    await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hospitalId: selectedDoctor.hospitalId,
        hospitalName: hospital.name,
        doctorName: selectedDoctor.doctor.name,
        doctorSpecialty: selectedDoctor.doctor.specialty,
        date, slot: selectedSlot, type,
      }),
    });
    setBooking(false); setBooked(true);
    setTimeout(() => { setBooked(false); setSelectedDoctor(null); setSelectedSlot(null); }, 3000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Book Appointment</h1>
        <p className="text-zinc-400 text-sm mb-6">Choose from our 6 partner hospitals and book a slot with your preferred doctor.</p>

        {/* Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => setFilterSpec("")} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${!filterSpec ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>All</button>
          {allSpecs.map(s => (
            <button key={s} onClick={() => setFilterSpec(s)} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${filterSpec === s ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>{s}</button>
          ))}
        </div>

        {/* Hospital list */}
        <div className="space-y-4">
          {loadingHospitals ? (
            <div className="text-center py-16 text-zinc-400">Loading hospitals...</div>
          ) : filtered.length === 0 && hospitals.length === 0 ? (
            <div className="text-center py-16 text-zinc-500">No hospitals found. Please try again.</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-zinc-500">No hospitals match this filter.</div>
          ) : filtered.map(hospital => (
            <div key={hospital._id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              {/* Hospital header */}
              <div className="p-5 cursor-pointer" onClick={() => setExpanded(expanded === hospital._id ? null : hospital._id)}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h2 className="font-bold text-lg">{hospital.name}</h2>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${hospital.isOpen ? "bg-green-900 text-green-400 border-green-800" : "bg-red-900 text-red-400 border-red-800"}`}>
                        {hospital.isOpen ? "Open" : "Closed"}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-sm flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{hospital.address}</p>
                    <div className="flex items-center gap-4 mt-2 flex-wrap text-sm">
                      <span className="flex items-center gap-1 text-yellow-400"><Star className="w-3.5 h-3.5 fill-yellow-400" />{hospital.rating}</span>
                      <span className="text-zinc-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{hospital.openHours}</span>
                      <span className="text-zinc-400">🛏 {hospital.availableBeds}/{hospital.totalBeds} beds</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(hospital.specializations || []).map(s => <span key={s} className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">{s}</span>)}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <a href={`tel:${hospital.ambulanceNumber}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-700 hover:bg-red-600 rounded-xl text-xs font-medium transition-colors">
                      <Ambulance className="w-3.5 h-3.5" /> Ambulance
                    </a>
                    <a href={`tel:${hospital.phone}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs transition-colors">
                      <Phone className="w-3.5 h-3.5" /> {hospital.phone}
                    </a>
                    {expanded === hospital._id ? <ChevronUp className="w-4 h-4 text-zinc-500 mt-1" /> : <ChevronDown className="w-4 h-4 text-zinc-500 mt-1" />}
                  </div>
                </div>
              </div>

              {/* Doctors */}
              <AnimatePresence>
                {expanded === hospital._id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-zinc-800 overflow-hidden">
                    <div className="p-5 space-y-4">
                      <h3 className="font-semibold text-zinc-300 text-sm">Available Doctors</h3>
                      {(hospital.doctors || []).map((doc, i) => (
                        <div key={i} className={`border rounded-xl p-4 transition-colors cursor-pointer ${selectedDoctor?.doctor.name === doc.name && selectedDoctor.hospitalId === hospital._id ? "border-blue-500 bg-blue-950/30" : "border-zinc-700 hover:border-zinc-500"}`}
                          onClick={() => { setSelectedDoctor({ hospitalId: hospital._id, doctor: doc }); setSelectedSlot(null); }}>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-semibold">{doc.name}</p>
                              <p className="text-zinc-400 text-sm">{doc.specialty} · {doc.experience} yrs exp</p>
                              <div className="flex items-center gap-3 mt-1 text-sm">
                                <span className="flex items-center gap-1 text-yellow-400"><Star className="w-3 h-3 fill-yellow-400" />{doc.rating}</span>
                                <span className="text-green-400">₹{doc.consultationFee}</span>
                              </div>
                            </div>
                          </div>

                          {/* Slots */}
                          {selectedDoctor?.doctor.name === doc.name && selectedDoctor.hospitalId === hospital._id && (
                            <div className="mt-4">
                              <p className="text-xs text-zinc-400 mb-2">Select a slot:</p>
                              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                {(doc.availableSlots || []).map(slot => (
                                  <button key={slot} onClick={e => { e.stopPropagation(); setSelectedSlot(slot); }}
                                    className={`px-3 py-1 rounded-lg text-xs border transition-colors ${selectedSlot === slot ? "bg-blue-600 border-blue-600 text-white" : "border-zinc-600 text-zinc-300 hover:border-blue-500"}`}>
                                    {slot}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Booking panel */}
      <AnimatePresence>
        {selectedDoctor && selectedSlot && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 p-4 z-50">
            <div className="max-w-4xl mx-auto flex flex-wrap items-center gap-4 justify-between">
              <div>
                <p className="font-semibold">{selectedDoctor.doctor.name} · {selectedSlot}</p>
                <p className="text-zinc-400 text-sm">{hospitals.find(h => h._id === selectedDoctor.hospitalId)?.name}</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split("T")[0]}
                  className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white outline-none" />
                <div className="flex bg-zinc-800 rounded-xl p-1">
                  {(["in-person", "video"] as const).map(t => (
                    <button key={t} onClick={() => setType(t)} className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${type === t ? "bg-blue-600 text-white" : "text-zinc-400"}`}>{t}</button>
                  ))}
                </div>
                <button onClick={confirmBooking} disabled={booking}
                  className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl font-semibold text-sm transition-colors">
                  <Calendar className="w-4 h-4" /> {booking ? "Booking..." : "Confirm"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success toast */}
      <AnimatePresence>
        {booked && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-6 right-6 bg-green-900 border border-green-700 text-green-300 px-5 py-3 rounded-xl flex items-center gap-2 z-50 shadow-xl">
            <CheckCircle className="w-5 h-5" /> Appointment booked successfully!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
