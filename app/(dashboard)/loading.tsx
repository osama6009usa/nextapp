// S-04 Dashboard — Loading Skeleton
export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#EEF2F8] p-4 md:p-6" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header skeleton */}
        <div className="h-8 w-48 bg-white/60 rounded-xl animate-pulse" />

        {/* WHOOP metrics row */}
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white/60 rounded-2xl animate-pulse" />
          ))}
        </div>

        {/* Scores row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="h-24 bg-white/60 rounded-2xl animate-pulse" />
          <div className="h-24 bg-white/60 rounded-2xl animate-pulse" />
        </div>

        {/* Fasting timer */}
        <div className="h-28 bg-white/60 rounded-2xl animate-pulse" />

        {/* Progress bars */}
        <div className="h-36 bg-white/60 rounded-2xl animate-pulse" />
      </div>
    </div>
  )
}
