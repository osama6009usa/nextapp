import pathlib

path = pathlib.Path(r"C:\nextapp\app\workout\components\PhasePrep.tsx")
content = path.read_text(encoding="utf-8")

old = """function MuscleSVG({ group, color }: { group: string; color: string }) {
  const c = color
  const dim = 'rgba(30,50,90,0.08)'
  // Body outline shared
  const body = (
    <>
      {/* Head */}
      <ellipse cx="50" cy="12" rx="10" ry="12" fill={dim} />
      {/* Neck */}
      <rect x="45" y="22" width="10" height="6" fill={dim} />
      {/* Torso */}
      <rect x="30" y="28" width="40" height="44" rx="4" fill={dim} />
      {/* Left arm */}
      <rect x="14" y="28" width="14" height="36" rx="6" fill={dim} />
      {/* Right arm */}
      <rect x="72" y="28" width="14" height="36" rx="6" fill={dim} />
      {/* Left leg */}
      <rect x="30" y="74" width="16" height="42" rx="6" fill={dim} />
      {/* Right leg */}
      <rect x="54" y="74" width="16" height="42" rx="6" fill={dim} />
    </>
  )

  const highlights: Record<string, JSX.Element> = {
    chest: <rect x="32" y="30" width="36" height="20" rx="3" fill={c} opacity="0.7" />,
    back: <rect x="32" y="30" width="36" height="28" rx="3" fill={c} opacity="0.7" />,
    biceps: (
      <>
        <rect x="14" y="30" width="14" height="18" rx="6" fill={c} opacity="0.7" />
        <rect x="72" y="30" width="14" height="18" rx="6" fill={c} opacity="0.7" />
      </>
    ),
    triceps: (
      <>
        <rect x="14" y="44" width="14" height="18" rx="6" fill={c} opacity="0.7" />
        <rect x="72" y="44" width="14" height="18" rx="6" fill={c} opacity="0.7" />
      </>
    ),
    shoulders: (
      <>
        <ellipse cx="21" cy="30" rx="9" ry="8" fill={c} opacity="0.7" />
        <ellipse cx="79" cy="30" rx="9" ry="8" fill={c} opacity="0.7" />
      </>
    ),
    legs: (
      <>
        <rect x="30" y="74" width="16" height="42" rx="6" fill={c} opacity="0.7" />
        <rect x="54" y="74" width="16" height="42" rx="6" fill={c} opacity="0.7" />
      </>
    ),
  }

  return (
    <svg viewBox="0 0 100 120" width="100%" height="100%" style={{ display: "block" }}>
      {body}
      {highlights[group] || highlights.chest}
    </svg>
  )
}"""

