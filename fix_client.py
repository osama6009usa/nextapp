import pathlib

path = pathlib.Path(r"C:\nextapp\app\workout\WorkoutClient.tsx")
content = path.read_text(encoding="utf-8")

old = """            onSwapExercise={handleSwap}
            completedExercises={completedExercises}
            exerciseResults={exerciseResults}"""

new = """            onSwapExercise={handleSwap}
            completedExercises={completedExercises}
            exerciseResults={exerciseResults}
            onToggleLang={toggleLang}"""

content = content.replace(old, new)
path.write_text(content, encoding="utf-8")
print("Done")