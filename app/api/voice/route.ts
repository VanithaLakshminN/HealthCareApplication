import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "sk-e2Fd4IckiQUA9jvxXvqwJw",
  baseURL: "https://api.znapai.com/",
});

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  // 1. Transcribe speech
  const { text } = await openai.audio.transcriptions.create({
    file,
    model: "gpt-4o-mini-transcribe",
  });

  // 2. Chat response in Hindi (short answer)
  const chat = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Reply shortly in Hindi.  You are a health advice assistant who provides safe, practical, easy-to-follow guidance on common health issues, always reminding users you are not a doctor and to seek professional help for serious concerns, try to give some home remedies  ",
      },
      { role: "user", content: text },
    ],
  });
  const reply = chat.choices[0].message?.content ?? "समझ नहीं आया।";

  // 3. Convert reply to speech
  const speech = await openai.audio.speech.create({
    model: "gpt-4o-mini-tts",
    voice: "alloy",
    input: reply,
  });

  const buffer = Buffer.from(await speech.arrayBuffer());

  return new Response(buffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "X-Reply": encodeURIComponent(reply),
    },
  });
}
