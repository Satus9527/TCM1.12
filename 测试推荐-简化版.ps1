# Test Backend Recommendation API
if (-not $accessToken) {
    Write-Host "[WARNING] No access_token found. Please run login script first." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Or set token manually:" -ForegroundColor Gray
    Write-Host '  $accessToken = "YOUR_TOKEN_HERE"' -ForegroundColor Gray
    Write-Host ""
    exit
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Backend Recommendation API" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[Token] $($accessToken.Substring(0, [Math]::Min(20, $accessToken.Length)))..." -ForegroundColor Gray
Write-Host ""

$recommendBody = @{
    symptoms = @("发热", "恶寒", "头痛")
    tongue_desc = "舌淡红苔薄白"
} | ConvertTo-Json

Write-Host "[Request] POST http://localhost:3000/api/recommend/formula" -ForegroundColor Yellow
Write-Host "[Data] $recommendBody" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/recommend/formula" `
        -Method POST `
        -ContentType "application/json" `
        -Headers @{
            "Authorization" = "Bearer $accessToken"
        } `
        -Body $recommendBody `
        -ErrorAction Stop

    Write-Host "[SUCCESS] Recommendation request successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "[Response]" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10 | Write-Host
    
} catch {
    Write-Host "[ERROR] Recommendation request failed!" -ForegroundColor Red
    Write-Host ""
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
        try {
            $errorBody = $_.ErrorDetails.Message | ConvertFrom-Json
            $errorBody | ConvertTo-Json -Depth 5 | Write-Host
        } catch {
            Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
