import Link from "next/link";

export function FastingEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-4 text-center">
      <div className="text-3xl">🍽️</div>
      <div>
        <p className="text-sm font-medium text-gray-800">
          لا وجبة مسجلة بعد
        </p>
        <p className="text-xs text-gray-500 mt-1">
          سجّل وجبتك الاخيرة لبدء تتبع الصيام
        </p>
      </div>
      <Link
        href="/meals/add"
        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
      >
        + تسجيل وجبة
      </Link>
    </div>
  );
}