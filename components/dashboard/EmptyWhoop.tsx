"use client"

import { useRouter } from "next/navigation"

export function EmptyWhoop() {
  const router = useRouter()

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-dashed border-gray-200 text-center">
      <div className="text-4xl mb-3">⌚</div>
      <h3 className="text-base font-bold text-gray-800 mb-1">
        لم تسجّل WHOOP اليوم
      </h3>
      <p className="text-sm text-gray-500 mb-5">
        أضف بيانات اليوم لرؤية Recovery + HRV + النوم + Daily Score
      </p>
      <button
        onClick={() => router.push("/whoop")}
        className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold text-sm shadow-md hover:bg-indigo-700 active:scale-95 transition-all"
      >
        📸 رفع صورة WHOOP
      </button>
    </div>
  )
}
