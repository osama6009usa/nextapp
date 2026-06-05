import pathlib

path = pathlib.Path(r"C:\nextapp\app\workout\components\PhasePrep.tsx")
content = path.read_text(encoding="utf-8")

old = "gridTemplateRows: `repeat(${rows}, 1fr)`,"
new = "gridTemplateRows: `repeat(${rows}, minmax(0, calc((100vh - 210px) / ${rows})))`,"

content = content.replace(old, new)
path.write_text(content, encoding="utf-8")
print("Done")