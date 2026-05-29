import { useRef, useEffect, useState } from "react";
import { Bot, Loader2, Send, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRole } from "@/context/RoleContext";
import { api, type AgentQuestionResponse } from "@/lib/api";
import { API_UNAVAILABLE_MESSAGE } from "@/lib/apiErrors";
import { AGENT_SUGGESTED_KEYS } from "@/lib/i18nLabels";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "agent";
  question?: string;
  answer?: string;
  supporting_data?: Record<string, string | number | boolean | undefined>;
}

function formatKpiKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/Kzt/g, "KZT")
    .replace(/Pct/g, "%")
    .replace(/Roi/g, "ROI");
}

function agentPoweredByLabel(
  supporting: Record<string, string | number | boolean | undefined> | undefined,
  t: (key: string) => string,
): string {
  const source = String(supporting?.source ?? "");
  if (source === "gemini") return t("agent.powered_by");
  if (source === "demo") return t("agent.powered_by_demo");
  if (source === "rules") return t("agent.powered_by_rules");
  return t("agent.powered_by_rules");
}

function formatKpiValue(
  value: string | number | boolean,
  t: (key: string) => string,
): string {
  if (typeof value === "boolean") return value ? t("common.yes") : t("common.no");
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

function AgentAnswerCard({
  response,
  poweredByLabel,
  t,
}: {
  response: AgentQuestionResponse;
  poweredByLabel: string;
  t: (key: string) => string;
}) {
  const geminiError = response.supporting_data?.gemini_error;
  const entries = Object.entries(response.supporting_data ?? {}).filter(
    ([key]) =>
      key !== "intent" &&
      key !== "gemini_error" &&
      key !== "blocked" &&
      key !== "source" &&
      key !== "gemini_model",
  );

  return (
    <div className="flex max-w-[92%] items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200">
        <Bot className="h-4 w-4 text-gray-600" />
      </div>
      <div className="mr-4 flex-1 space-y-3 rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 shadow-sm">
        {geminiError ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            {t("agent.gemini_fallback")}
            <span className="mt-1 block font-mono text-[10px] leading-snug opacity-90">
              {String(geminiError).slice(0, 320)}
            </span>
          </p>
        ) : null}
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-900">
          {response.answer}
        </p>
        <div className="-mt-1 flex items-center justify-end">
          <span className="rounded-full border border-gray-300 bg-white px-2 py-0.5 text-[10px] font-medium text-gray-500">
            {poweredByLabel}
          </span>
        </div>
        {entries.length > 0 && (
          <div className="flex flex-wrap gap-2 border-t border-gray-200 pt-3">
            {entries.map(([key, value]) => (
              <div
                key={key}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5"
              >
                <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
                  {formatKpiKey(key)}
                </p>
                <p className="text-sm font-semibold tabular-nums text-[#EB001B]">
                  {formatKpiValue(value, t)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function AiAgentPage() {
  const { t } = useTranslation();
  const { role } = useRole();
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [agentStatus, setAgentStatus] = useState<{
    gemini_configured: boolean;
    model: string;
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = AGENT_SUGGESTED_KEYS.map((key) => t(key));

  useEffect(() => {
    api
      .getAgentStatus()
      .then((s) => setAgentStatus({ gemini_configured: s.gemini_configured, model: s.model }))
      .catch(() => setAgentStatus(null));
  }, []);

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
          supporting_data: res.supporting_data as Record<
            string,
            string | number | boolean
          >,
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
      title={t("agent.title")}
      description={t("agent.description")}
      className="flex max-w-4xl flex-col"
    >
      <div className="flex min-h-[calc(100vh-12rem)] flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)]/10">
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-6">
          {agentStatus && !agentStatus.gemini_configured ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-900">
              {t("agent.gemini_not_configured")}
            </p>
          ) : null}
          {import.meta.env.DEV &&
          import.meta.env.VITE_API_URL?.includes("onrender.com") ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              {t("agent.gemini_wrong_api")}
            </p>
          ) : null}

          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EB001B]/10">
                <Bot className="h-6 w-6 text-[#EB001B]" />
              </div>
              <p className="mt-4 max-w-md text-sm text-[var(--color-muted-foreground)]">
                {t("agent.empty_hint")}
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
                  supporting_data: (msg.supporting_data ?? {}) as Record<
                    string,
                    string | number
                  >,
                  timestamp: "",
                }}
                poweredByLabel={agentPoweredByLabel(msg.supporting_data, t)}
                t={t}
              />
            ),
          )}

          {loading && (
            <div className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
              <Loader2 className="h-4 w-4 animate-spin text-[#EB001B]" />
              <span>{t("agent.thinking")}</span>
            </div>
          )}
        </div>

        <div className="border-t border-[var(--color-border)] bg-white px-4 py-4">
          <p className="mb-2 text-xs font-medium text-[var(--color-muted-foreground)]">
            {t("agent.suggested")}
          </p>
          <div className="mb-3 flex flex-wrap gap-2">
            {suggestedQuestions.map((s) => (
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
              placeholder={t("agent.placeholder")}
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !question.trim()}>
              <Send className="h-4 w-4" />
              <span className="sr-only">{t("agent.send")}</span>
            </Button>
          </form>
        </div>
      </div>
    </PageShell>
  );
}
