"use client";
import { useEffect, useRef } from "react";

export default function VoiceAgent() {
  const pcRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    const init = async () => {
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      // Play incoming audio
      const audioEl = document.createElement("audio");
      audioEl.autoplay = true;
      pc.ontrack = (event) => {
        audioEl.srcObject = event.streams[0];
      };

      // Mic input
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Get session client_secret from our API
      const tokenRes = await fetch("/api/session");
      const data = (await tokenRes.json()) as any;

      // Send SDP to OpenAI Realtime API
      const resp = await fetch(
        "https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17",
        {
          method: "POST",
          body: offer.sdp,
          headers: {
            Authorization: `Bearer ${data.client_secret.value}`,
            "Content-Type": "application/sdp",
          },
        }
      );

      const answer:RTCSessionDescriptionInit = {
        type: "answer",
        sdp: await resp.text(),
      };
      await pc.setRemoteDescription(answer);
    };

    init();
  }, []);

  return <button>🎙️ Voice Agent Active</button>;
}
