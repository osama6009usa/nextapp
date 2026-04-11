"use client";

import { useFastingTimer } from "./useFastingTimer";
import { FastingEmptyState } from "./FastingEmptyState";

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function getMetabolicState(elapsedHours: number) {
  if (elapsedHours < 4)
    return { label: "هضم", color: "text-blue-600", bg: "bg-blue-50" };
  if (elapsedHours < 8)
    return { label: "استنزاف الجليكوجين", color: "text-yellow-600", bg: "bg-yellow-50" };
  if (elapsedHours < 12)
    return { label: "تحول التمثيل الغذائي", color: "text-orange-600", bg: "bg-orange-50" };
  return { label: "حرق دهون - Ketosis", color: "text-green-600", bg: "bg-green-50" };
}

interface Props {
  userId: string;
}

export function FastingTimerDetailed({ userId }: Props) {
  const {
    lastMealTime,
    elapsedSeconds,
    fastingWindowHours,
    remainingSeconds,
    progressPercent,
    isWindowOpen,
    eatingWindowOpensAt,
    isLoading,
    error,
  } = useFastingTimer(userId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 text-center">
        {error}
      </div>
    );
  }

  if (!lastMealTime) {
    return <FastingEmptyState />;
  }

  const elapsedHours = elapsedSeconds / 3600;
  const metabolic = getMetabolicState(elapsedHours);

  return (
    <div className="flex flex-col gap-4" dir="rtl">
      <div className="text-center">
        <div className="text-5xl font-mono font-bold tracking-wider text-gray-900 tabular-nums">
          {formatDuration(elapsedSeconds)}
        </div>
        <p className="text-xs text-gray-500 mt-1">وقت الصيام المنقضي</p>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-500">
          <span>0h</span>
          <span>الهدف: {fastingWindowHours}h</span>
        </div>
        <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${progressPercent}%`,
              background: isWindowOpen
                ? "linear-gradient(90deg, #00A87A, #34d399)"
                : "linear-gradient(90deg, #4F46E5, #818cf8)",
            }}
          />
        </div>
        <div className="text-center text-xs text-gray-500">
          {Math.round(progressPercent)}% مكتمل
        </div>
      </div>

      <div className={`rounded-xl px-3 py-2 text-center text-sm font-medium ${metabolic.bg} ${metabolic.color}`}>
        {metabolic.label}
      </div>

      <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
        {isWindowOpen ? (
          <div className="text-center">
            <div className="text-green-600 font-semibold text-sm">
              نافذة الاكل مفتوحة الان
            </div>
            <p className="text-xs text-gray-500 mt-1">
              فتحت منذ{" "}
              <span className="font-mono font-medium">
                {formatDuration(elapsedSeconds - fastingWindowHours * 3600)}
              </span>
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">نافذة الاكل تفتح في</p>
              <p className="text-xl font-bold font-mono text-gray-900 tabular-nums">
                {eatingWindowOpensAt ? formatTime(eatingWindowOpensAt) : "--:--"}
              </p>
            </div>
            <div className="text-left">
              <p className="text-xs text-gray-500">المتبقي</p>
              <p className="text-sm font-mono font-semibold text-indigo-600 tabular-nums">
                {formatDuration(remainingSeconds)}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
        <span>اخر وجبة</span>
        <span className="font-medium text-gray-700">
          {formatTime(lastMealTime)} {lastMealTime.toLocaleDateString("ar-SA", {
            weekday: "short",
            day: "numeric",
            month: "short",
          })}
        </span>
      </div>
    </div>
  );
}