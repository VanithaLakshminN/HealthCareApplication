import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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

    // 1. Transcribe speech
    console.log("[voice] Starting transcription...");
    const { text } = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
    });
    console.log("[voice] Transcribed:", text);

    if (!text) {
      return new Response(JSON.stringify({ error: "Empty transcription" }), { status: 400 });
    }

    // 2. Chat response in Hindi (short answer)
    console.log("[voice] Getting chat response...");
    const chat = await openai.chat.completions.create({
      model: "gpt-4o-mini",
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

    // 3. Convert reply to speech
    console.log("[voice] Generating TTS...");
    const speech = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: reply,
    });

    const buffer = Buffer.from(await speech.arrayBuffer());
    console.log("[voice] TTS buffer size:", buffer.length);

    return new Response(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
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
