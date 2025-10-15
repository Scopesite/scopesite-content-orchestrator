# Test account mapping after Railway redeploys
Write-Host "Testing account mapping..." -ForegroundColor Cyan

$body = @{
    workspaceId = '689bafde0d2bac56570e9e9b'
    timezone = 'Europe/London'
    posts = @(
        @{
            title = 'Mapping test'
            body = 'Testing all platforms'
            channels = @('linkedin', 'twitter', 'facebook')
            scheduledAt = (Get-Date).AddMinutes(20).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss')
        }
    )
} | ConvertTo-Json -Depth 5

try {
    $response = Invoke-WebRequest -Uri "https://contentgen.up.railway.app/posts/bulk?dry=1" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body
    
    $result = $response.Content | ConvertFrom-Json
    $item = $result.items[0]
    
    Write-Host "`n✅ Requested Channels:" -ForegroundColor Green
    $item.requestedChannels | ForEach-Object { Write-Host "   - $_" }
    
    Write-Host "`n✅ Resolved Account IDs:" -ForegroundColor Green
    $item.resolvedAccounts | ForEach-Object { Write-Host "   - $_" }
    
    # Check if mapping worked
    if ($item.resolvedAccounts -contains "linkedin") {
        Write-Host "`n❌ MAPPING NOT WORKING - Still showing 'linkedin' instead of account ID" -ForegroundColor Red
        Write-Host "   Make sure ACCOUNT_MAP_JSON is set in Railway and redeployed" -ForegroundColor Yellow
    } elseif ($item.resolvedAccounts -contains "nhMCc6G8ct") {
        Write-Host "`n✅ MAPPING WORKING! LinkedIn → nhMCc6G8ct" -ForegroundColor Green
        Write-Host "   Ready to schedule posts!" -ForegroundColor Green
    }
    
} catch {
    Write-Host "`n❌ Error: $_" -ForegroundColor Red
}

