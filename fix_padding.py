import pathlib

path = pathlib.Path(r"C:\nextapp\app\workout\components\PhasePrep.tsx")
content = path.read_text(encoding="utf-8")

# Fix bottom padding - reduce from 68px to 52px
content = content.replace(
    "padding: '6px 8px 68px',",
    "padding: '6px 8px 52px',"
)

# Fix grid row height calculation - account for button area
content = content.replace(
    "gridTemplateRows: `repeat(${rows}, minmax(0, calc((100vh - 210px) / ${rows})))`",
    "gridTemplateRows: `repeat(${rows}, minmax(0, calc((100vh - 195px) / ${rows})))`"
)

path.write_text(content, encoding="utf-8")
print("Done")