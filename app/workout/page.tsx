import { supabase } from '@/lib/supabase'
import WorkoutClient from './WorkoutClient'
import { DailyContext } from '@/lib/workoutAI'

const USER_ID = 'osama'

export default async function WorkoutPage() {
  
  const today = new Date().toISOString().split('T')[0]

  // Fetch daily context (HRV + Recovery)
  const { data: dailyLog } = await supabase
    .from('daily_logs')
    .select('hrv, recovery_score, knee_pain_level')
    .eq('user_id', USER_ID)
    .eq('date', today)
    .single()

  // Fetch last 10 workout sessions for context
  const { data: lastSessions } = await supabase
    .from('workouts')
    .select('exercise_name, sets, date')
    .eq('user_id', USER_ID)
    .order('date', { ascending: false })
    .limit(30)

  // Fetch PR records
  const { data: prRecords } = await supabase
    .from('pr_records')
    .select('*')
    .eq('user_id', USER_ID)

  // Fetch user goals
  const { data: profile } = await supabase
    .from('profiles')
    .select('goals')
    .eq('user_id', USER_ID)
    .single()

  const dailyContext: DailyContext = {
    hrv: dailyLog?.hrv ?? 52,
    recoveryScore: dailyLog?.recovery_score ?? 74,
    kneePainLevel: dailyLog?.knee_pain_level ?? 0,
    lastSessions: lastSessions?.map(s => ({
      exercise_name: s.exercise_name,
      sets: s.sets || [],
      date: s.date,
    })) || [],
    prRecords: prRecords || [],
    userGoals: profile?.goals || 'Ã˜Â¨Ã™â€ Ã˜Â§Ã˜Â¡ Ã˜Â¹Ã˜Â¶Ã™â€žÃ™Å  + Ã™â€šÃ™Ë†Ã˜Â© Ã˜Â¹Ã˜Â§Ã™â€¦Ã˜Â©',
  }

  return (
    <>
<WorkoutClient
        dailyContext={dailyContext}
        prRecords={prRecords || []}
        userId={USER_ID}
      />
    </>
  )
}
