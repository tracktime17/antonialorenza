import { createClient } from "@/lib/supabase/server";
import { getAiMessages } from "@/lib/data";
import { PROFILE_ID } from "@/lib/profile";
import { Chat } from "@/components/ai/chat";

export default async function AiPage() {
  const supabase = createClient();
  const history = await getAiMessages(supabase, PROFILE_ID, 50);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-app-muted">ia</p>
        <h1 className="text-xl font-extrabold text-app-text-bright">Tu IA personal</h1>
        <p className="mt-1 text-xs text-app-muted">
          Conoce tu entrenamiento, nutricion, finanzas, proyectos y objetivos reales — no otros modulos aun sin construir (habitos).
        </p>
      </div>

      <Chat initialMessages={(history ?? []).map((m) => ({ role: m.role as "user" | "assistant", content: m.content }))} />
    </div>
  );
}
