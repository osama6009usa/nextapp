import pathlib

path = pathlib.Path(r"C:\nextapp\app\workout\components\PhasePrep.tsx")
content = path.read_text(encoding="utf-8")

# Add gridColumn span for last odd item
old = "{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: `1.5px solid ${isV || isS ? mc.color + '35' : 'rgba(30,50,90,0.06)'}`, display: 'flex', flexDirection: 'column', transition: 'all .25s', minHeight: 0 }"
new = "{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: `1.5px solid ${isV || isS ? mc.color + '35' : 'rgba(30,50,90,0.06)'}`, display: 'flex', flexDirection: 'column', transition: 'all .25s', minHeight: 0, gridColumn: (exercises.length % 2 !== 0 && i === exercises.length - 1) ? 'span 2' : 'auto' }"

content = content.replace(old, new)
path.write_text(content, encoding="utf-8")
print("Done")