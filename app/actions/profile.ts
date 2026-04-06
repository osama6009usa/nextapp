'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { ProfileSetupData } from '@/lib/profile-types'

export async function saveProfile(data: ProfileSetupData) {
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) redirect('/login')

  const s1 = data.step1
  const s2 = data.step2
  const s3 = data.step3
  const s4 = data.step4
  const s5 = data.step5
  const s6 = data.step6

  const dob = new Date(s1.dob)
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id:                  user.id,
      user_id:             user.id,
      email:               user.email,
      full_name:           `${s1.first_name} ${s1.last_name}`.trim(),
      first_name:          s1.first_name,
      last_name:           s1.last_name,
      age,
      dob:                 s1.dob || null,
      gender:              s1.gender || null,
      weight_kg:           s1.weight_kg,
      height_cm:           s1.height_cm,
      blood_type:          s1.blood_type || null,
      timezone:            s1.timezone || null,
      inbody_weight:       s2.inbody_data?.weight ?? null,
      inbody_fat:          s2.inbody_data?.fat ?? null,
      inbody_muscle:       s2.inbody_data?.muscle ?? null,
      inbody_visceral:     s2.inbody_data?.visceral ?? null,
      inbody_bmr:          s2.inbody_data?.bmr ?? null,
      inbody_water:        s2.inbody_data?.water ?? null,
      inbody_date:         s2.inbody_date || null,
      wearable_device:     s2.wearable_device || 'none',
      bio_constitution:    s3.bio_constitution || null,
      constitution_scores: s3.constitution_scores,
      activity_level:      s4.activity_level || null,
      diet_type:           s4.diet_type || null,
      meals_per_day:       s4.meals_per_day || null,
      last_meal_time:      s4.last_meal_time || null,
      has_snack:           s4.has_snack,
      snack_type:          s4.snack_type || null,
      has_caffeine:        s4.has_caffeine,
      caffeine_type:       s4.caffeine_type || null,
      last_caffeine_time:  s4.last_caffeine_time || null,
      daily_water:         s4.daily_water || null,
      fasting_level:       s4.fasting_level || null,
      sleep_time:          s4.sleep_time || null,
      wake_time:           s4.wake_time || null,
      sleep_hours:         s4.sleep_hours,
      chronic_conditions:  s5.chronic_conditions,
      injuries:            s5.injuries,
      surgeries:           s5.surgeries,
      medications:         s5.medications,
      no_medications:      s5.no_medications,
      smoking_status:      s5.smoking_status || null,
      smoking_packs:       s5.smoking_packs,
      smoking_years:       s5.smoking_years,
      allergies:           s5.allergies,
      health_notes:        s5.health_notes || null,
      goals:               s6.goals,
      goals_mode:          s6.goals_mode,
      setup_step:          6,
      setup_completed:     true,
      is_complete:         true,
      updated_at:          new Date().toISOString(),
    }, { onConflict: 'id' })

  if (error) {
    console.error('saveProfile error:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
