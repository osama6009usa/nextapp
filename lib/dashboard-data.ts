// ─────────────────────────────────────────────
//  BioSovereignty — Dashboard Data Fetcher
//  Server-side only (no "use client")
// ─────────────────────────────────────────────

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type {
  DailyLog,
  DailyScoreData,
  MealEntry,
  WaterLog,
  UserGoals,
  DashboardData,
} from "@/types/dashboard"

// ── helpers ──────────────────────────────────

function todayISO(): string {
  return new Date().toISOString().split("T")[0]  // "YYYY-MM-DD"
}

function startOfTodayISO(): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

// ── main loader ───────────────────────────────

export async function getDashboardData(): Promise<DashboardData> {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  // ① Auth — get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("UNAUTHENTICATED")
  }

  const uid = user.id
  const today = todayISO()
  const todayStart = startOfTodayISO()

  // ② Run all queries in parallel
  const [
    dailyLogRes,
    dailyScoreRes,
    mealsRes,
    waterRes,
    profileRes,
  ] = await Promise.all([

    // daily_logs — آخر سجل اليوم
    supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", uid)
      .eq("log_date", today)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),

    // behavioral_scores — Daily Score + BioSov Score لليوم
    supabase
      .from("behavioral_scores")
      .select("daily_score, biosov_score, calculated_at")
      .eq("user_id", uid)
      .eq("score_date", today)
      .maybeSingle(),

    // meals — وجبات اليوم فقط (لحساب البروتين + آخر وجبة)
    supabase
      .from("meals")
      .select("id, meal_time, protein_g, calories")
      .eq("user_id", uid)
      .gte("meal_time", todayStart)
      .order("meal_time", { ascending: false }),

    // water_logs — سجلات الماء اليوم
    supabase
      .from("water_logs")
      .select("id, logged_at, amount_ml")
      .eq("user_id", uid)
      .gte("logged_at", todayStart),

    // profiles — الأهداف
    supabase
      .from("profiles")
      .select("protein_goal, water_goal, fasting_window")
      .eq("id", uid)
      .single(),
  ])

  // ③ Extract data safely
  const dailyLog = dailyLogRes.data as DailyLog | null
  const dailyScore = dailyScoreRes.data as DailyScoreData | null
  const meals = (mealsRes.data ?? []) as MealEntry[]
  const waterLogs = (waterRes.data ?? []) as WaterLog[]
  const profile = profileRes.data

  // ④ Computed values
  const totalProteinToday = meals.reduce(
    (sum, m) => sum + (m.protein_g ?? 0),
    0
  )
  const totalWaterToday = waterLogs.reduce(
    (sum, w) => sum + (w.amount_ml ?? 0),
    0
  )
  const lastMealTime =
    meals.length > 0 ? meals[0].meal_time : null

  // ⑤ User goals with defaults
  const userGoals: UserGoals = {
    protein_goal: profile?.protein_goal ?? 165,
    water_goal_ml: (profile?.water_goal ?? 5) * 1000, // stored as liters
    fasting_window: profile?.fasting_window ?? 18,
  }

  return {
    dailyLog,
    dailyScore,
    totalProteinToday,
    totalWaterToday,
    lastMealTime,
    userGoals,
    hasWhoopData: dailyLog !== null,
  }
}
