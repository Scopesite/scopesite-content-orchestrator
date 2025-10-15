# Test ALL platform mappings
Write-Host "=== TESTING ALL PLATFORMS ===" -ForegroundColor Cyan
Write-Host "Waiting for Railway to redeploy..." -ForegroundColor Yellow
Write-Host ""

$body = @{
    workspaceId = '689bafde0d2bac56570e9e9b'
    timezone = 'Europe/London'
    posts = @(
        @{
            title = 'All platforms test'
            body = 'Testing complete mapping for all social accounts'
            channels = @('linkedin', 'twitter', 'facebook', 'instagram', 'gmb')
            scheduledAt = (Get-Date).AddMinutes(30).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss')
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
    
    Write-Host "Requested Channels:" -ForegroundColor Yellow
    $item.requestedChannels | ForEach-Object { Write-Host "  - $_" }
    
    Write-Host ""
    Write-Host "Resolved Account IDs:" -ForegroundColor Green
    $item.resolvedAccounts | ForEach-Object { Write-Host "  - $_" }
    
    Write-Host ""
    Write-Host "=== MAPPING VERIFICATION ===" -ForegroundColor Cyan
    
    $mappings = @{
        'linkedin' = 'nhMCc6G8ct'
        'twitter' = '1870790545192140800'
        'facebook' = '10239344454777631'
        'instagram' = '17841471037952239'
        'gmb' = 'accounts/103369041263560888812/locations/8554869267175457746'
    }
    
    $allGood = $true
    for ($i = 0; $i -lt $item.requestedChannels.Count; $i++) {
        $channel = $item.requestedChannels[$i]
        $resolved = $item.resolvedAccounts[$i]
        $expected = $mappings[$channel]
        
        if ($resolved -eq $expected) {
            Write-Host "✅ $channel → $resolved" -ForegroundColor Green
        } else {
            Write-Host "❌ $channel → $resolved (expected: $expected)" -ForegroundColor Red
            $allGood = $false
        }
    }
    
    Write-Host ""
    if ($allGood) {
        Write-Host "🎉 ALL PLATFORMS MAPPED CORRECTLY!" -ForegroundColor Green
        Write-Host "Ready to schedule posts to all accounts!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Some mappings are incorrect." -ForegroundColor Yellow
        Write-Host "Make sure ACCOUNT_MAP_JSON is set correctly in Railway." -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Error testing mappings: $_" -ForegroundColor Red
    Write-Host "Make sure Railway has finished redeploying." -ForegroundColor Yellow
}

