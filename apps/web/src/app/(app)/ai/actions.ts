"use server";

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { PROFILE_ID } from "@/lib/profile";
import { getAiMessages } from "@/lib/data";
import { buildLifeContext } from "@/lib/ai/life-context";

const SYSTEM_PROMPT_INTRO = `Eres la IA personal de Antonia dentro de su sistema operativo personal (antonia_os). Respondes en español, de forma directa y concisa, basandote unicamente en los datos reales provistos abajo. Si no tienes informacion suficiente para responder algo con certeza, dilo explicitamente en vez de inventar numeros o hechos. No afirmes conclusiones medicas ni financieras definitivas; sugiere en vez de afirmar cuando el dato sea ambiguo o incompleto.

Snapshot de la vida de Antonia (entrenamiento, nutricion, finanzas, proyectos, objetivos):
`;

export async function sendMessage(question: string): Promise<{ reply: string } | { error: string }> {
  if (!question.trim()) return { error: "Pregunta vacia." };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { error: "Falta configurar ANTHROPIC_API_KEY en .env.local. Avisa a Claude Code para terminar de conectarlo." };
  }

  const supabase = createClient();
  const [context, history] = await Promise.all([
    buildLifeContext(supabase, PROFILE_ID),
    getAiMessages(supabase, PROFILE_ID, 20),
  ]);

  const client = new Anthropic({ apiKey });

  const messages: Anthropic.MessageParam[] = [
    ...(history ?? []).map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    { role: "user", content: question },
  ];

  let reply: string;
  try {
    const response = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT_INTRO + context,
      messages,
    });
    const textBlock = response.content.find((b) => b.type === "text");
    reply = textBlock && "text" in textBlock ? textBlock.text : "No pude generar una respuesta.";
  } catch (err) {
    return { error: `Error llamando a la API de Anthropic: ${err instanceof Error ? err.message : String(err)}` };
  }

  await supabase.from("ai_messages").insert([
    { profile_id: PROFILE_ID, role: "user", content: question },
    { profile_id: PROFILE_ID, role: "assistant", content: reply },
  ]);

  return { reply };
}
