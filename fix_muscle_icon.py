import pathlib

path = pathlib.Path(r"C:\nextapp\app\workout\components\PhasePrep.tsx")
content = path.read_text(encoding="utf-8")

# Change the size of the muscle SVG container - bigger and centered
old = """                      <div style={{ width: 44, height: 52, flexShrink: 0, opacity: 0.85 }}>
                        <MuscleSVG group={ex.muscleGroup} color={mc.color} />
                      </div>"""

new = """                      <div style={{ width: 52, height: 64, flexShrink: 0, opacity: 0.9, filter: `drop-shadow(0 2px 6px ${mc.color}50)` }}>
                        <MuscleSVG group={ex.muscleGroup} color={mc.color} />
                      </div>"""

content = content.replace(old, new)
path.write_text(content, encoding="utf-8")
print("Done")