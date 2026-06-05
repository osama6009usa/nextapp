$path = 'C:\nextapp\BRAIN.md'
$content = [System.IO.File]::ReadAllText($path, [System.Text.UTF8Encoding]::new($false))
$content = $content.Replace('آخر تحديث  : 2026-04-20', 'آخر تحديث  : 2026-04-21')
$content = $content.Replace('الخطوة القادمة: S-09', 'الخطوة القادمة: S-09 (صفحة الفريق) ثم S-09b (تسجيل التمارين)')
$content = $content.Replace('+ RLS مفعّل', "+ RLS مفعّل`r`n`r`nworkouts schema: id, user_id, date, exercise_name(text), sets(jsonb: [{weight,reps,rpe}]), hrv_at_time(int), recovery_score(int), knee_flagged(bool), ai_suggestion(text), notes(text)`r`npr_records schema: id, user_id, exercise_name, weight, reps, date")
[System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))
Write-Host 'Done'
