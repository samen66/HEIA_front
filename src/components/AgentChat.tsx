import { useState } from "react";
import { Bot, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { API_UNAVAILABLE_MESSAGE } from "@/lib/apiErrors";
import { useRole } from "@/context/RoleContext";

interface Message {
  role: "user" | "agent";
  text: string;
}

interface Props {
  selectedCardId?: string;
}

const SUGGESTIONS = [
  "What are the model accuracy and ROC-AUC?",
  "Summarize portfolio segments and opportunity value",
  "Which feature drives predictions the most?",
];

export function AgentChat({ selectedCardId }: Props) {
  const { role } = useRole();
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "agent",
      text: "I'm HEIS — your Hidden Entrepreneur Intelligence System. Ask about cardholders, segments, model metrics, or features. Select a row in the scores table to get card-specific answers.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const ask = async (q: string) => {
    if (!q.trim()) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setQuestion("");
    setLoading(true);
    try {
      const res = await api.askAgent(q, role ?? "guest");
      setMessages((m) => [...m, { role: "agent", text: res.answer }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "agent", text: API_UNAVAILABLE_MESSAGE },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          HEIS Agent
          {selectedCardId && (
            <span className="text-xs font-normal text-[var(--color-muted-foreground)]">
              · context: {selectedCardId}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs hover:bg-[var(--color-accent)]"
              onClick={() => ask(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="max-h-64 space-y-3 overflow-y-auto rounded-md border border-[var(--color-border)] bg-[var(--color-muted)]/20 p-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={
                msg.role === "user"
                  ? "ml-8 rounded-lg bg-[var(--color-primary)] px-3 py-2 text-sm text-[var(--color-primary-foreground)]"
                  : "mr-8 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] px-3 py-2 text-sm"
              }
            >
              {msg.text}
            </div>
          ))}
          {loading && (
            <p className="text-sm text-[var(--color-muted-foreground)]">Thinking…</p>
          )}
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            ask(question);
          }}
        >
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask HEIS about this portfolio…"
            disabled={loading}
          />
          <Button type="submit" size="default" disabled={loading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
