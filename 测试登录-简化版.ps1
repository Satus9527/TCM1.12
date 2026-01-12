# Test Backend Login API
$loginBody = @{
    username = "health_user"
    password = "password123"
} | ConvertTo-Json

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Backend Login API" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[Request] POST http://localhost:3000/api/auth/login" -ForegroundColor Yellow
Write-Host "[Data] $loginBody" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -ErrorAction Stop

    Write-Host "[SUCCESS] Login successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "[Response]" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 5 | Write-Host
    
    if ($response.data -and $response.data.access_token) {
        $script:accessToken = $response.data.access_token
        Write-Host ""
        Write-Host "[SUCCESS] Access Token saved to `$accessToken variable" -ForegroundColor Green
        Write-Host "Use `$accessToken for subsequent API calls" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "[ERROR] Login failed!" -ForegroundColor Red
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
