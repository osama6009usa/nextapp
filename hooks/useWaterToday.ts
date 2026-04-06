"use client";

// ============================================================
// hooks/useWaterToday.ts
// S-06 — مصدر البيانات المشترك لتتبع الماء
// يُستخدم في: water/page.tsx + dashboard/page.tsx
// ============================================================

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

// ── Types ────────────────────────────────────────────────────
export interface WaterLogEntry {
  id: string;
  amount_ml: number;
  logged_at: string; // ISO timestamp
}

export interface WaterTodayState {
  totalMl: number;          // مجموع اليوم بالمل
  goalMl: number;           // الهدف اليومي بالمل (من profiles)
  logs: WaterLogEntry[];    // سجل اليوم التفصيلي
  isLoading: boolean;
  isGoalReached: boolean;   // true عند بلوغ الهدف
  percentFilled: number;    // 0 → 100
  remainingMl: number;      // ما تبقى للهدف (0 عند الوصول)
}

export interface UseWaterTodayReturn extends WaterTodayState {
  addWater: (amountMl: number) => Promise<void>;
  isInserting: boolean;
  insertError: string | null;
}

// ── Helpers ──────────────────────────────────────────────────
const DEFAULT_GOAL_ML = 5000; // احتياطي — المصدر الحقيقي هو profiles.goal_water

function todayRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end   = new Date(start.getTime() + 86_400_000);
  return {
    start: start.toISOString(),
    end:   end.toISOString(),
  };
}

function buildState(
  logs: WaterLogEntry[],
  goalMl: number,
): Pick<WaterTodayState, "totalMl" | "isGoalReached" | "percentFilled" | "remainingMl"> {
  const totalMl       = logs.reduce((sum, l) => sum + l.amount_ml, 0);
  const isGoalReached = totalMl >= goalMl;
  const percentFilled = Math.min(Math.round((totalMl / goalMl) * 100), 100);
  const remainingMl   = Math.max(goalMl - totalMl, 0);
  return { totalMl, isGoalReached, percentFilled, remainingMl };
}

// ── Hook ─────────────────────────────────────────────────────
export function useWaterToday(): UseWaterTodayReturn {
  
  const channelRef = useRef<RealtimeChannel | null>(null);

  const [goalMl,      setGoalMl]      = useState<number>(DEFAULT_GOAL_ML);
  const [logs,        setLogs]        = useState<WaterLogEntry[]>([]);
  const [isLoading,   setIsLoading]   = useState<boolean>(true);
  const [isInserting, setIsInserting] = useState<boolean>(false);
  const [insertError, setInsertError] = useState<string | null>(null);

  // ── Computed ─────────────────────────────────────────────
  const computed = buildState(logs, goalMl);

  // ── Initial Fetch ─────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setInsertError(null);

    try {
      // 1. جلب goal_water من profiles
      // RLS يضمن أن المستخدم يرى ملفه فقط — لا داعي لفلترة user_id يدوياً
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("goal_water")
        .single();

      if (profileError) throw profileError;

      const fetchedGoalMl =
        profile?.goal_water != null
          ? Math.round(profile.goal_water * 1000) // goal_water مخزّن بالليتر → نحوّله لمل
          : DEFAULT_GOAL_ML;

      setGoalMl(fetchedGoalMl);

      // 2. جلب سجلات اليوم
      const { start, end } = todayRange();

      const { data: logsData, error: logsError } = await supabase
        .from("water_logs")
        .select("id, amount_ml, logged_at")
        .gte("logged_at", start)
        .lt("logged_at", end)
        .order("logged_at", { ascending: false });

      if (logsError) throw logsError;

      setLogs((logsData as WaterLogEntry[]) ?? []);
    } catch (err) {
      console.error("[useWaterToday] fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // ── Realtime Subscription ─────────────────────────────────
  useEffect(() => {
    fetchData();

    // اشتراك واحد على water_logs — يتحدث تلقائياً عند INSERT/UPDATE/DELETE
    const channel = supabase
      .channel("water_logs_today")
      .on(
        "postgres_changes",
        {
          event:  "*",
          schema: "public",
          table:  "water_logs",
        },
        () => {
          // عند أي تغيير: أعد جلب سجلات اليوم فقط (لا نعيد جلب goal)
          const { start, end } = todayRange();
          supabase
            .from("water_logs")
            .select("id, amount_ml, logged_at")
            .gte("logged_at", start)
            .lt("logged_at", end)
            .order("logged_at", { ascending: false })
            .then(({ data }) => {
              if (data) setLogs(data as WaterLogEntry[]);
            });
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [fetchData, supabase]);

  // ── addWater ──────────────────────────────────────────────
  const addWater = useCallback(
    async (amountMl: number): Promise<void> => {
      if (amountMl <= 0) return;

      setIsInserting(true);
      setInsertError(null);

      try {
        // RLS يتحكم في auth.uid() = user_id عند INSERT
        const { error } = await supabase.from("water_logs").insert({
          amount_ml: amountMl,
          logged_at: new Date().toISOString(),
          // user_id لا نرسله يدوياً — يُضاف عبر DEFAULT auth.uid() في Supabase
          // إذا لم يكن DEFAULT مفعّلاً، أضف: user_id: (await supabase.auth.getUser()).data.user?.id
        });

        if (error) throw error;
        // الـ Realtime subscription ستحدّث logs تلقائياً
      } catch (err) {
        const message = err instanceof Error ? err.message : "خطأ غير معروف";
        setInsertError(message);
        console.error("[useWaterToday] insert error:", err);
        throw err; // نرمي للـ caller ليعرض toast الخطأ
      } finally {
        setIsInserting(false);
      }
    },
    [supabase],
  );

  return {
    ...computed,
    goalMl,
    logs,
    isLoading,
    addWater,
    isInserting,
    insertError,
  };
}

