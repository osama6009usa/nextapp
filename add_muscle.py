import pathlib

path = pathlib.Path(r"C:\nextapp\app\workout\components\PhasePrep.tsx")
content = path.read_text(encoding="utf-8")

# Add muscle image map after MC definition
muscle_images = """
const MUSCLE_IMG: Record<string, string> = {
  chest:     'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Muscular_system_anterior_labeled.png/200px-Muscular_system_anterior_labeled.png',
  back:      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Muscular_system_posterior_labeled.png/200px-Muscular_system_posterior_labeled.png',
  biceps:    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Muscular_system_anterior_labeled.png/200px-Muscular_system_anterior_labeled.png',
  triceps:   'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Muscular_system_posterior_labeled.png/200px-Muscular_system_posterior_labeled.png',
  legs:      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Muscular_system_anterior_labeled.png/200px-Muscular_system_anterior_labeled.png',
  shoulders: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Muscular_system_anterior_labeled.png/200px-Muscular_system_anterior_labeled.png',
}
"""

content = content.replace(
    "const SWAP_OPTIONS",
    muscle_images + "\nconst SWAP_OPTIONS"
)

path.write_text(content, encoding="utf-8")
print("Done")