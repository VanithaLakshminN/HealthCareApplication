// Sarvam AI TTS — purpose-built for Indian languages (Kannada, Telugu, Hindi etc.)
// Docs: https://docs.sarvam.ai/api-reference-docs/api-guides-tutorials/text-to-speech/rest-api

const LANG_MAP: Record<string, { code: string; speaker: string }> = {
  hi: { code: "hi-IN", speaker: "anand" },
  kn: { code: "kn-IN", speaker: "kavitha" },
  te: { code: "te-IN", speaker: "roopa" },
};

export async function POST(req: Request) {
  try {
    const { text, language = "hi" } = await req.json();

    if (!text) {
      return new Response(JSON.stringify({ error: "No text provided" }), { status: 400 });
    }

    const lang = LANG_MAP[language] ?? LANG_MAP["hi"];

    const res = await fetch("https://api.sarvam.ai/text-to-speech", {
      method: "POST",
      headers: {
        "api-subscription-key": process.env.SARVAM_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: [text],
        target_language_code: lang.code,
        speaker: lang.speaker,
        model: "bulbul:v3",
        enable_preprocessing: true,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[tts] Sarvam error:", err);
      return new Response(JSON.stringify({ error: err }), { status: res.status });
    }

    const data = await res.json();
    const audioBase64 = data.audios?.[0];

    if (!audioBase64) {
      return new Response(JSON.stringify({ error: "No audio returned" }), { status: 500 });
    }

    return new Response(JSON.stringify({ audio: audioBase64 }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[tts] Error:", error?.message || error);
    return new Response(
      JSON.stringify({ error: error?.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
