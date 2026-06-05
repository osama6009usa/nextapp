import pathlib, re

path = pathlib.Path(r"C:\nextapp\app\workout\components\PhasePrep.tsx")
content = path.read_text(encoding="utf-8")

# Find where MuscleSVG is called
matches = [m.start() for m in re.finditer("MuscleSVG", content)]
for m in matches:
    print(content[m:m+80])
    print("---")