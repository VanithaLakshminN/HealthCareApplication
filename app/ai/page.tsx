"use client";

import { useState, useRef } from "react";
import { Mic, Square } from "lucide-react";
import { motion } from "framer-motion";

export default function VoiceAgent() {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "agent"; text: string }[]>([]);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    chunks.current = [];

    mediaRecorder.current.ondataavailable = (e) => chunks.current.push(e.data);

    mediaRecorder.current.onstop = async () => {
      setLoading(true);
      try {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("file", blob, "voice.webm");

        const res = await fetch("/api/voice", { method: "POST", body: formData });

        if (!res.ok) {
          const err = await res.text();
          setMessages((m) => [...m, { role: "agent", text: `Error: ${err}` }]);
          return;
        }

        const textReply = decodeURIComponent(res.headers.get("X-Reply") || "");
        const audioBlob = await res.blob();

        setMessages((m) => [...m, { role: "user", text: "🎤 Voice message" }]);
        setMessages((m) => [...m, { role: "agent", text: textReply || "No reply received" }]);

        const url = URL.createObjectURL(audioBlob);
        new Audio(url).play();
      } catch (e) {
        setMessages((m) => [...m, { role: "agent", text: `Failed: ${String(e)}` }]);
      } finally {
        setLoading(false);
      }
    };

    mediaRecorder.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setRecording(false);
  };

  return (
    <div className="flex h-[80vh] items-center justify-center bg-zinc-950 text-white">
      <div className="w-full max-w-md h-[600px] flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl shadow-lg">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 max-w-[80%] rounded-2xl text-sm ${
                m.role === "user"
                  ? "ml-auto bg-blue-600"
                  : "mr-auto bg-zinc-800 border border-zinc-700"
              }`}
            >
              {m.text}
            </motion.div>
          ))}
        </div>

        {/* Mic Button */}
        <div className="p-4 border-t border-zinc-800 flex flex-col items-center gap-2">
          {loading && <p className="text-xs text-zinc-400 animate-pulse">Processing...</p>}
          <motion.button
            onClick={recording ? stopRecording : startRecording}
            disabled={loading}
            className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-600 text-white shadow-lg disabled:opacity-50"
            animate={recording ? { scale: [1, 1.2, 1] } : {}}
            transition={recording ? { repeat: Infinity, duration: 1.2 } : {}}
          >
            {recording ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
