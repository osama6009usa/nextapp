"use client"

import { useEffect } from "react"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[Dashboard Error]", error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#EEF2F8] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl p-8 text-center max-w-sm shadow-sm">
        <p className="text-4xl mb-3">!</p>
        <h2 className="text-lg font-bold text-gray-800 mb-2">Error</h2>
        <p className="text-sm text-gray-500 mb-5">{error.message}</p>
        <button
          onClick={reset}
          className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  )
}