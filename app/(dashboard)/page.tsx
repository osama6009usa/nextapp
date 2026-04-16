import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getDashboardData } from "@/lib/dashboard-data"
import { WhoopMetrics } from "@/components/dashboard/WhoopMetrics"
import { ScoreCards } from "@/components/dashboard/ScoreCards"
import { FastingTimerDetailed } from "@/components/fasting/FastingTimerDetailed"
import { EmptyWhoop } from "@/components/dashboard/EmptyWhoop"
import { NutritionSection } from "@/components/dashboard/NutritionSection"

export default async function DashboardPage() {
  let data
  try {
    data = await getDashboardData()
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      redirect("/login")
    }
    throw err
  }

  const {
    userId,
    dailyLog,
    dailyScore,
    totalProteinToday,
    totalWaterToday,
    userGoals,
    hasWhoopData,
  } = data

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? "صباح النور" : hour < 17 ? "مساء الخير" : "مساء النور"

  return (
    <div className="min-h-screen bg-[#EEF2F8] pb-24" dir="rtl">
      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-4">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs text-gray-500 font-medium">
              {new Date().toLocaleDateString("ar-SA", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <h1 className="text-xl font-bold text-gray-900">{greeting} 👋</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-md">
            أ
          </div>
        </div>

        {/* ── WHOOP ── */}
        {!hasWhoopData ? (
          <EmptyWhoop />
        ) : (
          <WhoopMetrics log={dailyLog!} />
        )}

        {/* ── Scores ── */}
        <Suspense fallback={<div className="h-24 bg-white/60 rounded-2xl animate-pulse" />}>
          <ScoreCards
            dailyScore={dailyScore?.daily_score ?? null}
            biosovScore={dailyScore?.biosov_score ?? null}
          />
        </Suspense>

        {/* ── Fasting Timer ── */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">عداد الصيام</h2>
          <FastingTimerDetailed userId={userId} />
        </div>

        {/* ── Nutrition: Protein + Water + Streak ── */}
        <NutritionSection
          userId={userId}
          initialProtein={totalProteinToday}
          proteinGoal={userGoals.protein_goal}
          initialWater={totalWaterToday}
          waterGoal={userGoals.water_goal_ml}
          initialStreak={0}
          initialBestStreak={0}
        />

      </div>
    </div>
  )
}