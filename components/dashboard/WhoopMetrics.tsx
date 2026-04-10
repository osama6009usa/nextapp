"use client"

import type { DailyLog } from "@/types/dashboard"

interface Props { log: DailyLog }

function MetricCard({
  label,
  value,
  unit,
  color,
  emoji,
}: {
  label: string
  value: number | null
  unit: string
  color: string
  emoji: string
}) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-1 mb-2">
        <span className="text-base">{emoji}</span>
        <span className="text-xs text-gray-500 font-medium">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold ${color}`}>
          {value !== null ? value : "—"}
        </span>
        <span className="text-xs text-gray-400">{unit}</span>
      </div>
    </div>
  )
}

// Recovery color coding
function recoveryColor(v: number | null): string {
  if (v === null) return "text-gray-400"
  if (v >= 67) return "text-green-600"
  if (v >= 34) return "text-yellow-500"
  return "text-red-500"
}

export function WhoopMetrics({ log }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <MetricCard
        label="التعافي"
        value={log.recovery_score}
        unit="%"
        color={recoveryColor(log.recovery_score)}
        emoji="🟢"
      />
      <MetricCard
        label="HRV"
        value={log.hrv}
        unit="ms"
        color="text-indigo-600"
        emoji="💓"
      />
      <MetricCard
        label="النوم"
        value={log.sleep_hours}
        unit="ساعة"
        color="text-purple-600"
        emoji="🌙"
      />
      <MetricCard
        label="الجهد (Strain)"
        value={log.strain}
        unit="/ 21"
        color="text-orange-500"
        emoji="⚡"
      />
    </div>
  )
}
