"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { User, FileText, Calendar, Pill, Upload, Trash2, LogOut, Heart, Plus, X, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

type Tab = "overview" | "records" | "appointments" | "prescriptions";
type Record = { _id: string; type: string; title: string; doctor: string; hospital: string; date: string; notes: string; fileUrl?: string; fileName?: string };
type Appointment = { _id: string; hospitalName: string; doctorName: string; doctorSpecialty: string; date: string; slot: string; status: string; type: string };

export default function Dashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [user, setUser] = useState<any>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddRecord, setShowAddRecord] = useState(false);
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

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

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

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Loading...</div>;

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "overview", label: "Overview", icon: Heart },
    { key: "records", label: "Medical Records", icon: FileText },
    { key: "appointments", label: "Appointments", icon: Calendar },
    { key: "prescriptions", label: "Prescriptions", icon: Pill },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <Link href="/home" className="flex items-center gap-2">
          <div className="bg-blue-600 rounded-lg p-1.5"><Heart className="w-5 h-5 text-white" /></div>
          <span className="font-bold">HealthCare Pro</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-zinc-400 text-sm">Welcome, {user?.name}</span>
          <button onClick={logout} className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 flex gap-6">
        {/* Sidebar */}
        <div className="w-56 shrink-0 space-y-1">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${tab === t.key ? "bg-blue-600 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}`}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
          <Link href="/ai" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">
            <MessageCircle className="w-4 h-4" /> AI Assistant
          </Link>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">

          {/* Overview */}
          {tab === "overview" && (
            <div className="space-y-6">
              {/* Profile card */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center gap-6">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{user?.name}</h2>
                  <p className="text-zinc-400 text-sm">{user?.email}</p>
                  {user?.bloodGroup && <span className="text-xs bg-red-900 text-red-300 border border-red-800 px-2 py-0.5 rounded-full mt-1 inline-block">Blood: {user.bloodGroup}</span>}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Total Records", value: records.length, color: "text-blue-400" },
                  { label: "Upcoming Appointments", value: upcoming.length, color: "text-green-400" },
                  { label: "Prescriptions", value: prescriptions.length, color: "text-purple-400" },
                ].map(s => (
                  <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-center">
                    <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-zinc-400 text-sm mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Next appointment */}
              {upcoming[0] && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                  <h3 className="font-semibold mb-3 text-zinc-300">Next Appointment</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{upcoming[0].doctorName}</p>
                      <p className="text-zinc-400 text-sm">{upcoming[0].hospitalName} · {upcoming[0].doctorSpecialty}</p>
                      <p className="text-blue-400 text-sm mt-1">{upcoming[0].date} at {upcoming[0].slot}</p>
                    </div>
                    <span className="text-xs bg-green-900 text-green-400 border border-green-800 px-3 py-1 rounded-full">Upcoming</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Medical Records */}
          {tab === "records" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Medical Records</h2>
                <button onClick={() => setShowAddRecord(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium transition-colors">
                  <Plus className="w-4 h-4" /> Add Record
                </button>
              </div>

              {records.length === 0 ? (
                <div className="text-center py-16 text-zinc-500">
                  <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No records yet. Add your first medical record.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {records.map(r => (
                    <div key={r._id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs bg-blue-900 text-blue-300 border border-blue-800 px-2 py-0.5 rounded-full capitalize">{r.type}</span>
                          <h3 className="font-semibold">{r.title}</h3>
                        </div>
                        <p className="text-zinc-400 text-sm">{r.doctor && `Dr. ${r.doctor}`}{r.hospital && ` · ${r.hospital}`}</p>
                        <p className="text-zinc-500 text-xs mt-1">{r.date}</p>
                        {r.notes && <p className="text-zinc-400 text-sm mt-2">{r.notes}</p>}
                        {r.fileUrl && (
                          <a href={r.fileUrl} download={r.fileName} className="text-blue-400 text-xs mt-2 inline-flex items-center gap-1 hover:underline">
                            <FileText className="w-3 h-3" /> {r.fileName || "Download file"}
                          </a>
                        )}
                      </div>
                      <button onClick={() => deleteRecord(r._id)} className="text-zinc-600 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Appointments */}
          {tab === "appointments" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">My Appointments</h2>
                <Link href="/appointments" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium transition-colors">
                  <Plus className="w-4 h-4" /> Book New
                </Link>
              </div>
              {appointments.length === 0 ? (
                <div className="text-center py-16 text-zinc-500">
                  <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No appointments yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map(a => (
                    <div key={a._id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{a.doctorName}</p>
                          <p className="text-zinc-400 text-sm">{a.hospitalName} · {a.doctorSpecialty}</p>
                          <p className="text-blue-400 text-sm mt-1">{a.date} at {a.slot}</p>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full border ${a.status === "upcoming" ? "bg-green-900 text-green-400 border-green-800" : a.status === "completed" ? "bg-zinc-800 text-zinc-400 border-zinc-700" : "bg-red-900 text-red-400 border-red-800"}`}>
                          {a.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Prescriptions */}
          {tab === "prescriptions" && (
            <div>
              <h2 className="text-xl font-bold mb-6">Prescriptions</h2>
              {prescriptions.length === 0 ? (
                <div className="text-center py-16 text-zinc-500">
                  <Pill className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No prescriptions yet. Add them via Medical Records.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {prescriptions.map(r => (
                    <div key={r._id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                      <h3 className="font-semibold">{r.title}</h3>
                      <p className="text-zinc-400 text-sm">{r.doctor && `Dr. ${r.doctor}`}{r.hospital && ` · ${r.hospital}`}</p>
                      <p className="text-zinc-500 text-xs mt-1">{r.date}</p>
                      {r.notes && <p className="text-zinc-400 text-sm mt-2">{r.notes}</p>}
                      {r.fileUrl && (
                        <a href={r.fileUrl} download={r.fileName} className="text-blue-400 text-xs mt-2 inline-flex items-center gap-1 hover:underline">
                          <FileText className="w-3 h-3" /> {r.fileName}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Record Modal */}
      {showAddRecord && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Add Medical Record</h3>
              <button onClick={() => setShowAddRecord(false)}><X className="w-5 h-5 text-zinc-400" /></button>
            </div>
            <div className="space-y-3">
              <select value={newRecord.type} onChange={e => setNewRecord(r => ({...r, type: e.target.value}))} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500">
                {["prescription","xray","scan","lab","discharge","other"].map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
              <input value={newRecord.title} onChange={e => setNewRecord(r => ({...r, title: e.target.value}))} placeholder="Title *" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500" />
              <div className="grid grid-cols-2 gap-3">
                <input value={newRecord.doctor} onChange={e => setNewRecord(r => ({...r, doctor: e.target.value}))} placeholder="Doctor name" className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500" />
                <input value={newRecord.hospital} onChange={e => setNewRecord(r => ({...r, hospital: e.target.value}))} placeholder="Hospital" className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500" />
              </div>
              <input value={newRecord.date} onChange={e => setNewRecord(r => ({...r, date: e.target.value}))} type="date" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500" />
              <textarea value={newRecord.notes} onChange={e => setNewRecord(r => ({...r, notes: e.target.value}))} placeholder="Notes / details" rows={3} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500 resize-none" />
              <div>
                <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} className="hidden" />
                <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white border border-zinc-700 rounded-xl px-4 py-2 transition-colors">
                  <Upload className="w-4 h-4" /> {newRecord.fileName || "Upload file (PDF/Image)"}
                </button>
              </div>
              <button onClick={addRecord} disabled={!newRecord.title} className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl font-semibold transition-colors">
                Save Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
