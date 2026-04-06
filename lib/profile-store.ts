// ═══════════════════════════════════════
// BioSovereignty — Profile Store
// حفظ بيانات الـ wizard مؤقتاً
// ═══════════════════════════════════════

import {
  ProfileSetupData,
  defaultProfileSetup,
} from './profile-types'

const KEY = 'biosov_profile_setup'

// حفظ كامل البيانات
export function saveSetupData(data: ProfileSetupData): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(KEY, JSON.stringify(data))
}

// قراءة البيانات
export function loadSetupData(): ProfileSetupData {
  if (typeof window === 'undefined') return defaultProfileSetup
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return defaultProfileSetup
    return { ...defaultProfileSetup, ...JSON.parse(raw) }
  } catch {
    return defaultProfileSetup
  }
}

// تحديث خطوة واحدة فقط
export function updateStep<K extends keyof ProfileSetupData>(
  key: K,
  data: ProfileSetupData[K]
): void {
  const current = loadSetupData()
  saveSetupData({ ...current, [key]: data })
}

// مسح البيانات بعد الحفظ النهائي
export function clearSetupData(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(KEY)
}

// الخطوة الحالية
export function getSetupStep(): number {
  if (typeof window === 'undefined') return 1
  return parseInt(sessionStorage.getItem('biosov_setup_step') || '1')
}

export function setSetupStep(step: number): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem('biosov_setup_step', String(step))
}
