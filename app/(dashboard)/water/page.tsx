"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { DesignSystemProvider } from "@/components/design-system";

/* ─── Types ─────────────────────────────────────────────────── */
interface Specialist {
  id: string;
  name: string;
  role: string;
  emoji: string;
  color: string;
  system_prompt: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  is_error?: boolean;
}

/* ─── Specialists registry (mirror from Team page) ──────────── */
const SPECIALISTS: Record<string, Specialist> = {
  "01": { id: "01", name: "د. سارة — القلب والأوعية", role: "متخصصة أمراض القلب", emoji: "❤️", color: "#EF4444", system_prompt: "أنت د. سارة، طبيبة متخصصة في أمراض القلب والأوعية الدموية. تقدم استشارات طبية دقيقة مبنية على أدلة علمية حديثة. تتحدث بالعربية بأسلوب مهني ودافئ." },
  "02": { id: "02", name: "د. خالد — التغذية والتمثيل الغذائي", role: "أخصائي تغذية علاجية", emoji: "🥗", color: "#22C55E", system_prompt: "أنت د. خالد، أخصائي تغذية علاجية وتمثيل غذائي. تقدم نصائح غذائية مخصصة مبنية على أحدث الأبحاث. تتحدث بالعربية بأسلوب واضح وعملي." },
  "03": { id: "03", name: "د. ليلى — علم النوم", role: "متخصصة اضطرابات النوم", emoji: "😴", color: "#1A73E8", system_prompt: "أنت د. ليلى، متخصصة في علم النوم واضطراباته. تحلل أنماط النوم وتقدم بروتوكولات لتحسين جودته. تتحدث بالعربية بأسلوب علمي ومبسط." },
  "04": { id: "04", name: "د. فيصل — الطب الرياضي", role: "طبيب طب الرياضة والأداء", emoji: "🏋️", color: "#7C3AED", system_prompt: "أنت د. فيصل، طبيب متخصص في طب الرياضة والأداء البدني. تقدم خطط تدريبية وتقييم الإصابات وتحسين الأداء. تتحدث بالعربية بحماس واحترافية." },
  "05": { id: "05", name: "د. نورة — الغدد الصماء", role: "متخصصة الهرمونات والغدد", emoji: "🔬", color: "#F59E0B", system_prompt: "أنت د. نورة، متخصصة في الغدد الصماء والهرمونات. تشرح التوازن الهرموني وتأثيره على الصحة العامة. تتحدث بالعربية بدقة علمية." },
  "06": { id: "06", name: "د. عمر — الصحة النفسية", role: "استشاري الصحة النفسية", emoji: "🧠", color: "#06B6D4", system_prompt: "أنت د. عمر، استشاري الصحة النفسية والعافية الذهنية. تقدم دعماً نفسياً وتقنيات لإدارة التوتر والقلق. تتحدث بالعربية بتعاطف واحترافية." },
  "07": { id: "07", name: "د. ريم — المناعة", role: "متخصصة علم المناعة", emoji: "🛡️", color: "#10B981", system_prompt: "أنت د. ريم، متخصصة في علم المناعة والصحة الوظيفية. تقدم استراتيجيات لتعزيز الجهاز المناعي. تتحدث بالعربية بوضوح وعمق علمي." },
  "08": { id: "08", name: "د. أحمد — الطب الوقائي", role: "طبيب الطب الوقائي والمتكامل", emoji: "🌿", color: "#84CC16", system_prompt: "أنت د. أحمد، طبيب متخصص في الطب الوقائي والمتكامل. تجمع بين الطب التقليدي والنهج الشمولي للصحة. تتحدث بالعربية." },
};

const FALLBACK_SPECIALIST: Specialist = {
  id: "00",
  name: "المستشار الصحي",
  role: "مستشار صحي عام",
  emoji: "⚕️",
  color: "#1A73E8",
  system_prompt: "أنت مستشار صحي متخصص. تقدم معلومات صحية دقيقة ومفيدة باللغة العربية.",
};

