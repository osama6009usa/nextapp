$path = 'C:\nextapp\BRAIN.md'
$content = [System.IO.File]::ReadAllText($path, [System.Text.UTF8Encoding]::new($false))
$content = $content.Replace('الخطوة القادمة: S-09 (صفحة الفريق) ثم S-09b (تسجيل التمارين)', 'الخطوة القادمة: S-09b (تسجيل التمارين)')
$content = $content.Replace('- S-08b Debate Mode — Courtroom + Claude API + Archive + Quota 3/day', '- S-08b Debate Mode — Courtroom + Claude API + Archive + Quota 3/day' + "`r`n- S-09 صفحة الفريق — 14 متخصص + بطاقات + Empty State (static HTML معتمد)")
[System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))
Write-Host 'Done'