new = """function MuscleSVG({ group, color }: { group: string; color: string }) {
  const dim = '#CBD5E1'
  const active = color
  const glow = color + '60'

  const muscles: Record<string, JSX.Element> = {
    chest: (
      <svg viewBox="0 0 100 130" width="100%" height="100%">
        <ellipse cx="50" cy="11" rx="9" ry="10" fill={dim}/>
        <rect x="44" y="20" width="12" height="6" rx="2" fill={dim}/>
        <rect x="28" y="26" width="44" height="46" rx="8" fill={dim}/>
        <rect x="14" y="26" width="13" height="38" rx="6" fill={dim}/>
        <rect x="73" y="26" width="13" height="38" rx="6" fill={dim}/>
        <rect x="28" y="74" width="19" height="48" rx="7" fill={dim}/>
        <rect x="53" y="74" width="19" height="48" rx="7" fill={dim}/>
        {/* Chest highlight */}
        <rect x="30" y="28" width="18" height="22" rx="5" fill={active} opacity="0.85"/>
        <rect x="52" y="28" width="18" height="22" rx="5" fill={active} opacity="0.85"/>
        <rect x="30" y="28" width="18" height="22" rx="5" fill="none" stroke={active} strokeWidth="1.5" opacity="0.5"/>
        <rect x="52" y="28" width="18" height="22" rx="5" fill="none" stroke={active} strokeWidth="1.5" opacity="0.5"/>
      </svg>
    ),
    back: (
      <svg viewBox="0 0 100 130" width="100%" height="100%">
        <ellipse cx="50" cy="11" rx="9" ry="10" fill={dim}/>
        <rect x="44" y="20" width="12" height="6" rx="2" fill={dim}/>
        <rect x="28" y="26" width="44" height="46" rx="8" fill={dim}/>
        <rect x="14" y="26" width="13" height="38" rx="6" fill={dim}/>
        <rect x="73" y="26" width="13" height="38" rx="6" fill={dim}/>
        <rect x="28" y="74" width="19" height="48" rx="7" fill={dim}/>
        <rect x="53" y="74" width="19" height="48" rx="7" fill={dim}/>
        {/* Back highlight - traps + lats */}
        <rect x="30" y="27" width="40" height="12" rx="4" fill={active} opacity="0.85"/>
        <rect x="30" y="42" width="16" height="26" rx="5" fill={active} opacity="0.75"/>
        <rect x="54" y="42" width="16" height="26" rx="5" fill={active} opacity="0.75"/>
      </svg>
    ),
    biceps: (
      <svg viewBox="0 0 100 130" width="100%" height="100%">
        <ellipse cx="50" cy="11" rx="9" ry="10" fill={dim}/>
        <rect x="44" y="20" width="12" height="6" rx="2" fill={dim}/>
        <rect x="28" y="26" width="44" height="46" rx="8" fill={dim}/>
        <rect x="14" y="26" width="13" height="38" rx="6" fill={dim}/>
        <rect x="73" y="26" width="13" height="38" rx="6" fill={dim}/>
        <rect x="28" y="74" width="19" height="48" rx="7" fill={dim}/>
        <rect x="53" y="74" width="19" height="48" rx="7" fill={dim}/>
        {/* Biceps highlight */}
        <rect x="14" y="28" width="13" height="20" rx="6" fill={active} opacity="0.9"/>
        <rect x="73" y="28" width="13" height="20" rx="6" fill={active} opacity="0.9"/>
        <ellipse cx="20" cy="36" rx="5" ry="7" fill="none" stroke={active} strokeWidth="1.5" opacity="0.6"/>
        <ellipse cx="80" cy="36" rx="5" ry="7" fill="none" stroke={active} strokeWidth="1.5" opacity="0.6"/>
      </svg>
    ),
    triceps: (
      <svg viewBox="0 0 100 130" width="100%" height="100%">
        <ellipse cx="50" cy="11" rx="9" ry="10" fill={dim}/>
        <rect x="44" y="20" width="12" height="6" rx="2" fill={dim}/>
        <rect x="28" y="26" width="44" height="46" rx="8" fill={dim}/>
        <rect x="14" y="26" width="13" height="38" rx="6" fill={dim}/>
        <rect x="73" y="26" width="13" height="38" rx="6" fill={dim}/>
        <rect x="28" y="74" width="19" height="48" rx="7" fill={dim}/>
        <rect x="53" y="74" width="19" height="48" rx="7" fill={dim}/>
        {/* Triceps highlight */}
        <rect x="14" y="44" width="13" height="20" rx="6" fill={active} opacity="0.9"/>
        <rect x="73" y="44" width="13" height="20" rx="6" fill={active} opacity="0.9"/>
      </svg>
    ),
    shoulders: (
      <svg viewBox="0 0 100 130" width="100%" height="100%">
        <ellipse cx="50" cy="11" rx="9" ry="10" fill={dim}/>
        <rect x="44" y="20" width="12" height="6" rx="2" fill={dim}/>
        <rect x="28" y="26" width="44" height="46" rx="8" fill={dim}/>
        <rect x="14" y="26" width="13" height="38" rx="6" fill={dim}/>
        <rect x="73" y="26" width="13" height="38" rx="6" fill={dim}/>
        <rect x="28" y="74" width="19" height="48" rx="7" fill={dim}/>
        <rect x="53" y="74" width="19" height="48" rx="7" fill={dim}/>
        {/* Shoulders highlight */}
        <ellipse cx="22" cy="28" rx="10" ry="9" fill={active} opacity="0.9"/>
        <ellipse cx="78" cy="28" rx="10" ry="9" fill={active} opacity="0.9"/>
      </svg>
    ),
    legs: (
      <svg viewBox="0 0 100 130" width="100%" height="100%">
        <ellipse cx="50" cy="11" rx="9" ry="10" fill={dim}/>
        <rect x="44" y="20" width="12" height="6" rx="2" fill={dim}/>
        <rect x="28" y="26" width="44" height="46" rx="8" fill={dim}/>
        <rect x="14" y="26" width="13" height="38" rx="6" fill={dim}/>
        <rect x="73" y="26" width="13" height="38" rx="6" fill={dim}/>
        {/* Legs highlight */}
        <rect x="28" y="74" width="19" height="48" rx="7" fill={active} opacity="0.9"/>
        <rect x="53" y="74" width="19" height="48" rx="7" fill={active} opacity="0.9"/>
      </svg>
    ),
  }

  return muscles[group] || muscles.chest
}"""

content = content.replace(old, new)
path.write_text(content, encoding="utf-8")
print("Done")