/* ─── Time formatter ─────────────────────────────────────────── */
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function SpecialistChatPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const specialistId = (params?.specialistId as string) ?? "01";

  const specialist = SPECIALISTS[specialistId] ?? FALLBACK_SPECIALIST;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errorMsgId, setErrorMsgId] = useState<string | null>(null);
  const [pendingRetry, setPendingRetry] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* ── Scroll to bottom ─────────────────────────────────────── */
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  /* ── Load last 5 conversations ───────────────────────────── */
  useEffect(() => {
    async function load() {
      setInitialLoading(true);
      const { data, error } = await supabase
        .from("conversations")
        .select("id, role, content, created_at")
        .eq("specialist_id", specialistId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (!error && data) {
        const sorted = [...data].sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        setMessages(
          sorted.map((r) => ({
            id: r.id,
            role: r.role as "user" | "assistant",
            content: r.content,
            created_at: r.created_at,
          }))
        );
      }
      setInitialLoading(false);
    }
    load();
  }, [specialistId, supabase]);

  /* ── Save message to DB ──────────────────────────────────── */
  async function saveMessage(
    role: "user" | "assistant",
    content: string
  ): Promise<string> {
    const { data, error } = await supabase
      .from("conversations")
      .insert({
        specialist_id: specialistId,
        role,
        content,
      })
      .select("id, created_at")
      .single();

    if (error || !data) throw new Error("DB save failed");
    return data.id;
  }

  /* ── Build system prompt with context ───────────────────── */
  function buildSystemPrompt(): string {
    const recentCtx = messages
      .slice(-5)
      .map((m) => `[${m.role === "user" ? "المريض" : specialist.name}]: ${m.content}`)
      .join("\n");

    return `${specialist.system_prompt}

معلومات المتخصص:
- الاسم: ${specialist.name}
- التخصص: ${specialist.role}

${recentCtx ? `آخر المحادثات:\n${recentCtx}\n` : ""}
ملاحظة: أنت تتحدث مع د. أسامة بن محمود. قدم إجابات دقيقة ومفيدة. لا تحل محل الطبيب المعالج.`;
  }

  /* ── Send message ────────────────────────────────────────── */
  async function handleSend(retryContent?: string) {
    const text = retryContent ?? input.trim();
    if (!text || loading) return;

    setInput("");
    setErrorMsgId(null);
    setPendingRetry(null);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Optimistic user message
    const tempUserId = `temp-user-${Date.now()}`;
    const userMsg: Message = {
      id: tempUserId,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // 1. Save user message immediately
      const savedUserId = await saveMessage("user", text);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempUserId ? { ...m, id: savedUserId } : m
        )
      );

      // 2. Build history for Claude (last 10 msgs, excluding optimistic)
      const history = messages
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));
      history.push({ role: "user", content: text });

      // 3. Call Claude API
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          systemPrompt: buildSystemPrompt(),
        }),
      });

      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "خطأ في الاتصال" }));
        throw new Error(error ?? "فشل الاتصال بالمساعد");
      }

      const { reply } = await res.json();

      // 4. Save assistant message
      const savedAsstId = await saveMessage("assistant", reply);

      const asstMsg: Message = {
        id: savedAsstId,
        role: "assistant",
        content: reply,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, asstMsg]);
    } catch (err: unknown) {
      const errText = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
      const errId = `error-${Date.now()}`;
      setErrorMsgId(errId);
      setPendingRetry(text);
      setMessages((prev) => [
        ...prev,
        {
          id: errId,
          role: "assistant",
          content: errText,
          created_at: new Date().toISOString(),
          is_error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  /* ── Retry ───────────────────────────────────────────────── */
  function handleRetry() {
    if (!pendingRetry) return;
    const txt = pendingRetry;
    // Remove error message
    setMessages((prev) => prev.filter((m) => m.id !== errorMsgId));
    setErrorMsgId(null);
    setPendingRetry(null);
    handleSend(txt);
  }

  /* ── Textarea auto-resize ────────────────────────────────── */
  function autoResize(e: React.ChangeEvent<HTMLTextAreaElement>) {
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <DesignSystemProvider>
      <div
        dir="rtl"
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "var(--bg-main)",
          fontFamily: "var(--font-family)",
          overflow: "hidden",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            background: "var(--bg-card)",
            borderBottom: "1px solid var(--color-border)",
            padding: "0 20px",
            height: "64px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexShrink: 0,
            boxShadow: "var(--shadow-card)",
          }}
        >
          {/* Back button */}
          <button
            onClick={() => router.back()}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              border: "1px solid var(--color-border)",
              background: "var(--bg-elevated)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              color: "var(--color-text-secondary)",
              flexShrink: 0,
              transition: "background 150ms",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background =
                "var(--color-primary-light)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background =
                "var(--bg-elevated)")
            }
            title="رجوع"
          >
            ←
          </button>

          {/* Specialist avatar */}
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: specialist.color + "22",
              border: `1.5px solid ${specialist.color}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              flexShrink: 0,
            }}
          >
            {specialist.emoji}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {specialist.name}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "var(--color-text-secondary)",
                marginTop: "1px",
              }}
            >
              {specialist.role}
            </div>
          </div>

          {/* Online badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              background: "var(--color-success-light)",
              borderRadius: "20px",
              padding: "4px 10px",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "var(--color-success)",
                animation: "biosov-pulse 2s ease-in-out infinite",
              }}
            />
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--color-success)",
              }}
            >
              متاح
            </span>
          </div>
        </div>

        {/* ── Messages area ── */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 20px 8px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            scrollbarWidth: "thin",
            scrollbarColor: "var(--color-border) transparent",
          }}
        >
          {/* Initial loading skeletons */}
          {initialLoading && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                padding: "10px 0",
              }}
            >
              {[120, 80, 200, 60].map((w, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: i % 2 === 0 ? "flex-start" : "flex-end",
                  }}
                >
                  <div
                    className="biosov-shimmer"
                    style={{
                      width: `${w}px`,
                      height: "40px",
                      borderRadius: "16px",
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!initialLoading && messages.length === 0 && (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                padding: "40px 20px",
                textAlign: "center",
                color: "var(--color-text-secondary)",
              }}
            >
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "20px",
                  background: specialist.color + "18",
                  border: `2px solid ${specialist.color}33`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "32px",
                }}
              >
                {specialist.emoji}
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                }}
              >
                ابدأ محادثة مع {specialist.name}
              </div>
              <div style={{ fontSize: "13px", maxWidth: "280px", lineHeight: 1.6 }}>
                اطرح سؤالك الصحي وسيجيبك المتخصص بناءً على بياناتك وسياقك الصحي.
              </div>
            </div>
          )}

          {/* Messages */}
          {!initialLoading &&
            messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className="biosov-msg-enter"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isUser ? "flex-start" : "flex-end",
                    gap: "4px",
                    maxWidth: "72%",
                    alignSelf: isUser ? "flex-start" : "flex-end",
                  }}
                >
                  <div
                    style={{
                      background: isUser
                        ? "var(--bg-card)"
                        : msg.is_error
                        ? "var(--color-danger-light)"
                        : specialist.color,
                      color: isUser
                        ? "var(--color-text-primary)"
                        : msg.is_error
                        ? "var(--color-danger)"
                        : "#ffffff",
                      borderRadius: isUser
                        ? "18px 18px 18px 4px"
                        : "18px 18px 4px 18px",
                      padding: "12px 16px",
                      fontSize: "14px",
                      lineHeight: "1.7",
                      border: isUser
                        ? "1px solid var(--color-border)"
                        : msg.is_error
                        ? "1px solid var(--color-danger)"
                        : "none",
                      boxShadow: "var(--shadow-card)",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.content}
                  </div>

                  {/* Error retry */}
                  {msg.is_error && (
                    <button
                      onClick={handleRetry}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "var(--color-danger)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "6px 14px",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "var(--font-family)",
                        transition: "opacity 150ms",
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLButtonElement).style.opacity = "0.85")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLButtonElement).style.opacity = "1")
                      }
                    >
                      🔄 إعادة المحاولة
                    </button>
                  )}

                  <span
                    style={{
                      fontSize: "10px",
                      color: "var(--color-text-secondary)",
                      paddingInline: "4px",
                    }}
                  >
                    {formatTime(msg.created_at)}
                  </span>
                </div>
              );
            })}

          {/* Typing indicator */}
          {loading && (
            <div
              className="biosov-msg-enter"
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: "4px",
                alignSelf: "flex-end",
              }}
            >
              <div
                style={{
                  background: specialist.color + "22",
                  border: `1px solid ${specialist.color}33`,
                  borderRadius: "18px 18px 4px 18px",
                  padding: "12px 18px",
                  display: "flex",
                  gap: "5px",
                  alignItems: "center",
                }}
              >
                <span
                  className="biosov-dot-1"
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: specialist.color,
                    display: "inline-block",
                  }}
                />
                <span
                  className="biosov-dot-2"
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: specialist.color,
                    display: "inline-block",
                  }}
                />
                <span
                  className="biosov-dot-3"
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: specialist.color,
                    display: "inline-block",
                  }}
                />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── Disclaimer strip ── */}
        <div
          style={{
            background: "var(--color-warning-light)",
            borderTop: "1px solid #FDE68A",
            padding: "6px 20px",
            textAlign: "center",
            flexShrink: 0,
          }}
        >
          <p
            style={{
              fontSize: "10px",
              color: "#92600A",
              margin: 0,
              fontWeight: 500,
            }}
          >
            ⚕️ المعلومات لأغراض توعوية فقط — لا تُغني عن استشارة طبيب مختص
          </p>
        </div>

        {/* ── Input area ── */}
        <div
          style={{
            background: "var(--bg-card)",
            borderTop: "1px solid var(--color-border)",
            padding: "12px 20px",
            display: "flex",
            gap: "10px",
            alignItems: "flex-end",
            flexShrink: 0,
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              autoResize(e);
            }}
            onKeyDown={handleKeyDown}
            placeholder={`اكتب سؤالك لـ ${specialist.name.split("—")[0].trim()}...`}
            rows={1}
            disabled={loading}
            style={{
              flex: 1,
              border: "1.5px solid var(--color-border)",
              borderRadius: "14px",
              padding: "11px 16px",
              fontSize: "14px",
              color: "var(--color-text-primary)",
              background: "var(--bg-elevated)",
              outline: "none",
              resize: "none",
              lineHeight: 1.6,
              fontFamily: "var(--font-family)",
              maxHeight: "120px",
              overflowY: "auto",
              transition: "border-color 200ms",
              opacity: loading ? 0.7 : 1,
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = specialist.color)
            }
            onBlur={(e) =>
              (e.target.style.borderColor = "var(--color-border)")
            }
          />

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background:
                input.trim() && !loading
                  ? specialist.color
                  : "var(--bg-elevated)",
              border: "1.5px solid var(--color-border)",
              color:
                input.trim() && !loading ? "#ffffff" : "var(--color-text-secondary)",
              cursor: input.trim() && !loading ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              flexShrink: 0,
              transition: "background 200ms, color 200ms, transform 100ms",
            }}
            onMouseEnter={(e) => {
              if (input.trim() && !loading)
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "scale(1.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
            }}
            onMouseDown={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.95)";
            }}
            onMouseUp={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
            }}
          >
            {loading ? (
              <span
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  border: "2px solid var(--color-text-secondary)",
                  borderTopColor: "transparent",
                  animation: "biosov-spin 0.7s linear infinite",
                  display: "inline-block",
                }}
              />
            ) : (
              "➤"
            )}
          </button>
        </div>
      </div>
    </DesignSystemProvider>
  );
}
