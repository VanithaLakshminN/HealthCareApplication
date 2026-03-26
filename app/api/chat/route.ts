import OpenAI from "openai";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: "No message provided" }), { status: 400 });
    }

    const chat = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful health advice assistant. Provide safe, practical guidance on common health issues. Always remind users you are not a doctor and to seek professional help for serious concerns. Give home remedies where appropriate. Reply in the same language the user writes in.",
        },
        { role: "user", content: message },
      ],
    });

    const reply = chat.choices[0].message?.content ?? "Sorry, I could not process that.";
    return new Response(JSON.stringify({ reply }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[chat] Error:", error?.message || error);
    return new Response(
      JSON.stringify({ error: error?.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
