"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createBrowserClient } from "@supabase/ssr"

interface Props {
  userId: string
  initialProtein: number
  proteinGoal: number
  initialWater: number
  waterGoal: number
  initialStreak: number
  initialBestStreak: number
}

const QUICK_ML = [250, 500, 750]

function Bar({
  label,
  emoji,
  value,
  goal,
  unit,
  color,
}: {
  label: string
  emoji: string
  value: number
  goal: number
  unit: string
  color: string
}) {
  const pct = goal > 0 ? Math.min((value / goal) * 100, 100) : 0
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-base">{emoji}</span>
          <span className="text-sm font-semibold text-gray-700">{label}</span>
        </div>
        <span className="text-xs text-gray-500 font-medium">
          {Math.round(value)}{unit} / {Math.round(goal)}{unit}
        </span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400">
        <span>{Math.round(pct)}%</span>
        <span>
          {pct >= 100
            ? "✅ اكتمل"
            : `متبقي: ${unit === "L"
                ? ((goal - value) / 1000).toFixed(1)
                : Math.round(goal - value)}${unit}`}
        </span>
      </div>
    </div>
  )
}

export function NutritionSection({
  userId,
  initialProtein,
  proteinGoal,
  initialWater,
  waterGoal,
  initialStreak,
  initialBestStreak,
}: Props) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [protein, setProtein]           = useState<number>(initialProtein)
  const [water, setWater]               = useState<number>(initialWater)
  const [streak, setStreak]             = useState<number>(initialStreak)
  const [bestStreak, setBestStreak]     = useState<number>(initialBestStreak)
  const [adding, setAdding]             = useState<boolean>(false)
  const [custom, setCustom]             = useState<string>("")
  const [toast, setToast]               = useState<string | null>(null)

  const mealsChRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const waterChRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const todayStart = useCallback((): string => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d.toISOString()
  }, [])

  const refetchProtein = useCallback(async (): Promise<void> => {
    const { data } = await supabase
      .from("meals")
      .select("protein_g")
      .eq("user_id", userId)
      .gte("meal_time", todayStart())
    const total = (data ?? []).reduce(
      (s: number, m: { protein_g: number | null }) => s + (m.protein_g ?? 0),
      0
    )
    setProtein(total)
  }, [supabase, userId, todayStart])

  const refetchWater = useCallback(async (): Promise<void> => {
    const { data } = await supabase
      .from("water_logs")
      .select("amount_ml")
      .eq("user_id", userId)
      .gte("logged_at", todayStart())
    const total = (data ?? []).reduce(
      (s: number, w: { amount_ml: number | null }) => s + (w.amount_ml ?? 0),
      0
    )
    setWater(total)
  }, [supabase, userId, todayStart])

  const refetchStreak = useCallback(async (): Promise<void> => {
    const { data } = await supabase
      .from("behavioral_scores")
      .select("streak_days, best_streak")
      .eq("user_id", userId)
      .order("score_date", { ascending: false })
      .limit(1)
      .maybeSingle()
    if (data) {
      setStreak((data as { streak_days: number | null }).streak_days ?? 0)
      setBestStreak((data as { best_streak: number | null }).best_streak ?? 0)
    }
  }, [supabase, userId])

  const showToast = useCallback((msg: string): void => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }, [])

  const handleAddWater = useCallback(async (ml: number): Promise<void> => {
    if (ml <= 0 || adding) return
    setAdding(true)
    const { error } = await supabase.from("water_logs").insert({
      user_id: userId,
      amount_ml: ml,
      logged_at: new Date().toISOString(),
    })
    setAdding(false)
    setCustom("")
    if (error) {
      showToast("❌ " + error.message)
    } else {
      const label = ml >= 1000 ? `${(ml / 1000).toFixed(1)}L` : `${ml}ml`
      showToast(`✅ تمت إضافة ${label}`)
      await refetchWater()
    }
  }, [adding, supabase, userId, refetchWater, showToast])

  useEffect(() => {
    mealsChRef.current = supabase
      .channel(`meals-nutrition-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "meals", filter: `user_id=eq.${userId}` },
        () => { void refetchProtein() }
      )
      .subscribe()
    return () => {
      if (mealsChRef.current) supabase.removeChannel(mealsChRef.current)
    }
  }, [userId, supabase, refetchProtein])

  useEffect(() => {
    waterChRef.current = supabase
      .channel(`water-nutrition-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "water_logs", filter: `user_id=eq.${userId}` },
        () => { void refetchWater() }
      )
      .subscribe()
    return () => {
      if (waterChRef.current) supabase.removeChannel(waterChRef.current)
    }
  }, [userId, supabase, refetchWater])

  useEffect(() => {
    void refetchStreak()
  }, [refetchStreak])

  const isRecord = bestStreak > 0 && streak >= bestStreak

  return (
    <div className="space-y-3">

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-5">
        <h3 className="text-sm font-bold text-gray-800">اهداف اليوم</h3>

        {protein === 0 ? (
          <div className="flex items-center gap-3 py-1">
            <span className="text-2xl">🍽️</span>
            <div>
              <p className="text-sm font-semibold text-gray-700 m-0">لا وجبات مسجلة اليوم</p>
              <p className="text-xs text-gray-400 m-0">سجّل وجبتك الاولى لمتابعة البروتين</p>
            </div>
          </div>
        ) : (
          <Bar
            label="البروتين"
            emoji="🥩"
            value={protein}
            goal={proteinGoal}
            unit="g"
            color="bg-amber-500"
          />
        )}

        <hr className="border-gray-100" />

        {water === 0 ? (
          <div className="flex items-center gap-3 py-1">
            <span className="text-2xl">💧</span>
            <div>
              <p className="text-sm font-semibold text-gray-700 m-0">لم تشرب ماء بعد</p>
              <p className="text-xs text-gray-400 m-0">
                الهدف {(waterGoal / 1000).toFixed(1)}L — ابدا الان 👇
              </p>
            </div>
          </div>
        ) : (
          <Bar
            label="الماء"
            emoji="💧"
            value={water / 1000}
            goal={waterGoal / 1000}
            unit="L"
            color="bg-blue-500"
          />
        )}
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <p className="text-xs font-semibold text-gray-500 mb-3">اضافة ماء سريع</p>
        <div className="flex gap-2 items-center">
          {QUICK_ML.map((ml) => (
            <button
              key={ml}
              onClick={() => { void handleAddWater(ml) }}
              disabled={adding}
              className="flex-1 py-2 rounded-xl border-2 border-blue-200 bg-blue-50
                         text-blue-700 text-sm font-bold
                         hover:bg-blue-500 hover:text-white hover:border-blue-500
                         transition-all duration-150 disabled:opacity-50"
            >
              +{ml}ml
            </button>
          ))}
          <div className="flex gap-1.5 flex-[2]">
            <input
              type="number"
              placeholder="ml..."
              value={custom}
              min={1}
              max={2000}
              onChange={(e) => setCustom(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200
                         text-sm text-center bg-gray-50 outline-none
                         focus:border-blue-400"
              style={{ direction: "ltr" }}
            />
            <button
              onClick={() => { void handleAddWater(parseInt(custom, 10)) }}
              disabled={!custom || adding}
              className="px-3 py-2 rounded-xl bg-blue-500 text-white text-sm font-bold
                         disabled:opacity-40 hover:bg-blue-600 transition-colors"
            >
              {adding ? "..." : "+"}
            </button>
          </div>
        </div>
        {toast && (
          <p className={`text-xs text-center mt-2 font-medium ${
            toast.startsWith("✅") ? "text-green-600" : "text-red-500"
          }`}>
            {toast}
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100
                      flex items-center justify-between relative">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🔥</span>
          <div>
            <p className="text-xs text-gray-500 m-0">التزام متواصل</p>
            <p className="text-2xl font-bold text-gray-900 m-0 leading-tight">
              {streak}
              <span className="text-sm font-normal text-gray-400 mr-1">يوم</span>
            </p>
          </div>
        </div>
        <div className="text-left">
          <p className="text-xs text-gray-400 m-0">افضل سجل</p>
          <p className="text-lg font-bold text-indigo-600 m-0">{bestStreak} يوم</p>
        </div>
        {isRecord && (
          <span className="absolute -top-2 -left-2 bg-amber-400 text-white
                           text-xs font-bold px-2 py-1 rounded-lg shadow">
            🏆 رقم قياسي!
          </span>
        )}
      </div>

    </div>
  )
}