"use client"

import { useState, useEffect } from "react"

interface Props {
  lastMealTime: string | null
  fastingWindow: number
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return String(h).padStart(2,"0") + ":" + String(m).padStart(2,"0") + ":" + String(s).padStart(2,"0")
}

export function FastingTimer({ lastMealTime, fastingWindow }: Props) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!lastMealTime) return
    const update = () => {
      const diff = Math.floor((Date.now() - new Date(lastMealTime).getTime()) / 1000)
      setElapsed(Math.max(0, diff))
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [lastMealTime])

  if (!lastMealTime) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
        <p className="text-sm font-semibold text-gray-700 mb-1">No meal logged today</p>
        <p className="text-xs text-gray-400 mb-3">Log a meal to start fasting timer</p>
        <a href="/meals/add" className="inline-block bg-indigo-600 text-white text-xs px-5 py-2 rounded-xl font-medium">
          + Add Meal
        </a>
      </div>
    )
  }

  const fastingSeconds = fastingWindow * 3600
  const progress = Math.min(elapsed / fastingSeconds, 1)
  const percent = Math.round(progress * 100)
  const isComplete = elapsed >= fastingSeconds

  const openAt = new Date(new Date(lastMealTime).getTime() + fastingSeconds * 1000)
  const openAtStr = openAt.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })

  const barColor = isComplete ? "bg-green-500" : progress > 0.75 ? "bg-yellow-500" : "bg-indigo-500"

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-gray-800">Fasting {fastingWindow}h</span>
        {isComplete ? (
          <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">Complete</span>
        ) : (
          <span className="text-xs text-gray-500">Opens {openAtStr}</span>
        )}
      </div>
      <div className="text-center my-3">
        <span className="text-4xl font-mono font-bold text-indigo-600 tracking-widest">
          {formatDuration(elapsed)}
        </span>
        <p className="text-xs text-gray-400 mt-1">
          {isComplete ? "Eating window open" : "Target: " + fastingWindow + ":00:00"}
        </p>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={"h-full rounded-full transition-all duration-1000 " + barColor} style={{ width: percent + "%" }} />
      </div>
      <p className="text-right text-xs text-gray-400 mt-1">{percent}%</p>
    </div>
  )
}