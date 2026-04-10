"use client"

interface Props {
  dailyScore: number | null
  biosovScore: number | null
}

export function ScoreCards({ dailyScore, biosovScore }: Props) {
  const dColor =
    dailyScore === null ? "text-gray-400"
    : dailyScore >= 75 ? "text-green-600"
    : dailyScore >= 50 ? "text-yellow-500"
    : "text-red-500"

  const bColor =
    biosovScore === null ? "text-gray-400"
    : biosovScore >= 750 ? "text-green-600"
    : biosovScore >= 500 ? "text-yellow-500"
    : "text-red-500"

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Daily Score */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <p className="text-xs text-gray-500 font-medium mb-1">📊 Daily Score</p>
        <div className="flex items-baseline gap-1">
          <span className={`text-3xl font-bold ${dColor}`}>
            {dailyScore !== null ? dailyScore : "—"}
          </span>
          <span className="text-xs text-gray-400">/ 100</span>
        </div>
        {dailyScore === null && (
          <p className="text-xs text-gray-400 mt-1">يُحسب بعد WHOOP</p>
        )}
      </div>

      {/* BioSov Score */}
      <div
        className="rounded-2xl p-4 shadow-sm border border-indigo-100"
        style={{
          background: "linear-gradient(135deg, #0F1629 0%, #1e2a4a 100%)",
        }}
      >
        <p className="text-xs text-indigo-300 font-medium mb-1">🧬 BioSov Score</p>
        <div className="flex items-baseline gap-1">
          <span className={`text-3xl font-bold ${biosovScore !== null ? "text-white" : "text-gray-500"}`}>
            {biosovScore !== null ? biosovScore : "—"}
          </span>
          <span className="text-xs text-indigo-400">/ 1000</span>
        </div>
        {biosovScore === null && (
          <p className="text-xs text-indigo-500 mt-1">يُبنى مع الوقت</p>
        )}
      </div>
    </div>
  )
}
