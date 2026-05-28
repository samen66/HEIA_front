import { useRef, useEffect, useState } from "react";
import { Bot, Send, User } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRole } from "@/context/RoleContext";
import { api, type AgentQuestionResponse } from "@/lib/api";
import { API_UNAVAILABLE_MESSAGE } from "@/lib/apiErrors";
import { cn } from "@/lib/utils";

const SUGGESTED_QUESTIONS = [
  "What is the expected revenue if conversion rate increases to 12%?",
  "How many high-opportunity customers are there?",
  "Which bank has the most hidden entrepreneurs?",
  "What is the top reason customers are flagged?",
  "What products should we offer to High segment?",
  "What is the ROI at 15% conversion rate?",
] as const;

interface ChatMessage {
  id: string;
  role: "user" | "agent";
  question?: string;
  answer?: string;
  supporting_data?: Record<string, string | number>;
}

function formatKpiKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/Kzt/g, "KZT")
    .replace(/Pct/g, "%")
    .replace(/Roi/g, "ROI");
}

function formatKpiValue(value: string | number): string {
  if (typeof value === "number") {
    if (Math.abs(value) >= 1_000_000) {
      return `₸${(value / 1_000_000).toFixed(1)}M`;
    }
    if (Math.abs(value) >= 1_000) {
      return value.toLocaleString("en-US");
    }
    if (Number.isInteger(value) || value % 1 === 0) {
      return String(Math.round(value));
    }
    return value.toFixed(1);
  }
  return String(value);
}

function AgentAnswerCard({ response }: { response: AgentQuestionResponse }) {
  const entries = Object.entries(response.supporting_data ?? {});

  return (
    <div className="mr-4 max-w-[92%] space-y-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 shadow-sm">
      <div className="flex items-start gap-2">
        <Bot className="mt-0.5 h-4 w-4 shrink-0 text-[#EB001B]" />
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{response.answer}</p>
      </div>
      {entries.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-[var(--color-border)] pt-3">
          {entries.map(([key, value]) => (
            <div
              key={key}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/40 px-3 py-1.5"
            >
              <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                {formatKpiKey(key)}
              </p>
              <p className="text-sm font-semibold tabular-nums text-[#EB001B]">
                {formatKpiValue(value)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AiAgentPage() {
  const { role } = useRole();
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const submit = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      question: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await api.askAgent(trimmed, role ?? "guest");
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "agent",
          answer: res.answer,
          supporting_data: res.supporting_data,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "agent",
          answer: API_UNAVAILABLE_MESSAGE,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      title="HEIA AI Agent"
      description="Ask business questions — answers are grounded in scored portfolio data"
      className="flex max-w-4xl flex-col"
    >
      <div className="flex min-h-[calc(100vh-12rem)] flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)]/10">
        <div
          ref={scrollRef}
          className="flex-1 space-y-4 overflow-y-auto px-4 py-6"
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EB001B]/10">
                <Bot className="h-6 w-6 text-[#EB001B]" />
              </div>
              <p className="mt-4 max-w-md text-sm text-[var(--color-muted-foreground)]">
                Ask about revenue scenarios, segment counts, bank rankings, flagging
                reasons, product recommendations, or ROI — or pick a suggested question below.
              </p>
            </div>
          )}

          {messages.map((msg) =>
            msg.role === "user" ? (
              <div key={msg.id} className="flex justify-end">
                <div className="flex max-w-[85%] items-start gap-2 rounded-xl bg-[#EB001B] px-4 py-2.5 text-sm text-white">
                  <p className="whitespace-pre-wrap">{msg.question}</p>
                  <User className="mt-0.5 h-4 w-4 shrink-0 opacity-80" />
                </div>
              </div>
            ) : (
              <AgentAnswerCard
                key={msg.id}
                response={{
                  question: "",
                  answer: msg.answer ?? "",
                  supporting_data: msg.supporting_data ?? {},
                  timestamp: "",
                }}
              />
            ),
          )}

          {loading && (
            <p className="text-sm text-[var(--color-muted-foreground)]">Analyzing…</p>
          )}
        </div>

        <div className="border-t border-[var(--color-border)] bg-white px-4 py-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                disabled={loading}
                onClick={() => submit(s)}
                className={cn(
                  "rounded-full border border-[var(--color-border)] bg-white px-3 py-1.5 text-left text-xs leading-snug",
                  "transition-colors hover:border-[#EB001B]/40 hover:bg-[#EB001B]/5",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                )}
              >
                {s}
              </button>
            ))}
          </div>

          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              submit(question);
            }}
          >
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a business question..."
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !question.trim()}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </div>
    </PageShell>
  );
}
