"use client";

import { useRef, useState, useTransition } from "react";
import { sendMessage } from "@/app/(app)/ai/actions";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "¿Como voy respecto al Ironman 70.3 Lima Debut Elite?",
  "¿Cuanto entrene esta semana?",
  "¿Que proyecto esta atrasado?",
  "¿Cuanto dinero puedo gastar este mes?",
];

export function Chat({ initialMessages }: { initialMessages: Message[] }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  function ask(question: string) {
    if (!question.trim() || isPending) return;
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    startTransition(async () => {
      const result = await sendMessage(question);
      if ("error" in result) {
        setError(result.error);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: result.reply }]);
      }
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    });
  }

  return (
    <div className="flex h-[70vh] flex-col rounded border border-app-border bg-app-panel">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs italic text-app-muted-2">Preguntale algo a tu IA personal. Ejemplos:</p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => ask(s)}
                className="block w-full rounded border border-dashed border-app-border px-3 py-2 text-left text-xs text-app-muted hover:border-run hover:text-run"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded px-3 py-2 text-sm ${
              m.role === "user" ? "ml-auto bg-run text-white" : "bg-app-panel-2 text-app-text"
            }`}
          >
            <p className="whitespace-pre-wrap">{m.content}</p>
          </div>
        ))}
        {isPending && <p className="text-xs italic text-app-muted-2">pensando...</p>}
        {error && <p className="text-xs text-expense">{error}</p>}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="flex gap-2 border-t border-app-border p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Preguntale a tu IA..."
          className="flex-1 rounded border border-app-border bg-white px-3 py-2 text-sm"
        />
        <button type="submit" disabled={isPending} className="rounded bg-run px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
          enviar
        </button>
      </form>
    </div>
  );
}
