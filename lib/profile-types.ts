// ═══════════════════════════════════════
// BioSovereignty — Profile Types
// الخطوات الست لإعداد الملف الشخصي
// ═══════════════════════════════════════

// ── الخطوة 1: البيانات الأساسية ──────────
export interface Step1Data {
  first_name:   string
  last_name:    string
  dob:          string        // YYYY-MM-DD
  gender:       'male' | 'female' | ''
  weight_kg:    number | null
  height_cm:    number | null
  blood_type:   string        // A+, A-, B+, ...
  timezone:     string
}

// ── الخطوة 2: InBody والجهاز ─────────────
export interface InBodyData {
  weight:   number | null
  fat:      number | null
  muscle:   number | null
  visceral: number | null
  bmr:      number | null
  water:    number | null
  note?:    string
  goals_hint?: string[]
}

export interface Step2Data {
  has_inbody:      'yes' | 'no' | ''
  inbody_data:     InBodyData | null
  inbody_date:     string
  wearable_device: 'whoop' | 'none' | ''
}

// ── الخطوة 3: الدستور الحيوي ─────────────
export type Constitution = 'vata' | 'pitta' | 'kapha' | ''

export interface Step3Data {
  answers:              ('vata' | 'pitta' | 'kapha' | null)[]
  bio_constitution:     Constitution
  constitution_scores:  { vata: number; pitta: number; kapha: number }
}

// ── الخطوة 4: نمط الحياة ──────────────────
export interface Step4Data {
  activity_level:      string
  diet_type:           string
  meals_per_day:       string
  last_meal_time:      string
  has_snack:           boolean | null
  snack_type:          string
  has_caffeine:        boolean | null
  caffeine_type:       string
  last_caffeine_time:  string
  daily_water:         string
  fasting_level:       string
  sleep_time:          string   // HH:MM ص/م
  wake_time:           string   // HH:MM ص/م
  sleep_hours:         number | null
}

// ── الخطوة 5: الحالة الصحية ──────────────
export interface InjuryItem {
  key:      string
  severity: 'mild' | 'mod' | 'sev' | ''
}

export interface SurgeryItem {
  name: string
  year: string
}

export interface Step5Data {
  chronic_conditions: Record<string, boolean>
  chronic_other:      string
  injuries:           Record<string, InjuryItem>
  no_injuries:        boolean
  surgeries:          SurgeryItem[]
  surgery_status:     'yes' | 'no' | ''
  medications:        string[]
  no_medications:     boolean
  smoking_status:     'no' | 'past' | 'yes' | ''
  smoking_packs:      number | null
  smoking_years:      number | null
  allergies:          Record<string, boolean>
  allergy_other:      string
  health_notes:       string
}

// ── الخطوة 6: الأهداف ─────────────────────
export interface Step6Data {
  goals:      string[]
  goals_mode: 'manual' | 'ai'
}

// ── الـ Profile كاملاً ─────────────────────
export interface ProfileSetupData {
  step1: Step1Data
  step2: Step2Data
  step3: Step3Data
  step4: Step4Data
  step5: Step5Data
  step6: Step6Data
}

// ── القيم الافتراضية ──────────────────────
export const defaultStep1: Step1Data = {
  first_name: '', last_name: '', dob: '', gender: '',
  weight_kg: null, height_cm: null, blood_type: '', timezone: '',
}
export const defaultStep2: Step2Data = {
  has_inbody: '', inbody_data: null, inbody_date: '', wearable_device: '',
}
export const defaultStep3: Step3Data = {
  answers: [null, null, null, null, null, null, null],
  bio_constitution: '',
  constitution_scores: { vata: 0, pitta: 0, kapha: 0 },
}
export const defaultStep4: Step4Data = {
  activity_level: '', diet_type: '', meals_per_day: '', last_meal_time: '',
  has_snack: null, snack_type: '', has_caffeine: null, caffeine_type: '',
  last_caffeine_time: '', daily_water: '', fasting_level: '',
  sleep_time: '', wake_time: '', sleep_hours: null,
}
export const defaultStep5: Step5Data = {
  chronic_conditions: {}, chronic_other: '', injuries: {}, no_injuries: false,
  surgeries: [], surgery_status: '', medications: [], no_medications: false,
  smoking_status: '', smoking_packs: null, smoking_years: null,
  allergies: {}, allergy_other: '', health_notes: '',
}
export const defaultStep6: Step6Data = {
  goals: [], goals_mode: 'manual',
}
export const defaultProfileSetup: ProfileSetupData = {
  step1: defaultStep1, step2: defaultStep2, step3: defaultStep3,
  step4: defaultStep4, step5: defaultStep5, step6: defaultStep6,
}
