$path = 'C:\nextapp\BRAIN.md'
$content = [System.IO.File]::ReadAllText($path, [System.Text.UTF8Encoding]::new($false))
$content = $content.Replace('- S-09 صفحة الفريق — 14 متخصص + بطاقات + Empty State (static HTML معتمد) — WaterPage + useWaterLog + Realtime', '- S-09 صفحة الفريق — 14 متخصص + بطاقات + Empty State (static HTML معتمد)')
[System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))
Write-Host 'Done'
