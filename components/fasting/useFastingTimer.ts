"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface FastingState {
  lastMealTime: Date | null;
  elapsedSeconds: number;
  fastingWindowHours: number;
  isLoading: boolean;
  error: string | null;
}

export function useFastingTimer(userId: string) {
  const [state, setState] = useState<FastingState>({
    lastMealTime: null,
    elapsedSeconds: 0,
    fastingWindowHours: 18,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("fasting_window")
          .eq("id", userId)
          .single();

        const { data: meal } = await supabase
          .from("meals")
          .select("meal_time")
          .eq("user_id", userId)
          .order("meal_time", { ascending: false })
          .limit(1)
          .single();

        const lastMealTime = meal ? new Date(meal.meal_time) : null;
        const fastingWindowHours = profile?.fasting_window ?? 18;
        const elapsedSeconds = lastMealTime
          ? Math.floor((Date.now() - lastMealTime.getTime()) / 1000)
          : 0;

        setState({
          lastMealTime,
          elapsedSeconds,
          fastingWindowHours,
          isLoading: false,
          error: null,
        });
      } catch {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: null,
          lastMealTime: null,
        }));
      }
    }
    fetchData();
  }, [userId]);

  useEffect(() => {
    if (!state.lastMealTime) return;
    const interval = setInterval(() => {
      setState((prev) => {
        if (!prev.lastMealTime) return prev;
        const elapsed = Math.floor(
          (Date.now() - prev.lastMealTime.getTime()) / 1000
        );
        return { ...prev, elapsedSeconds: elapsed };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [state.lastMealTime]);

  useEffect(() => {
    const channel = supabase
      .channel("meals-realtime-" + userId)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "meals",
          filter: "user_id=eq." + userId,
        },
        (payload: { new: Record<string, unknown> }) => {
          const newMealTime = new Date(payload.new.meal_time as string);
          const elapsed = Math.floor(
            (Date.now() - newMealTime.getTime()) / 1000
          );
          setState((prev) => ({
            ...prev,
            lastMealTime: newMealTime,
            elapsedSeconds: elapsed,
          }));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const windowSeconds = state.fastingWindowHours * 3600;
  const remainingSeconds = Math.max(0, windowSeconds - state.elapsedSeconds);
  const progressPercent = Math.min(
    100,
    (state.elapsedSeconds / windowSeconds) * 100
  );
  const isWindowOpen = state.elapsedSeconds >= windowSeconds;
  const eatingWindowOpensAt = state.lastMealTime
    ? new Date(state.lastMealTime.getTime() + windowSeconds * 1000)
    : null;

  return {
    ...state,
    remainingSeconds,
    progressPercent,
    isWindowOpen,
    eatingWindowOpensAt,
  };
}