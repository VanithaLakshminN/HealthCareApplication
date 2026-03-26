import { NextResponse } from "next/server";

export async function GET() {
  // Create a temporary client_secret for the browser
  const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer sk-e2Fd4IckiQUA9jvxXvqwJw`,
    //   "baseURL": "https://api.znapai.com/",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-realtime-preview-2024-12-17",
      voice: "alloy",
    }),
  });

  const data = await r.json();
  return NextResponse.json(data);
}