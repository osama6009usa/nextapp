// ---------------------------------------------
//  BioSovereignty — Dashboard Types
// ---------------------------------------------

export interface DailyLog {
  id: string
  user_id: string
  log_date: string          // "YYYY-MM-DD"
  recovery_score: number | null   // 0-100
  hrv: number | null              // ms
  rhr: number | null              // bpm
  sleep_hours: number | null      // e.g. 7.5
  sleep_performance: number | null // 0-100
  strain: number | null           // 0-21
  created_at: string
}

export interface DailyScoreData {
  daily_score: number | null      // 0-100
  biosov_score: number | null     // 0-1000
  calculated_at: string | null
}

export interface MealEntry {
  id: string
  user_id: string
  meal_time: string               // ISO timestamp
  protein_g: number | null
  calories: number | null
  created_at: string
}

export interface WaterLog {
  id: string
  user_id: string
  logged_at: string               // ISO timestamp
  amount_ml: number
}

export interface UserGoals {
  protein_goal: number            // default 165
  water_goal_ml: number           // default 5000
  fasting_window: number          // default 18 (hours)
}

export interface DashboardData {
  dailyLog: DailyLog | null
  dailyScore: DailyScoreData | null
  totalProteinToday: number
  totalWaterToday: number
  lastMealTime: string | null
  userGoals: UserGoals
  hasWhoopData: boolean
  userId: string
}
