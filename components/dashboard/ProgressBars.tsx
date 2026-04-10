"use client"

interface Props {
  proteinConsumed: number   // grams
  proteinGoal: number       // grams
  waterConsumed: number     // ml
  waterGoal: number         // ml
}

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
  const rounded = Math.round(pct)

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
        <span>{rounded}%</span>
        <span>
          {pct >= 100
            ? "✅ اكتمل"
            : `متبقي: ${Math.round(goal - value)}${unit}`}
        </span>
      </div>
    </div>
  )
}

export function ProgressBars({
  proteinConsumed,
  proteinGoal,
  waterConsumed,
  waterGoal,
}: Props) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-5">
      <h3 className="text-sm font-bold text-gray-800">أهداف اليوم</h3>

      <Bar
        label="البروتين"
        emoji="🥩"
        value={proteinConsumed}
        goal={proteinGoal}
        unit="g"
        color="bg-amber-500"
      />

      <hr className="border-gray-100" />

      <Bar
        label="الماء"
        emoji="💧"
        value={waterConsumed / 1000}   // convert to liters for display
        goal={waterGoal / 1000}
        unit="L"
        color="bg-blue-500"
      />
    </div>
  )
}
