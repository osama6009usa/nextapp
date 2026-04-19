$ErrorActionPreference = "Stop"
$base = Split-Path -Parent $MyInvocation.MyCommand.Path

$dirs = @(
  "lib",
  "app\api\team\chat",
  "app\api\team\meeting",
  "app\team\hooks",
  "app\team\components"
)
foreach ($d in $dirs) {
  $full = Join-Path $base $d
  if (!(Test-Path $full)) { New-Item -ItemType Directory -Path $full -Force | Out-Null }
}

Write-Host "=== Running S08 Part 1: Data files ===" -ForegroundColor Cyan
& powershell -ExecutionPolicy Bypass -File "$base\S08_part1_data.ps1"

Write-Host "=== Running S08 Part 2: API routes ===" -ForegroundColor Cyan
& powershell -ExecutionPolicy Bypass -File "$base\S08_part2_api.ps1"

Write-Host "=== Running S08 Part 3: Main page ===" -ForegroundColor Cyan
& powershell -ExecutionPolicy Bypass -File "$base\S08_part3_page.ps1"

Write-Host "=== Running S08 Part 4: Components ===" -ForegroundColor Cyan
& powershell -ExecutionPolicy Bypass -File "$base\S08_part4_components.ps1"

Write-Host "=== Running S08 Part 5: Remaining components ===" -ForegroundColor Cyan
& powershell -ExecutionPolicy Bypass -File "$base\S08_part5_final.ps1"

Write-Host ""
Write-Host "=== S08 COMPLETE ===" -ForegroundColor Green
Write-Host "Files written:" -ForegroundColor Green
Write-Host "  lib/specialists.ts"
Write-Host "  lib/team-context.ts"
Write-Host "  lib/team-supabase.ts"
Write-Host "  app/api/team/chat/route.ts"
Write-Host "  app/api/team/meeting/route.ts"
Write-Host "  app/team/page.tsx"
Write-Host "  app/team/hooks/useSpecialistChat.ts"
Write-Host "  app/team/hooks/useMeetingRoom.ts"
Write-Host "  app/team/components/SpecialistGrid.tsx"
Write-Host "  app/team/components/IndividualChat.tsx"
Write-Host "  app/team/components/MeetingRoom.tsx"
Write-Host "  app/team/components/WhatIfModal.tsx"
Write-Host "  app/team/components/WeeklyReview.tsx"
Write-Host "  app/team/components/MonthlyReview.tsx"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Add ANTHROPIC_API_KEY to .env.local"
Write-Host "  2. Add avatars to /public/avatars/"
Write-Host "  3. Run: npm run dev"