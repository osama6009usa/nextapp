import pathlib

path = pathlib.Path(r"C:\nextapp\app\workout\components\PhasePrep.tsx")
content = path.read_text(encoding="utf-8")

old_start = "function MuscleSVG({ group, color }: { group: string; color: string }) {"
old_end = "  return muscles[group] || muscles.chest\n}"

start_idx = content.find(old_start)
end_idx = content.find(old_end) + len(old_end)

new_func = """function MuscleSVG({ group, color }: { group: string; color: string }) {
  const c = color
  const bg = color + '18'
  const icons: Record<string, JSX.Element> = {
    chest: (
      <svg viewBox="0 0 80 80" width="100%" height="100%">
        <rect x="4" y="4" width="72" height="72" rx="16" fill={bg}/>
        {/* Chest - two pec muscles */}
        <path d="M12 28 Q20 20 38 26 Q38 42 20 46 Q10 42 12 28Z" fill={c} opacity="0.9"/>
        <path d="M68 28 Q60 20 42 26 Q42 42 60 46 Q70 42 68 28Z" fill={c} opacity="0.9"/>
        {/* Center line */}
        <line x1="40" y1="22" x2="40" y2="48" stroke={c} strokeWidth="1.5" opacity="0.4"/>
        {/* Collar bones */}
        <path d="M16 24 Q28 18 40 20 Q52 18 64 24" stroke={c} strokeWidth="2" fill="none" opacity="0.5" strokeLinecap="round"/>
      </svg>
    ),
    back: (
      <svg viewBox="0 0 80 80" width="100%" height="100%">
        <rect x="4" y="4" width="72" height="72" rx="16" fill={bg}/>
        {/* Traps */}
        <path d="M20 16 Q40 12 60 16 L56 30 Q40 26 24 30Z" fill={c} opacity="0.85"/>
        {/* Lats left */}
        <path d="M14 30 Q20 28 28 34 L26 58 Q14 52 12 40Z" fill={c} opacity="0.85"/>
        {/* Lats right */}
        <path d="M66 30 Q60 28 52 34 L54 58 Q66 52 68 40Z" fill={c} opacity="0.85"/>
        {/* Spine */}
        <line x1="40" y1="20" x2="40" y2="62" stroke={c} strokeWidth="1.5" opacity="0.35" strokeDasharray="3,3"/>
      </svg>
    ),
    biceps: (
      <svg viewBox="0 0 80 80" width="100%" height="100%">
        <rect x="4" y="4" width="72" height="72" rx="16" fill={bg}/>
        {/* Left arm */}
        <path d="M16 18 Q10 30 12 46 Q18 50 24 46 Q30 30 26 18Z" fill={c} opacity="0.85"/>
        {/* Bicep peak left */}
        <ellipse cx="19" cy="32" rx="6" ry="9" fill={c} opacity="0.5"/>
        {/* Right arm */}
        <path d="M64 18 Q70 30 68 46 Q62 50 56 46 Q50 30 54 18Z" fill={c} opacity="0.85"/>
        {/* Bicep peak right */}
        <ellipse cx="61" cy="32" rx="6" ry="9" fill={c} opacity="0.5"/>
        {/* Dumbbell */}
        <rect x="32" y="56" width="16" height="5" rx="2.5" fill={c} opacity="0.6"/>
        <rect x="28" y="54" width="6" height="9" rx="2" fill={c} opacity="0.8"/>
        <rect x="46" y="54" width="6" height="9" rx="2" fill={c} opacity="0.8"/>
      </svg>
    ),
    triceps: (
      <svg viewBox="0 0 80 80" width="100%" height="100%">
        <rect x="4" y="4" width="72" height="72" rx="16" fill={bg}/>
        {/* Left tricep - back of arm */}
        <path d="M14 20 Q8 34 10 50 Q16 56 22 50 Q24 34 20 20Z" fill={c} opacity="0.85"/>
        <path d="M14 32 Q10 42 14 50" stroke={c} strokeWidth="2" fill="none" opacity="0.5"/>
        {/* Right tricep */}
        <path d="M66 20 Q72 34 70 50 Q64 56 58 50 Q56 34 60 20Z" fill={c} opacity="0.85"/>
        <path d="M66 32 Q70 42 66 50" stroke={c} strokeWidth="2" fill="none" opacity="0.5"/>
        {/* Label */}
        <rect x="30" y="56" width="20" height="5" rx="2.5" fill={c} opacity="0.4"/>
      </svg>
    ),
    shoulders: (
      <svg viewBox="0 0 80 80" width="100%" height="100%">
        <rect x="4" y="4" width="72" height="72" rx="16" fill={bg}/>
        {/* Left deltoid */}
        <ellipse cx="18" cy="34" rx="13" ry="16" fill={c} opacity="0.85"/>
        <ellipse cx="18" cy="30" rx="8" ry="10" fill={c} opacity="0.5"/>
        {/* Right deltoid */}
        <ellipse cx="62" cy="34" rx="13" ry="16" fill={c} opacity="0.85"/>
        <ellipse cx="62" cy="30" rx="8" ry="10" fill={c} opacity="0.5"/>
        {/* Neck/trap center */}
        <rect x="34" y="14" width="12" height="20" rx="6" fill={c} opacity="0.5"/>
        {/* Collarbone */}
        <path d="M14 26 Q40 20 66 26" stroke={c} strokeWidth="2.5" fill="none" opacity="0.6" strokeLinecap="round"/>
      </svg>
    ),
    legs: (
      <svg viewBox="0 0 80 80" width="100%" height="100%">
        <rect x="4" y="4" width="72" height="72" rx="16" fill={bg}/>
        {/* Left quad */}
        <path d="M18 14 Q12 30 14 52 Q20 58 28 54 Q34 30 30 14Z" fill={c} opacity="0.85"/>
        {/* Left inner */}
        <path d="M28 18 Q32 32 30 52 Q26 56 24 52" stroke={c} strokeWidth="1.5" fill="none" opacity="0.4"/>
        {/* Right quad */}
        <path d="M62 14 Q68 30 66 52 Q60 58 52 54 Q46 30 50 14Z" fill={c} opacity="0.85"/>
        {/* Right inner */}
        <path d="M52 18 Q48 32 50 52 Q54 56 56 52" stroke={c} strokeWidth="1.5" fill="none" opacity="0.4"/>
        {/* Hip line */}
        <path d="M18 14 Q40 10 62 14" stroke={c} strokeWidth="2" fill="none" opacity="0.5" strokeLinecap="round"/>
      </svg>
    ),
  }
  return (
    <div style={{ width: "100%", height: "100%" }}>
      {icons[group] || icons.chest}
    </div>
  )
}"""

content = content[:start_idx] + new_func + content[end_idx:]
path.write_text(content, encoding="utf-8")
print("Done")