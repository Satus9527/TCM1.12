# 测试后端推荐API
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "测试后端推荐API" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否有 access_token
if (-not $accessToken) {
    Write-Host "[警告] 未找到 access_token，请先运行 测试后端API.ps1 进行登录" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "或手动设置 token：" -ForegroundColor Gray
    Write-Host '  $accessToken = "YOUR_TOKEN_HERE"' -ForegroundColor Gray
    Write-Host ""
    exit
}

Write-Host "[Token] $($accessToken.Substring(0, [Math]::Min(20, $accessToken.Length)))..." -ForegroundColor Gray
Write-Host ""

# 准备推荐请求数据
$recommendBody = @{
    symptoms = @("发热", "恶寒", "头痛")
    tongue_desc = "舌淡红苔薄白"
} | ConvertTo-Json

Write-Host "[请求] 推荐接口: POST http://localhost:3000/api/recommend/formula" -ForegroundColor Yellow
Write-Host "[数据] $recommendBody" -ForegroundColor Gray
Write-Host ""

try {
    # 发送推荐请求
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/recommend/formula" `
        -Method POST `
        -ContentType "application/json" `
        -Headers @{
            "Authorization" = "Bearer $accessToken"
        } `
        -Body $recommendBody `
        -ErrorAction Stop

    Write-Host "[成功] 推荐请求成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "[响应] " -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10 | Write-Host
    
} catch {
    Write-Host "[错误] 推荐请求失败！" -ForegroundColor Red
    Write-Host ""
    Write-Host "[错误详情] " -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "   状态码: $statusCode" -ForegroundColor Red
        
        try {
            $errorBody = $_.ErrorDetails.Message | ConvertFrom-Json
            $errorBody | ConvertTo-Json -Depth 5 | Write-Host
        } catch {
            Write-Host "   错误信息: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "   错误信息: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
