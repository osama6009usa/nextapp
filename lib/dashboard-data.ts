import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type {
  DailyLog,
  DailyScoreData,
  MealEntry,
  WaterLog,
  UserGoals,
  DashboardData,
} from "@/types/dashboard"

function todayISO(): string {
  return new Date().toISOString().split("T")[0]
}

function startOfTodayISO(): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

export async function getDashboardData(): Promise<DashboardData> {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("UNAUTHENTICATED")
  }

  const uid = user.id
  const today = todayISO()
  const todayStart = startOfTodayISO()

  const [
    dailyLogRes,
    dailyScoreRes,
    mealsRes,
    waterRes,
    profileRes,
  ] = await Promise.all([
    supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", uid)
      .eq("log_date", today)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("behavioral_scores")
      .select("daily_score, biosov_score, calculated_at")
      .eq("user_id", uid)
      .eq("score_date", today)
      .maybeSingle(),
    supabase
      .from("meals")
      .select("id, meal_time, protein_g, calories")
      .eq("user_id", uid)
      .gte("meal_time", todayStart)
      .order("meal_time", { ascending: false }),
    supabase
      .from("water_logs")
      .select("id, logged_at, amount_ml")
      .eq("user_id", uid)
      .gte("logged_at", todayStart),
    supabase
      .from("profiles")
      .select("protein_goal, water_goal, fasting_window")
      .eq("id", uid)
      .single(),
  ])

  const dailyLog = dailyLogRes.data as DailyLog | null
  const dailyScore = dailyScoreRes.data as DailyScoreData | null
  const meals = (mealsRes.data ?? []) as MealEntry[]
  const waterLogs = (waterRes.data ?? []) as WaterLog[]
  const profile = profileRes.data

  const totalProteinToday = meals.reduce(
    (sum, m) => sum + (m.protein_g ?? 0),
    0
  )
  const totalWaterToday = waterLogs.reduce(
    (sum, w) => sum + (w.amount_ml ?? 0),
    0
  )
  const lastMealTime = meals.length > 0 ? meals[0].meal_time : null

  const userGoals: UserGoals = {
    protein_goal: profile?.protein_goal ?? 165,
    water_goal_ml: (profile?.water_goal ?? 5) * 1000,
    fasting_window: profile?.fasting_window ?? 18,
  }

  return {
    userId: uid,
    dailyLog,
    dailyScore,
    totalProteinToday,
    totalWaterToday,
    lastMealTime,
    userGoals,
    hasWhoopData: dailyLog !== null,
  }
}
