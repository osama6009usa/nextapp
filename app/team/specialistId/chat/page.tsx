"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { DesignSystemProvider } from "@/design-system/design-system";

/* â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

/* â”€â”€â”€ Specialists registry (mirror from Team page) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const SPECIALISTS: Record<string, Specialist> = {
  "01": { id: "01", name: "Ø¯. Ø³Ø§Ø±Ø© â€” Ø§Ù„Ù‚Ù„Ø¨ ÙˆØ§Ù„Ø£ÙˆØ¹ÙŠØ©", role: "Ù…ØªØ®ØµØµØ© Ø£Ù…Ø±Ø§Ø¶ Ø§Ù„Ù‚Ù„Ø¨", emoji: "â¤ï¸", color: "#EF4444", system_prompt: "Ø£Ù†Øª Ø¯. Ø³Ø§Ø±Ø©ØŒ Ø·Ø¨ÙŠØ¨Ø© Ù…ØªØ®ØµØµØ© ÙÙŠ Ø£Ù…Ø±Ø§Ø¶ Ø§Ù„Ù‚Ù„Ø¨ ÙˆØ§Ù„Ø£ÙˆØ¹ÙŠØ© Ø§Ù„Ø¯Ù…ÙˆÙŠØ©. ØªÙ‚Ø¯Ù… Ø§Ø³ØªØ´Ø§Ø±Ø§Øª Ø·Ø¨ÙŠØ© Ø¯Ù‚ÙŠÙ‚Ø© Ù…Ø¨Ù†ÙŠØ© Ø¹Ù„Ù‰ Ø£Ø¯Ù„Ø© Ø¹Ù„Ù…ÙŠØ© Ø­Ø¯ÙŠØ«Ø©. ØªØªØ­Ø¯Ø« Ø¨Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© Ø¨Ø£Ø³Ù„ÙˆØ¨ Ù…Ù‡Ù†ÙŠ ÙˆØ¯Ø§ÙØ¦." },
  "02": { id: "02", name: "Ø¯. Ø®Ø§Ù„Ø¯ â€” Ø§Ù„ØªØºØ°ÙŠØ© ÙˆØ§Ù„ØªÙ…Ø«ÙŠÙ„ Ø§Ù„ØºØ°Ø§Ø¦ÙŠ", role: "Ø£Ø®ØµØ§Ø¦ÙŠ ØªØºØ°ÙŠØ© Ø¹Ù„Ø§Ø¬ÙŠØ©", emoji: "ðŸ¥—", color: "#22C55E", system_prompt: "Ø£Ù†Øª Ø¯. Ø®Ø§Ù„Ø¯ØŒ Ø£Ø®ØµØ§Ø¦ÙŠ ØªØºØ°ÙŠØ© Ø¹Ù„Ø§Ø¬ÙŠØ© ÙˆØªÙ…Ø«ÙŠÙ„ ØºØ°Ø§Ø¦ÙŠ. ØªÙ‚Ø¯Ù… Ù†ØµØ§Ø¦Ø­ ØºØ°Ø§Ø¦ÙŠØ© Ù…Ø®ØµØµØ© Ù…Ø¨Ù†ÙŠØ© Ø¹Ù„Ù‰ Ø£Ø­Ø¯Ø« Ø§Ù„Ø£Ø¨Ø­Ø§Ø«. ØªØªØ­Ø¯Ø« Ø¨Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© Ø¨Ø£Ø³Ù„ÙˆØ¨ ÙˆØ§Ø¶Ø­ ÙˆØ¹Ù…Ù„ÙŠ." },
  "03": { id: "03", name: "Ø¯. Ù„ÙŠÙ„Ù‰ â€” Ø¹Ù„Ù… Ø§Ù„Ù†ÙˆÙ…", role: "Ù…ØªØ®ØµØµØ© Ø§Ø¶Ø·Ø±Ø§Ø¨Ø§Øª Ø§Ù„Ù†ÙˆÙ…", emoji: "ðŸ˜´", color: "#1A73E8", system_prompt: "Ø£Ù†Øª Ø¯. Ù„ÙŠÙ„Ù‰ØŒ Ù…ØªØ®ØµØµØ© ÙÙŠ Ø¹Ù„Ù… Ø§Ù„Ù†ÙˆÙ… ÙˆØ§Ø¶Ø·Ø±Ø§Ø¨Ø§ØªÙ‡. ØªØ­Ù„Ù„ Ø£Ù†Ù…Ø§Ø· Ø§Ù„Ù†ÙˆÙ… ÙˆØªÙ‚Ø¯Ù… Ø¨Ø±ÙˆØªÙˆÙƒÙˆÙ„Ø§Øª Ù„ØªØ­Ø³ÙŠÙ† Ø¬ÙˆØ¯ØªÙ‡. ØªØªØ­Ø¯Ø« Ø¨Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© Ø¨Ø£Ø³Ù„ÙˆØ¨ Ø¹Ù„Ù…ÙŠ ÙˆÙ…Ø¨Ø³Ø·." },
  "04": { id: "04", name: "Ø¯. ÙÙŠØµÙ„ â€” Ø§Ù„Ø·Ø¨ Ø§Ù„Ø±ÙŠØ§Ø¶ÙŠ", role: "Ø·Ø¨ÙŠØ¨ Ø·Ø¨ Ø§Ù„Ø±ÙŠØ§Ø¶Ø© ÙˆØ§Ù„Ø£Ø¯Ø§Ø¡", emoji: "ðŸ‹ï¸", color: "#7C3AED", system_prompt: "Ø£Ù†Øª Ø¯. ÙÙŠØµÙ„ØŒ Ø·Ø¨ÙŠØ¨ Ù…ØªØ®ØµØµ ÙÙŠ Ø·Ø¨ Ø§Ù„Ø±ÙŠØ§Ø¶Ø© ÙˆØ§Ù„Ø£Ø¯Ø§Ø¡ Ø§Ù„Ø¨Ø¯Ù†ÙŠ. ØªÙ‚Ø¯Ù… Ø®Ø·Ø· ØªØ¯Ø±ÙŠØ¨ÙŠØ© ÙˆØªÙ‚ÙŠÙŠÙ… Ø§Ù„Ø¥ØµØ§Ø¨Ø§Øª ÙˆØªØ­Ø³ÙŠÙ† Ø§Ù„Ø£Ø¯Ø§Ø¡. ØªØªØ­Ø¯Ø« Ø¨Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© Ø¨Ø­Ù…Ø§Ø³ ÙˆØ§Ø­ØªØ±Ø§ÙÙŠØ©." },
  "05": { id: "05", name: "Ø¯. Ù†ÙˆØ±Ø© â€” Ø§Ù„ØºØ¯Ø¯ Ø§Ù„ØµÙ…Ø§Ø¡", role: "Ù…ØªØ®ØµØµØ© Ø§Ù„Ù‡Ø±Ù…ÙˆÙ†Ø§Øª ÙˆØ§Ù„ØºØ¯Ø¯", emoji: "ðŸ”¬", color: "#F59E0B", system_prompt: "Ø£Ù†Øª Ø¯. Ù†ÙˆØ±Ø©ØŒ Ù…ØªØ®ØµØµØ© ÙÙŠ Ø§Ù„ØºØ¯Ø¯ Ø§Ù„ØµÙ…Ø§Ø¡ ÙˆØ§Ù„Ù‡Ø±Ù…ÙˆÙ†Ø§Øª. ØªØ´Ø±Ø­ Ø§Ù„ØªÙˆØ§Ø²Ù† Ø§Ù„Ù‡Ø±Ù…ÙˆÙ†ÙŠ ÙˆØªØ£Ø«ÙŠØ±Ù‡ Ø¹Ù„Ù‰ Ø§Ù„ØµØ­Ø© Ø§Ù„Ø¹Ø§Ù…Ø©. ØªØªØ­Ø¯Ø« Ø¨Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© Ø¨Ø¯Ù‚Ø© Ø¹Ù„Ù…ÙŠØ©." },
  "06": { id: "06", name: "Ø¯. Ø¹Ù…Ø± â€” Ø§Ù„ØµØ­Ø© Ø§Ù„Ù†ÙØ³ÙŠØ©", role: "Ø§Ø³ØªØ´Ø§Ø±ÙŠ Ø§Ù„ØµØ­Ø© Ø§Ù„Ù†ÙØ³ÙŠØ©", emoji: "ðŸ§ ", color: "#06B6D4", system_prompt: "Ø£Ù†Øª Ø¯. Ø¹Ù…Ø±ØŒ Ø§Ø³ØªØ´Ø§Ø±ÙŠ Ø§Ù„ØµØ­Ø© Ø§Ù„Ù†ÙØ³ÙŠØ© ÙˆØ§Ù„Ø¹Ø§ÙÙŠØ© Ø§Ù„Ø°Ù‡Ù†ÙŠØ©. ØªÙ‚Ø¯Ù… Ø¯Ø¹Ù…Ø§Ù‹ Ù†ÙØ³ÙŠØ§Ù‹ ÙˆØªÙ‚Ù†ÙŠØ§Øª Ù„Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„ØªÙˆØªØ± ÙˆØ§Ù„Ù‚Ù„Ù‚. ØªØªØ­Ø¯Ø« Ø¨Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© Ø¨ØªØ¹Ø§Ø·Ù ÙˆØ§Ø­ØªØ±Ø§ÙÙŠØ©." },
  "07": { id: "07", name: "Ø¯. Ø±ÙŠÙ… â€” Ø§Ù„Ù…Ù†Ø§Ø¹Ø©", role: "Ù…ØªØ®ØµØµØ© Ø¹Ù„Ù… Ø§Ù„Ù…Ù†Ø§Ø¹Ø©", emoji: "ðŸ›¡ï¸", color: "#10B981", system_prompt: "Ø£Ù†Øª Ø¯. Ø±ÙŠÙ…ØŒ Ù…ØªØ®ØµØµØ© ÙÙŠ Ø¹Ù„Ù… Ø§Ù„Ù…Ù†Ø§Ø¹Ø© ÙˆØ§Ù„ØµØ­Ø© Ø§Ù„ÙˆØ¸ÙŠÙÙŠØ©. ØªÙ‚Ø¯Ù… Ø§Ø³ØªØ±Ø§ØªÙŠØ¬ÙŠØ§Øª Ù„ØªØ¹Ø²ÙŠØ² Ø§Ù„Ø¬Ù‡Ø§Ø² Ø§Ù„Ù…Ù†Ø§Ø¹ÙŠ. ØªØªØ­Ø¯Ø« Ø¨Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© Ø¨ÙˆØ¶ÙˆØ­ ÙˆØ¹Ù…Ù‚ Ø¹Ù„Ù…ÙŠ." },
  "08": { id: "08", name: "Ø¯. Ø£Ø­Ù…Ø¯ â€” Ø§Ù„Ø·Ø¨ Ø§Ù„ÙˆÙ‚Ø§Ø¦ÙŠ", role: "Ø·Ø¨ÙŠØ¨ Ø§Ù„Ø·Ø¨ Ø§Ù„ÙˆÙ‚Ø§Ø¦ÙŠ ÙˆØ§Ù„Ù…ØªÙƒØ§Ù…Ù„", emoji: "ðŸŒ¿", color: "#84CC16", system_prompt: "Ø£Ù†Øª Ø¯. Ø£Ø­Ù…Ø¯ØŒ Ø·Ø¨ÙŠØ¨ Ù…ØªØ®ØµØµ ÙÙŠ Ø§Ù„Ø·Ø¨ Ø§Ù„ÙˆÙ‚Ø§Ø¦ÙŠ ÙˆØ§Ù„Ù…ØªÙƒØ§Ù…Ù„. ØªØ¬Ù…Ø¹ Ø¨ÙŠÙ† Ø§Ù„Ø·Ø¨ Ø§Ù„ØªÙ‚Ù„ÙŠØ¯ÙŠ ÙˆØ§Ù„Ù†Ù‡Ø¬ Ø§Ù„Ø´Ù…ÙˆÙ„ÙŠ Ù„Ù„ØµØ­Ø©. ØªØªØ­Ø¯Ø« Ø¨Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©." },
};

const FALLBACK_SPECIALIST: Specialist = {
  id: "00",
  name: "Ø§Ù„Ù…Ø³ØªØ´Ø§Ø± Ø§Ù„ØµØ­ÙŠ",
  role: "Ù…Ø³ØªØ´Ø§Ø± ØµØ­ÙŠ Ø¹Ø§Ù…",
  emoji: "âš•ï¸",
  color: "#1A73E8",
  system_prompt: "Ø£Ù†Øª Ù…Ø³ØªØ´Ø§Ø± ØµØ­ÙŠ Ù…ØªØ®ØµØµ. ØªÙ‚Ø¯Ù… Ù…Ø¹Ù„ÙˆÙ…Ø§Øª ØµØ­ÙŠØ© Ø¯Ù‚ÙŠÙ‚Ø© ÙˆÙ…ÙÙŠØ¯Ø© Ø¨Ø§Ù„Ù„ØºØ© Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©.",
};

/* â”€â”€â”€ Time formatter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* â”€â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function SpecialistChatPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
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

  /* â”€â”€ Scroll to bottom â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  /* â”€â”€ Load last 5 conversations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

  /* â”€â”€ Save message to DB â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

  /* â”€â”€ Build system prompt with context â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function buildSystemPrompt(): string {
    const recentCtx = messages
      .slice(-5)
      .map((m) => `[${m.role === "user" ? "Ø§Ù„Ù…Ø±ÙŠØ¶" : specialist.name}]: ${m.content}`)
      .join("\n");

    return `${specialist.system_prompt}

Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ù…ØªØ®ØµØµ:
- Ø§Ù„Ø§Ø³Ù…: ${specialist.name}
- Ø§Ù„ØªØ®ØµØµ: ${specialist.role}

${recentCtx ? `Ø¢Ø®Ø± Ø§Ù„Ù…Ø­Ø§Ø¯Ø«Ø§Øª:\n${recentCtx}\n` : ""}
Ù…Ù„Ø§Ø­Ø¸Ø©: Ø£Ù†Øª ØªØªØ­Ø¯Ø« Ù…Ø¹ Ø¯. Ø£Ø³Ø§Ù…Ø© Ø¨Ù† Ù…Ø­Ù…ÙˆØ¯. Ù‚Ø¯Ù… Ø¥Ø¬Ø§Ø¨Ø§Øª Ø¯Ù‚ÙŠÙ‚Ø© ÙˆÙ…ÙÙŠØ¯Ø©. Ù„Ø§ ØªØ­Ù„ Ù…Ø­Ù„ Ø§Ù„Ø·Ø¨ÙŠØ¨ Ø§Ù„Ù…Ø¹Ø§Ù„Ø¬.`;
  }

  /* â”€â”€ Send message â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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
        const { error } = await res.json().catch(() => ({ error: "Ø®Ø·Ø£ ÙÙŠ Ø§Ù„Ø§ØªØµØ§Ù„" }));
        throw new Error(error ?? "ÙØ´Ù„ Ø§Ù„Ø§ØªØµØ§Ù„ Ø¨Ø§Ù„Ù…Ø³Ø§Ø¹Ø¯");
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
      const errText = err instanceof Error ? err.message : "Ø­Ø¯Ø« Ø®Ø·Ø£ ØºÙŠØ± Ù…ØªÙˆÙ‚Ø¹";
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

  /* â”€â”€ Retry â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function handleRetry() {
    if (!pendingRetry) return;
    const txt = pendingRetry;
    // Remove error message
    setMessages((prev) => prev.filter((m) => m.id !== errorMsgId));
    setErrorMsgId(null);
    setPendingRetry(null);
    handleSend(txt);
  }

  /* â”€â”€ Textarea auto-resize â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

  /* â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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
        {/* â”€â”€ Header â”€â”€ */}
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
            title="Ø±Ø¬ÙˆØ¹"
          >
            â†
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
              Ù…ØªØ§Ø­
            </span>
          </div>
        </div>

        {/* â”€â”€ Messages area â”€â”€ */}
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
                Ø§Ø¨Ø¯Ø£ Ù…Ø­Ø§Ø¯Ø«Ø© Ù…Ø¹ {specialist.name}
              </div>
              <div style={{ fontSize: "13px", maxWidth: "280px", lineHeight: 1.6 }}>
                Ø§Ø·Ø±Ø­ Ø³Ø¤Ø§Ù„Ùƒ Ø§Ù„ØµØ­ÙŠ ÙˆØ³ÙŠØ¬ÙŠØ¨Ùƒ Ø§Ù„Ù…ØªØ®ØµØµ Ø¨Ù†Ø§Ø¡Ù‹ Ø¹Ù„Ù‰ Ø¨ÙŠØ§Ù†Ø§ØªÙƒ ÙˆØ³ÙŠØ§Ù‚Ùƒ Ø§Ù„ØµØ­ÙŠ.
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
                      ðŸ”„ Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø©
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

        {/* â”€â”€ Disclaimer strip â”€â”€ */}
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
            âš•ï¸ Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ù„Ø£ØºØ±Ø§Ø¶ ØªÙˆØ¹ÙˆÙŠØ© ÙÙ‚Ø· â€” Ù„Ø§ ØªÙØºÙ†ÙŠ Ø¹Ù† Ø§Ø³ØªØ´Ø§Ø±Ø© Ø·Ø¨ÙŠØ¨ Ù…Ø®ØªØµ
          </p>
        </div>

        {/* â”€â”€ Input area â”€â”€ */}
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
            placeholder={`Ø§ÙƒØªØ¨ Ø³Ø¤Ø§Ù„Ùƒ Ù„Ù€ ${specialist.name.split("â€”")[0].trim()}...`}
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
              "âž¤"
            )}
          </button>
        </div>
      </div>
    </DesignSystemProvider>
  );
}



