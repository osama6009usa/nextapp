import { supabase } from './supabase'

export interface SpecialistMemory {
  id: string
  specialist_id: string
  summary: string
  created_at: string
}

export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}

export interface Conversation {
  id: string
  specialist_id: string
  messages: ConversationMessage[]
  created_at: string
}

export interface MeetingRoom {
  id: string
  question: string
  specialist_ids: string[]
  responses: Record<string, string>
  verdict: string | null
  status: 'pending' | 'running' | 'done'
  created_at: string
}

export async function getSpecialistMemory(
  userId: string,
  specialistId: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from('memory_snapshots')
    .select('summary')
    .eq('user_id', userId)
    .eq('specialist_id', specialistId)
    .order('created_at', { ascending: false })
    .limit(5)

  if (error || !data) return []
  return data.map((d: { summary: string }) => d.summary)
}

export async function saveMemorySnapshot(
  userId: string,
  specialistId: string,
  summary: string
): Promise<void> {
  await supabase.from('memory_snapshots').insert({
    user_id: userId,
    specialist_id: specialistId,
    summary,
    created_at: new Date().toISOString(),
  })
}

export async function getLastConversations(
  userId: string,
  specialistId: string,
  limit = 5
): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .eq('specialist_id', specialistId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data) return []
  return data as Conversation[]
}

export async function saveConversation(
  userId: string,
  specialistId: string,
  messages: ConversationMessage[]
): Promise<string | null> {
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      user_id: userId,
      specialist_id: specialistId,
      messages,
      created_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error || !data) return null
  return data.id
}

export async function createMeetingRoom(
  userId: string,
  question: string,
  specialistIds: string[]
): Promise<string | null> {
  const { data, error } = await supabase
    .from('meeting_rooms')
    .insert({
      user_id: userId,
      question,
      specialist_ids: specialistIds,
      responses: {},
      verdict: null,
      status: 'pending',
      created_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error || !data) return null
  return data.id
}

export async function updateMeetingRoom(
  roomId: string,
  updates: Partial<Pick<MeetingRoom, 'responses' | 'verdict' | 'status'>>
): Promise<void> {
  await supabase.from('meeting_rooms').update(updates).eq('id', roomId)
}

export async function getTodayContext(userId: string): Promise<Record<string, string>> {
  const today = new Date().toISOString().split('T')[0]

  const [dailyRes, whoopRes] = await Promise.all([
    supabase
      .from('daily_logs')
      .select('protein_g, water_ml, calories, carbs_g, meals_count, fasting_hours')
      .eq('user_id', userId)
      .eq('date', today)
      .single(),
    supabase
      .from('whoop_logs')
      .select('hrv_ms, recovery_score, sleep_hours, strain, bedtime, wake_time, deep_sleep_pct')
      .eq('user_id', userId)
      .eq('date', today)
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
  ])

  const ctx: Record<string, string> = {}

  if (whoopRes.data) {
    const w = whoopRes.data
    if (w.hrv_ms) ctx['HRV'] = `${w.hrv_ms}ms`
    if (w.recovery_score) ctx['Recovery'] = `${w.recovery_score}%`
    if (w.sleep_hours) ctx['Sleep'] = `${w.sleep_hours}h`
    if (w.strain) ctx['Strain'] = `${w.strain}`
    if (w.bedtime) ctx['Bedtime'] = w.bedtime
    if (w.wake_time) ctx['Wake'] = w.wake_time
    if (w.deep_sleep_pct) ctx['Deep Sleep'] = `${w.deep_sleep_pct}%`
  }

  if (dailyRes.data) {
    const d = dailyRes.data
    if (d.protein_g) ctx['Protein'] = `${d.protein_g}g`
    if (d.water_ml) ctx['Water'] = `${(d.water_ml / 1000).toFixed(1)}L`
    if (d.calories) ctx['Calories'] = `${d.calories} kcal`
    if (d.carbs_g) ctx['Carbs'] = `${d.carbs_g}g`
    if (d.fasting_hours) ctx['Fasting Window'] = `${d.fasting_hours}h`
  }

  return Object.keys(ctx).length > 0 ? ctx : {
    HRV: '52ms', Recovery: '74%', Sleep: '6.5h', Strain: '14.2',
    Protein: '96g', Water: '2L', Calories: '1840 kcal',
  }
}