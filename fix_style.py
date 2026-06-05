import pathlib

path = pathlib.Path(r"C:\nextapp\app\workout\components\PhasePrep.tsx")
content = path.read_text(encoding="utf-8")

# Fix the style tag
content = content.replace(
    "<style>{\`",
    "<style>{`"
).replace(
    "\`}</style>",
    "`}</style>"
)

path.write_text(content, encoding="utf-8")
print("Done")