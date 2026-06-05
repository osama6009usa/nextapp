import pathlib

path = pathlib.Path(r"C:\nextapp\app\workout\components\PhasePrep.tsx")
content = path.read_text(encoding="utf-8")

old = """interface Props {
  ar: boolean
  todayPlan: { nameAr: string; nameEn: string; groups: string[] }
  exercises: Exercise[]
  dailyContext: DailyContext
  aiPlan: AIWorkoutPlan | null
  isPlanLoading: boolean
  onStart: (restSeconds: number) => void
  onSwapExercise: (oldId: string, newExercise: Exercise) => void
  completedExercises?: string[]
  exerciseResults?: Record<string, { maxWeight: number; setsCompleted: number; newPR: boolean }>
}"""

new = """interface Props {
  ar: boolean
  todayPlan: { nameAr: string; nameEn: string; groups: string[] }
  exercises: Exercise[]
  dailyContext: DailyContext
  aiPlan: AIWorkoutPlan | null
  isPlanLoading: boolean
  onStart: (restSeconds: number) => void
  onSwapExercise: (oldId: string, newExercise: Exercise) => void
  completedExercises?: string[]
  exerciseResults?: Record<string, { maxWeight: number; setsCompleted: number; newPR: boolean }>
  onToggleLang?: () => void
}"""

content = content.replace(old, new)

old2 = "  ar, todayPlan, exercises, dailyContext, aiPlan, isPlanLoading,\n  onStart, onSwapExercise,\n  completedExercises = [],\n  exerciseResults = {},\n}: Props)"

new2 = "  ar, todayPlan, exercises, dailyContext, aiPlan, isPlanLoading,\n  onStart, onSwapExercise,\n  completedExercises = [],\n  exerciseResults = {},\n  onToggleLang,\n}: Props)"

content = content.replace(old2, new2)

# Add lang button next to back button in nav row
old3 = """            {ar ? 'الرئيسية' : 'Home'}
          </a>"""

new3 = """            {ar ? 'الرئيسية' : 'Home'}
          </a>
          <button onClick={onToggleLang} style={{ padding: '4px 10px', borderRadius: 7, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.7)', cursor: 'pointer', letterSpacing: '.5px' }}>
            {ar ? 'EN' : 'عر'}
          </button>"""

content = content.replace(old3, new3)
path.write_text(content, encoding="utf-8")
print("Done")