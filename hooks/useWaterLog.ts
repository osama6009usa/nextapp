"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";

export interface WaterLog {
  id: string;
  user_id: string;
  amount_ml: number;
  logged_at: string;
  created_at: string;
}

export interface UseWaterLogReturn {
  logs: WaterLog[];
  totalMl: number;
  waterGoal: number;
  loading: boolean;
  adding: boolean;
  deletingId: string | null;
  addWater: (amountMl: number) => Promise<void>;
  deleteLog: (id: string) => Promise<void>;
  error: string | null;
}

export function useWaterLog(): UseWaterLogReturn {
  const [logs, setLogs] = useState<WaterLog[]>([]);
  const [waterGoal, setWaterGoal] = useState<number>(5000);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const userIdRef = useRef<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const getTodayBounds = useCallback(() => {
    const now = new Date();
    const riyadh = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Riyadh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);
    const startUTC = new Date(`${riyadh}T00:00:00+03:00`).toISOString();
    const endUTC   = new Date(`${riyadh}T23:59:59+03:00`).toISOString();
    return { riyadh, startUTC, endUTC };
  }, []);

  const fetchLogs = useCallback(async (uid: string) => {
    const { startUTC, endUTC } = getTodayBounds();
    const { data, error: err } = await supabase
      .from("water_logs")
      .select("*")
      .eq("user_id", uid)
      .gte("logged_at", startUTC)
      .lte("logged_at", endUTC)
      .order("logged_at", { ascending: false });
    if (err) { console.error("[water] fetchLogs error:", err.message); setError(err.message); }
    else setLogs(data ?? []);
  }, [getTodayBounds]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError(null);

      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      console.log("[water] auth user:", user?.id, authErr?.message);
      if (!user) { setLoading(false); return; }

      userIdRef.current = user.id;

      const { data: profile } = await supabase
        .from("profiles")
        .select("water_goal")
        .eq("id", user.id)
        .single();
      if (profile?.water_goal) setWaterGoal(profile.water_goal);

      await fetchLogs(user.id);
      setLoading(false);

      if (channelRef.current) {
        await supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      const { riyadh } = getTodayBounds();
      const channel = supabase.channel(`water-${user.id}-${riyadh}`);
      channel.on(
        "postgres_changes" as any,
        { event: "*", schema: "public", table: "water_logs", filter: `user_id=eq.${user.id}` },
        () => { fetchLogs(user.id); }
      );
      channel.subscribe();
      channelRef.current = channel;
    };

    init();
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [fetchLogs, getTodayBounds]);

  const addWater = useCallback(async (amountMl: number) => {
    const uid = userIdRef.current;
    console.log("[water] addWater called — uid:", uid, "amount:", amountMl);
    if (!uid) { console.warn("[water] addWater: no userId"); return; }
    setAdding(true);
    setError(null);
    const { error: insertErr } = await supabase
      .from("water_logs")
      .insert({ user_id: uid, amount_ml: Math.round(amountMl) });
    if (insertErr) { console.error("[water] insert error:", insertErr.message); setError(insertErr.message); }
    else { console.log("[water] insert OK"); await fetchLogs(uid); }
    setAdding(false);
  }, [fetchLogs]);

  const deleteLog = useCallback(async (id: string) => {
    const uid = userIdRef.current;
    console.log("[water] deleteLog called — uid:", uid, "id:", id);
    if (!uid) { console.warn("[water] deleteLog: no userId"); return; }
    setDeletingId(id);
    setError(null);
    const { error: delErr, count } = await supabase
      .from("water_logs")
      .delete({ count: "exact" })
      .eq("id", id)
      .eq("user_id", uid);
    if (delErr) { console.error("[water] delete error:", delErr.message); setError(delErr.message); }
    else { console.log("[water] delete OK — rows affected:", count); await fetchLogs(uid); }
    setDeletingId(null);
  }, [fetchLogs]);

  const totalMl = logs.reduce((sum, l) => sum + l.amount_ml, 0);

  return { logs, totalMl, waterGoal, loading, adding, deletingId, addWater, deleteLog, error };
}