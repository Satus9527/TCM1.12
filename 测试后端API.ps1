# 测试后端登录API
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "测试后端登录API" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 准备请求数据
$loginBody = @{
    username = "health_user"
    password = "password123"
} | ConvertTo-Json

Write-Host "[请求] 登录接口: POST http://localhost:3000/api/auth/login" -ForegroundColor Yellow
Write-Host "[数据] $loginBody" -ForegroundColor Gray
Write-Host ""

try {
    # 发送登录请求
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -ErrorAction Stop

    Write-Host "[成功] 登录成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "[响应] " -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 5 | Write-Host
    
    # 保存 token 到变量（如果成功）
    if ($response.data -and $response.data.access_token) {
        $script:accessToken = $response.data.access_token
        Write-Host ""
        Write-Host "[成功] Access Token 已保存到 `$accessToken 变量" -ForegroundColor Green
        Write-Host "   使用 `$accessToken 进行后续API调用" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "[错误] 登录失败！" -ForegroundColor Red
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
