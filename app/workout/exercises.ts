export interface Exercise {
  id: string
  nameAr: string
  nameEn: string
  muscleGroup: 'chest' | 'back' | 'legs' | 'shoulders' | 'biceps' | 'triceps' | 'core' | 'cardio'
  muscleGroupAr: string
  kneeFlag: boolean
  defaultSets: number
  defaultReps: number
  videoUrl: string
  thumbnailEmoji: string
  notes?: string
  notesAr?: string
}

export const EXERCISES: Exercise[] = [
  { id: 'bench-press', nameAr: '\u0628\u0646\u0634 \u0628\u0631\u0633', nameEn: 'Bench Press', muscleGroup: 'chest', muscleGroupAr: '\u0635\u062f\u0631', kneeFlag: false, defaultSets: 4, defaultReps: 8, videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg', thumbnailEmoji: '\uD83C\uDFCB\uFE0F' },
  { id: 'incline-bench', nameAr: '\u0628\u0646\u0634 \u0645\u0627\u0626\u0644', nameEn: 'Incline Bench Press', muscleGroup: 'chest', muscleGroupAr: '\u0635\u062f\u0631 \u0639\u0644\u0648\u064a', kneeFlag: false, defaultSets: 3, defaultReps: 10, videoUrl: 'https://www.youtube.com/watch?v=8iPEnn-ltC8', thumbnailEmoji: '\uD83D\uDCC8' },
  { id: 'dumbbell-fly', nameAr: '\u0641\u0631\u0627\u0634\u0629 \u062f\u0645\u0628\u0644', nameEn: 'Dumbbell Fly', muscleGroup: 'chest', muscleGroupAr: '\u0635\u062f\u0631', kneeFlag: false, defaultSets: 3, defaultReps: 12, videoUrl: 'https://www.youtube.com/watch?v=eozdVDA78K0', thumbnailEmoji: '\uD83E\uDD8B' },
  { id: 'cable-crossover', nameAr: '\u0643\u0631\u0648\u0633 \u0623\u0648\u0641\u0631', nameEn: 'Cable Crossover', muscleGroup: 'chest', muscleGroupAr: '\u0635\u062f\u0631 \u0633\u0641\u0644\u064a', kneeFlag: false, defaultSets: 3, defaultReps: 12, videoUrl: 'https://www.youtube.com/watch?v=taI4XduLpTk', thumbnailEmoji: '\uD83D\uDD00' },
  { id: 'pushup', nameAr: '\u0636\u063a\u0637 \u0623\u0631\u0636\u064a', nameEn: 'Push-Up', muscleGroup: 'chest', muscleGroupAr: '\u0635\u062f\u0631 + \u062b\u0644\u0627\u062b\u064a', kneeFlag: false, defaultSets: 3, defaultReps: 15, videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4', thumbnailEmoji: '\uD83D\uDCAA' },
  { id: 'barbell-curl', nameAr: '\u0643\u064a\u0631\u0644 \u0628\u0627\u0631', nameEn: 'Barbell Curl', muscleGroup: 'biceps', muscleGroupAr: '\u062b\u0646\u0627\u0626\u064a', kneeFlag: false, defaultSets: 4, defaultReps: 10, videoUrl: 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo', thumbnailEmoji: '\uD83D\uDCAA' },
  { id: 'hammer-curl', nameAr: '\u0647\u0627\u0645\u0631 \u0643\u064a\u0631\u0644', nameEn: 'Hammer Curl', muscleGroup: 'biceps', muscleGroupAr: '\u062b\u0646\u0627\u0626\u064a + \u0628\u0631\u0627\u0643\u064a\u0644\u064a\u0633', kneeFlag: false, defaultSets: 3, defaultReps: 12, videoUrl: 'https://www.youtube.com/watch?v=zC3nLlEvin4', thumbnailEmoji: '\uD83D\uDD28' },
  { id: 'incline-curl', nameAr: '\u0643\u064a\u0631\u0644 \u0645\u0627\u0626\u0644', nameEn: 'Incline Dumbbell Curl', muscleGroup: 'biceps', muscleGroupAr: '\u062b\u0646\u0627\u0626\u064a \u0637\u0648\u064a\u0644', kneeFlag: false, defaultSets: 3, defaultReps: 10, videoUrl: 'https://www.youtube.com/watch?v=soxrZlIl35U', thumbnailEmoji: '\uD83D\uDCC8' },
  { id: 'cable-curl', nameAr: '\u0643\u064a\u0631\u0644 \u0643\u0627\u0628\u0644', nameEn: 'Cable Curl', muscleGroup: 'biceps', muscleGroupAr: '\u062b\u0646\u0627\u0626\u064a', kneeFlag: false, defaultSets: 3, defaultReps: 12, videoUrl: 'https://www.youtube.com/watch?v=NFzTWp2qpiE', thumbnailEmoji: '\uD83D\uDD04' },
  { id: 'deadlift', nameAr: '\u062f\u064a\u062f\u0644\u064a\u0641\u062a', nameEn: 'Deadlift', muscleGroup: 'back', muscleGroupAr: '\u0638\u0647\u0631 \u0643\u0627\u0645\u0644', kneeFlag: true, defaultSets: 4, defaultReps: 5, videoUrl: 'https://www.youtube.com/watch?v=op9kVnSso6Q', thumbnailEmoji: '\uD83C\uDFCB\uFE0F' },
  { id: 'pullup', nameAr: '\u0639\u0642\u0644\u0629', nameEn: 'Pull-Up', muscleGroup: 'back', muscleGroupAr: '\u0638\u0647\u0631 \u0639\u0644\u0648\u064a', kneeFlag: false, defaultSets: 4, defaultReps: 8, videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g', thumbnailEmoji: '\uD83D\uDD3C' },
  { id: 'barbell-row', nameAr: '\u0631\u0648 \u0628\u0627\u0631', nameEn: 'Barbell Row', muscleGroup: 'back', muscleGroupAr: '\u0638\u0647\u0631 \u0623\u0648\u0633\u0637', kneeFlag: false, defaultSets: 4, defaultReps: 8, videoUrl: 'https://www.youtube.com/watch?v=FWJR5Ve8bnQ', thumbnailEmoji: '\uD83D\uDEB4' },
  { id: 'lat-pulldown', nameAr: '\u0644\u0627\u062a \u0628\u0648\u0644\u062f\u0627\u0648\u0646', nameEn: 'Lat Pulldown', muscleGroup: 'back', muscleGroupAr: '\u0639\u0631\u064a\u0636 \u0627\u0644\u0638\u0647\u0631', kneeFlag: false, defaultSets: 3, defaultReps: 10, videoUrl: 'https://www.youtube.com/watch?v=CAwf7n6Luuc', thumbnailEmoji: '\u2B07\uFE0F' },
  { id: 'squat', nameAr: '\u0633\u0643\u0648\u0627\u062a', nameEn: 'Squat', muscleGroup: 'legs', muscleGroupAr: '\u0623\u0631\u062c\u0644 \u0643\u0627\u0645\u0644\u0629', kneeFlag: true, defaultSets: 4, defaultReps: 8, videoUrl: 'https://www.youtube.com/watch?v=ultWZbUMPL8', thumbnailEmoji: '\uD83E\uDDB5' },
  { id: 'leg-press', nameAr: '\u0644\u064a\u062c \u0628\u0631\u0633', nameEn: 'Leg Press', muscleGroup: 'legs', muscleGroupAr: '\u0631\u0628\u0627\u0639\u064a\u0629 \u0627\u0644\u0631\u0623\u0633', kneeFlag: true, defaultSets: 4, defaultReps: 10, videoUrl: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ', thumbnailEmoji: '\uD83E\uDDBF' },
  { id: 'leg-curl', nameAr: '\u0644\u064a\u062c \u0643\u064a\u0631\u0644', nameEn: 'Leg Curl', muscleGroup: 'legs', muscleGroupAr: '\u062b\u0646\u0627\u0626\u064a \u0627\u0644\u0641\u062e\u0630', kneeFlag: true, defaultSets: 3, defaultReps: 12, videoUrl: 'https://www.youtube.com/watch?v=1Tq3QdYUuHs', thumbnailEmoji: '\uD83C\uDF00' },
  { id: 'ohp', nameAr: '\u0623\u0648\u0641\u0631 \u0647\u064a\u062f \u0628\u0631\u0633', nameEn: 'Overhead Press', muscleGroup: 'shoulders', muscleGroupAr: '\u0643\u062a\u0641 \u0623\u0645\u0627\u0645\u064a', kneeFlag: false, defaultSets: 4, defaultReps: 8, videoUrl: 'https://www.youtube.com/watch?v=2yjwXTZQDDI', thumbnailEmoji: '\uD83D\uDE4C' },
  { id: 'lateral-raise', nameAr: '\u0631\u0641\u0639 \u062c\u0627\u0646\u0628\u064a', nameEn: 'Lateral Raise', muscleGroup: 'shoulders', muscleGroupAr: '\u0643\u062a\u0641 \u062c\u0627\u0646\u0628\u064a', kneeFlag: false, defaultSets: 3, defaultReps: 15, videoUrl: 'https://www.youtube.com/watch?v=3VcKaXpzqRo', thumbnailEmoji: '\u2194\uFE0F' },
  { id: 'tricep-pushdown', nameAr: '\u062a\u0631\u0627\u064a\u0633\u0628\u0633 \u0628\u0648\u0634\u062f\u0627\u0648\u0646', nameEn: 'Tricep Pushdown', muscleGroup: 'triceps', muscleGroupAr: '\u062b\u0644\u0627\u062b\u064a', kneeFlag: false, defaultSets: 3, defaultReps: 12, videoUrl: 'https://www.youtube.com/watch?v=2-LAMcpzODU', thumbnailEmoji: '\u2B07\uFE0F' },
  { id: 'skull-crusher', nameAr: '\u0633\u0643\u0627\u0644 \u0643\u0631\u0627\u0634\u0631', nameEn: 'Skull Crusher', muscleGroup: 'triceps', muscleGroupAr: '\u062b\u0644\u0627\u062b\u064a \u0637\u0648\u064a\u0644', kneeFlag: false, defaultSets: 3, defaultReps: 10, videoUrl: 'https://www.youtube.com/watch?v=d_KZxkY_0cM', thumbnailEmoji: '\uD83D\uDC80' },
  { id: 'dips', nameAr: '\u062f\u064a\u0628\u0633', nameEn: 'Dips', muscleGroup: 'triceps', muscleGroupAr: '\u062b\u0644\u0627\u062b\u064a + \u0635\u062f\u0631', kneeFlag: false, defaultSets: 3, defaultReps: 10, videoUrl: 'https://www.youtube.com/watch?v=2z8JmcrW-As', thumbnailEmoji: '\uD83C\uDFCA' },
]

export const MUSCLE_GROUPS = [
  { id: 'chest', labelAr: '\u0635\u062f\u0631', labelEn: 'Chest', color: '#1A73E8', emoji: '\uD83D\uDC99' },
  { id: 'biceps', labelAr: '\u062b\u0646\u0627\u0626\u064a', labelEn: 'Biceps', color: '#7C3AED', emoji: '\uD83D\uDC9C' },
  { id: 'back', labelAr: '\u0638\u0647\u0631', labelEn: 'Back', color: '#00A87A', emoji: '\uD83D\uDC9A' },
  { id: 'legs', labelAr: '\u0623\u0631\u062c\u0644', labelEn: 'Legs', color: '#D97706', emoji: '\uD83D\uDFE1' },
  { id: 'shoulders', labelAr: '\u0643\u062a\u0641', labelEn: 'Shoulders', color: '#DC2626', emoji: '\u2764\uFE0F' },
  { id: 'triceps', labelAr: '\u062b\u0644\u0627\u062b\u064a', labelEn: 'Triceps', color: '#0891B2', emoji: '\uD83D\uDFE6' },
]

export const DEFAULT_WEEKLY_PLAN = {
  0: { nameAr: '\u0631\u0627\u062d\u0629', nameEn: 'Rest', groups: [] },
  1: { nameAr: '\u0635\u062f\u0631 + \u062b\u0646\u0627\u0626\u064a', nameEn: 'Chest + Biceps', groups: ['chest', 'biceps'] },
  2: { nameAr: '\u0638\u0647\u0631 + \u062b\u0644\u0627\u062b\u064a', nameEn: 'Back + Triceps', groups: ['back', 'triceps'] },
  3: { nameAr: '\u0638\u0647\u0631 + \u062b\u0644\u0627\u062b\u064a', nameEn: 'Back + Triceps', groups: ['back', 'triceps'] },
  4: { nameAr: '\u0623\u0631\u062c\u0644', nameEn: 'Legs', groups: ['legs'] },
  5: { nameAr: '\u0643\u062a\u0641 + \u0639\u0636\u0644\u0627\u062a \u0635\u063a\u064a\u0631\u0629', nameEn: 'Shoulders + Arms', groups: ['shoulders', 'biceps', 'triceps'] },
  6: { nameAr: '\u0631\u0627\u062d\u0629', nameEn: 'Rest', groups: [] },
}

export function getTodayPlan() {
  const day = new Date().getDay()
  return DEFAULT_WEEKLY_PLAN[day as keyof typeof DEFAULT_WEEKLY_PLAN]
}

export function getExercisesForGroups(groups: string[]): Exercise[] {
  return EXERCISES.filter(e => groups.includes(e.muscleGroup))
}