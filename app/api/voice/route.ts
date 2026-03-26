import OpenAI from "openai";

// Groq is OpenAI-SDK compatible, just different baseURL and models
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.error("[voice] No file received");
      return new Response("No audio file received", { status: 400 });
    }

    console.log("[voice] File received:", file.name, file.size, "bytes");

    // 1. Transcribe speech using Groq Whisper
    console.log("[voice] Starting transcription...");
    const { text } = await groq.audio.transcriptions.create({
      file,
      model: "whisper-large-v3",
    });
    console.log("[voice] Transcribed:", text);

    if (!text) {
      return new Response(JSON.stringify({ error: "Empty transcription" }), { status: 400 });
    }

    // 2. Chat response in Hindi using Groq LLaMA
    console.log("[voice] Getting chat response...");
    const chat = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content:
            "Reply shortly in Hindi. You are a health advice assistant who provides safe, practical, easy-to-follow guidance on common health issues, always reminding users you are not a doctor and to seek professional help for serious concerns, try to give some home remedies",
        },
        { role: "user", content: text },
      ],
    });
    const reply = chat.choices[0].message?.content ?? "समझ नहीं आया।";
    console.log("[voice] Reply:", reply);

    // 3. Convert reply to speech using OpenAI TTS (Groq has no TTS yet)
    // We use a free browser-based TTS fallback instead
    return new Response(JSON.stringify({ reply, transcription: text }), {
      headers: {
        "Content-Type": "application/json",
        "X-Reply": encodeURIComponent(reply),
      },
    });
  } catch (error: any) {
    console.error("[voice] Error:", error?.message || error);
    return new Response(
      JSON.stringify({ error: error?.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
