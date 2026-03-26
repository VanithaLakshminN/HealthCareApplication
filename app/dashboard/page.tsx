"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FileText, Calendar, Pill, Upload, Trash2, Heart, Plus, X, Eye } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

type Tab = "overview" | "records" | "prescriptions";
type MedRecord = { _id: string; type: string; title: string; doctor: string; hospital: string; date: string; notes: string; fileUrl?: string; fileName?: string };
type Appointment = { _id: string; hospitalName: string; doctorName: string; doctorSpecialty: string; date: string; slot: string; status: string; type: string };

const RECORD_TYPES = ["prescription", "xray", "scan", "lab", "discharge", "other"];

export default function Dashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [user, setUser] = useState<any>(null);
  const [records, setRecords] = useState<MedRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [newRecord, setNewRecord] = useState({ type: "prescription", title: "", doctor: "", hospital: "", date: "", notes: "", fileUrl: "", fileName: "" });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then(r => r.json()),
      fetch("/api/records").then(r => r.json()),
      fetch("/api/appointments").then(r => r.json()),
    ]).then(([u, rec, appt]) => {
      if (!u.user) { router.push("/"); return; }
      setUser(u.user);
      setRecords(rec.records || []);
      setAppointments(appt.appointments || []);
      setLoading(false);
    });
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setNewRecord(r => ({ ...r, fileUrl: reader.result as string, fileName: file.name }));
    reader.readAsDataURL(file);
  };

  const addRecord = async () => {
    const res = await fetch("/api/records", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newRecord) });
    const data = await res.json();
    setRecords(r => [data.record, ...r]);
    setShowAddRecord(false);
    setNewRecord({ type: "prescription", title: "", doctor: "", hospital: "", date: "", notes: "", fileUrl: "", fileName: "" });
  };

  const deleteRecord = async (id: string) => {
    await fetch(`/api/records/${id}`, { method: "DELETE" });
    setRecords(r => r.filter(x => x._id !== id));
  };

  const upcoming = appointments.filter(a => a.status === "upcoming");
  const prescriptions = records.filter(r => r.type === "prescription");
  const filteredRecords = filterType === "all" ? records : records.filter(r => r.type === filterType);

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Profile banner */}
        <div className="bg-gradient-to-r from-blue-900/40 to-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center gap-5 mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{user?.name}</h1>
            <p className="text-zinc-400 text-sm">{user?.email}</p>
          </div>
          {/* Quick action buttons */}
          <div className="hidden md:flex gap-3">
            <Link href="/appointments" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium transition-colors">
              <Calendar className="w-4 h-4" /> Book Appointment
            </Link>
            <Link href="/pharmacy" className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-600 rounded-xl text-sm font-medium transition-colors">
              <Pill className="w-4 h-4" /> Find Pharmacy
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-zinc-800 pb-2">
          {([
            { key: "overview", label: "Overview", icon: Heart },
            { key: "records", label: "Medical Records", icon: FileText },
            { key: "prescriptions", label: "Prescriptions", icon: Pill },
          ] as { key: Tab; label: string; icon: any }[]).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === t.key ? "bg-blue-600 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800"}`}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === "overview" && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Medical Records", value: records.length, color: "text-blue-400", icon: FileText },
                { label: "Prescriptions", value: prescriptions.length, color: "text-purple-400", icon: Pill },
                { label: "Upcoming Appts", value: upcoming.length, color: "text-green-400", icon: Calendar },
                { label: "Total Visits", value: appointments.filter(a => a.status === "completed").length, color: "text-orange-400", icon: Heart },
              ].map(s => (
                <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                  <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-zinc-400 text-xs mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Upcoming appointments */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Upcoming Appointments</h3>
                <Link href="/appointments" className="text-blue-400 text-sm hover:underline">Book new →</Link>
              </div>
              {upcoming.length === 0 ? (
                <p className="text-zinc-500 text-sm">No upcoming appointments. <Link href="/appointments" className="text-blue-400 hover:underline">Book one now</Link></p>
              ) : (
                <div className="space-y-3">
                  {upcoming.map(a => (
                    <div key={a._id} className="flex items-center justify-between bg-zinc-800 rounded-xl p-4">
                      <div>
                        <p className="font-semibold text-sm">{a.doctorName}</p>
                        <p className="text-zinc-400 text-xs">{a.hospitalName} · {a.doctorSpecialty}</p>
                        <p className="text-blue-400 text-xs mt-1">{a.date} at {a.slot}</p>
                      </div>
                      <span className="text-xs bg-green-900 text-green-400 border border-green-800 px-2 py-1 rounded-full">Upcoming</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent records */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Recent Medical Records</h3>
                <button onClick={() => setTab("records")} className="text-blue-400 text-sm hover:underline">View all →</button>
              </div>
              {records.length === 0 ? (
                <p className="text-zinc-500 text-sm">No records yet. <button onClick={() => setShowAddRecord(true)} className="text-blue-400 hover:underline">Add your first record</button></p>
              ) : (
                <div className="space-y-2">
                  {records.slice(0, 3).map(r => (
                    <div key={r._id} className="flex items-center gap-3 bg-zinc-800 rounded-xl p-3">
                      <span className="text-xs bg-blue-900 text-blue-300 border border-blue-800 px-2 py-0.5 rounded-full capitalize shrink-0">{r.type}</span>
                      <p className="text-sm font-medium flex-1 truncate">{r.title}</p>
                      <p className="text-zinc-500 text-xs shrink-0">{r.date}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Medical Records */}
        {tab === "records" && (
          <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setFilterType("all")} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${filterType === "all" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>All</button>
                {RECORD_TYPES.map(t => (
                  <button key={t} onClick={() => setFilterType(t)} className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-colors ${filterType === t ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>{t}</button>
                ))}
              </div>
              <button onClick={() => setShowAddRecord(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium transition-colors">
                <Plus className="w-4 h-4" /> Add Record
              </button>
            </div>

            {filteredRecords.length === 0 ? (
              <div className="text-center py-16 text-zinc-500">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No records found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRecords.map(r => (
                  <motion.div key={r._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs bg-blue-900 text-blue-300 border border-blue-800 px-2 py-0.5 rounded-full capitalize shrink-0">{r.type}</span>
                        <h3 className="font-semibold truncate">{r.title}</h3>
                      </div>
                      {(r.doctor || r.hospital) && (
                        <p className="text-zinc-400 text-sm">{r.doctor && `Dr. ${r.doctor}`}{r.hospital && ` · ${r.hospital}`}</p>
                      )}
                      <p className="text-zinc-500 text-xs mt-1">{r.date}</p>
                      {r.notes && <p className="text-zinc-400 text-sm mt-2 line-clamp-2">{r.notes}</p>}
                      {r.fileUrl && (
                        <a href={r.fileUrl} download={r.fileName} className="text-blue-400 text-xs mt-2 inline-flex items-center gap-1 hover:underline">
                          <Eye className="w-3 h-3" /> {r.fileName || "View file"}
                        </a>
                      )}
                    </div>
                    <button onClick={() => deleteRecord(r._id)} className="text-zinc-600 hover:text-red-400 transition-colors shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Prescriptions */}
        {tab === "prescriptions" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-zinc-400 text-sm">Prescriptions from all hospitals including external ones you've uploaded.</p>
              <button onClick={() => { setNewRecord(r => ({...r, type: "prescription"})); setShowAddRecord(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium transition-colors">
                <Upload className="w-4 h-4" /> Upload Prescription
              </button>
            </div>

            {prescriptions.length === 0 ? (
              <div className="text-center py-16 text-zinc-500">
                <Pill className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No prescriptions yet.</p>
                <button onClick={() => { setNewRecord(r => ({...r, type: "prescription"})); setShowAddRecord(true); }}
                  className="mt-3 text-blue-400 text-sm hover:underline">Upload your first prescription</button>
              </div>
            ) : (
              <div className="space-y-3">
                {prescriptions.map(r => (
                  <div key={r._id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold">{r.title}</h3>
                      {(r.doctor || r.hospital) && (
                        <p className="text-zinc-400 text-sm">{r.doctor && `Dr. ${r.doctor}`}{r.hospital && ` · ${r.hospital}`}</p>
                      )}
                      <p className="text-zinc-500 text-xs mt-1">{r.date}</p>
                      {r.notes && <p className="text-zinc-400 text-sm mt-2">{r.notes}</p>}
                      {r.fileUrl && (
                        <a href={r.fileUrl} download={r.fileName} className="text-blue-400 text-xs mt-2 inline-flex items-center gap-1 hover:underline">
                          <Eye className="w-3 h-3" /> {r.fileName || "View prescription"}
                        </a>
                      )}
                    </div>
                    <button onClick={() => deleteRecord(r._id)} className="text-zinc-600 hover:text-red-400 transition-colors shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Record Modal */}
      {showAddRecord && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Add Medical Record</h3>
              <button onClick={() => setShowAddRecord(false)}><X className="w-5 h-5 text-zinc-400" /></button>
            </div>
            <div className="space-y-3">
              <select value={newRecord.type} onChange={e => setNewRecord(r => ({...r, type: e.target.value}))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500">
                {RECORD_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
              <input value={newRecord.title} onChange={e => setNewRecord(r => ({...r, title: e.target.value}))} placeholder="Title *"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500" />
              <div className="grid grid-cols-2 gap-3">
                <input value={newRecord.doctor} onChange={e => setNewRecord(r => ({...r, doctor: e.target.value}))} placeholder="Doctor name"
                  className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500" />
                <input value={newRecord.hospital} onChange={e => setNewRecord(r => ({...r, hospital: e.target.value}))} placeholder="Hospital name"
                  className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500" />
              </div>
              <input value={newRecord.date} onChange={e => setNewRecord(r => ({...r, date: e.target.value}))} type="date"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500" />
              <textarea value={newRecord.notes} onChange={e => setNewRecord(r => ({...r, notes: e.target.value}))} placeholder="Notes / details" rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500 resize-none" />
              <div>
                <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} className="hidden" />
                <button onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-xl px-4 py-2.5 w-full transition-colors">
                  <Upload className="w-4 h-4" />
                  {newRecord.fileName ? `✓ ${newRecord.fileName}` : "Upload file (PDF / Image / X-ray / Scan)"}
                </button>
              </div>
              <button onClick={addRecord} disabled={!newRecord.title}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl font-semibold transition-colors">
                Save Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
