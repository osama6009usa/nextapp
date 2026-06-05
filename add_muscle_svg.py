import pathlib

path = pathlib.Path(r"C:\nextapp\app\workout\components\PhasePrep.tsx")
content = path.read_text(encoding="utf-8")

# Replace the MUSCLE_IMG with SVG components
old = """const MUSCLE_IMG: Record<string, string> = {
  chest:     'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Muscular_system_anterior_labeled.png/200px-Muscular_system_anterior_labeled.png',
  back:      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Muscular_system_posterior_labeled.png/200px-Muscular_system_posterior_labeled.png',
  biceps:    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Muscular_system_anterior_labeled.png/200px-Muscular_system_anterior_labeled.png',
  triceps:   'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Muscular_system_posterior_labeled.png/200px-Muscular_system_posterior_labeled.png',
  legs:      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Muscular_system_anterior_labeled.png/200px-Muscular_system_anterior_labeled.png',
  shoulders: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Muscular_system_anterior_labeled.png/200px-Muscular_system_anterior_labeled.png',
}"""

new = """function MuscleSVG({ group, color }: { group: string; color: string }) {
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

content = content.replace(old, new)

# Now add MuscleSVG inside active card between muscle tag and weight
old2 = """                      <div style={{ textAlign: 'center', flexShrink: 0 }}>
                        {isPlanLoading"""

new2 = """                      <div style={{ width: 44, height: 52, flexShrink: 0, opacity: 0.85 }}>
                        <MuscleSVG group={ex.muscleGroup} color={mc.color} />
                      </div>
                      <div style={{ textAlign: 'center', flexShrink: 0 }}>
                        {isPlanLoading"""

content = content.replace(old2, new2)

path.write_text(content, encoding="utf-8")
print("Done")