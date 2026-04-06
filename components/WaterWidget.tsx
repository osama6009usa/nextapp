"use client";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useWaterToday } from "@/hooks/useWaterToday";

const PRIMARY_AMOUNT = 250;

function formatMl(ml: number): string {
  return ml >= 1000 ? `${(ml / 1000).toFixed(1)} L` : `${ml} مل`;
}

export default function WaterWidget() {
  const router = useRouter();
  const [toast, setToast] = useState<{type:string;msg:string}|null>(null);
  const { totalMl, goalMl, percentFilled, remainingMl, isGoalReached, addWater, isInserting } = useWaterToday();

  const showToast = (type:string, msg:string) => {
    setToast({type, msg});
    setTimeout(() => setToast(null), 2500);
  };

  const handleQuickAdd = useCallback(async () => {
    if (isInserting) return;
    try {
      await addWater(PRIMARY_AMOUNT);
      showToast("success", `تم تسجيل ${PRIMARY_AMOUNT} مل ✓`);
    } catch {
      showToast("error", "فشل الحفظ، حاول مجدداً");
    }
  }, [addWater, isInserting]);

  const progressColor = isGoalReached ? "#22C55E" : "#4F46E5";
  const pct = Math.min(percentFilled, 100);

  return (
    <div style={{ background:"#fff", borderRadius:14, padding:"16px 18px", direction:"rtl", fontFamily:"system-ui, sans-serif", position:"relative" }}>
      {toast && (
        <div style={{ position:"absolute", top:8, left:"50%", transform:"translateX(-50%)",
          background: toast.type==="success"?"#F0FDF4":"#FEF2F2",
          color: toast.type==="success"?"#16A34A":"#DC2626",
          padding:"6px 16px", borderRadius:20, fontSize:12, fontWeight:600, whiteSpace:"nowrap", zIndex:10 }}>
          {toast.msg}
        </div>
      )}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:15, fontWeight:600, color:"#1E293B" }}>💧 الماء</span>
        <div style={{ display:"flex", gap:6 }}>
          <button onClick={handleQuickAdd} disabled={isInserting}
            style={{ padding:"5px 12px", fontSize:12, fontWeight:700, color:"#fff",
              background:"#4F46E5", border:"none", borderRadius:8, cursor:"pointer",
              opacity: isInserting ? 0.6 : 1 }}>
            {isInserting ? "..." : "+ 250ml"}
          </button>
          <button onClick={() => router.push("/water")}
            style={{ padding:"5px 8px", fontSize:13, color:"#64748B",
              background:"#F1F5F9", border:"none", borderRadius:8, cursor:"pointer" }}>↗</button>
        </div>
      </div>
      <div style={{ margin:"10px 0 8px", background:"#F1F5F9", borderRadius:99, height:10, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:progressColor,
          borderRadius:99, transition:"width 0.4s ease" }} />
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:5, flexWrap:"wrap" }}>
        <span style={{ fontSize:15, fontWeight:700, color:progressColor }}>{formatMl(totalMl)}</span>
        <span style={{ fontSize:12, color:"#64748B" }}>من</span>
        <span style={{ fontSize:13, color:"#64748B" }}>{formatMl(goalMl)}</span>
        <span style={{ fontSize:12, color:"#64748B" }}>({pct}%)</span>
        {isGoalReached
          ? <span style={{ marginRight:"auto", fontSize:11, fontWeight:600, color:"#22C55E", background:"#F0FDF4", borderRadius:20, padding:"2px 10px" }}>✓ مكتمل</span>
          : <span style={{ marginRight:"auto", fontSize:11, color:"#64748B" }}>تبقى {formatMl(remainingMl)}</span>
        }
      </div>
    </div>
  );
}
