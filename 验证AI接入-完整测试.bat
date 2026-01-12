@echo off
chcp 65001 >nul
echo ============================================
echo 完整AI接入验证流程
echo ============================================
echo.
echo [步骤1] 登录获取Token
echo.

cd /d "%~dp0"
powershell.exe -ExecutionPolicy Bypass -Command "$loginBody = @{username='health_user';password='password123'} | ConvertTo-Json; $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/login' -Method POST -ContentType 'application/json' -Body $loginBody; $script:accessToken = $response.data.access_token; Write-Host '[成功] Token已获取' -ForegroundColor Green; Write-Host ''"

echo.
echo [步骤2] 测试推荐功能（会调用AI）
echo.
echo 正在调用推荐API...
echo 如果AI已接入，后端日志会显示：调用E1服务 (本地AI服务)
echo.

powershell.exe -ExecutionPolicy Bypass -Command "$accessToken = $script:accessToken; if (-not $accessToken) { $loginBody = @{username='health_user';password='password123'} | ConvertTo-Json; $loginRes = Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/login' -Method POST -ContentType 'application/json' -Body $loginBody; $accessToken = $loginRes.data.access_token }; $recommendBody = @{symptoms=@('发热','恶寒','头痛');tongue_desc='舌淡红苔薄白'} | ConvertTo-Json; try { $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/recommend/formula' -Method POST -ContentType 'application/json' -Headers @{'Authorization'='Bearer ' + $accessToken} -Body $recommendBody; Write-Host '[成功] 推荐请求成功！' -ForegroundColor Green; Write-Host ''; Write-Host '[响应]' -ForegroundColor Cyan; $response | ConvertTo-Json -Depth 10 | Write-Host } catch { Write-Host '[错误] 推荐请求失败！' -ForegroundColor Red; Write-Host $_.Exception.Message -ForegroundColor Red }"

echo.
echo ============================================
echo [提示] 请查看：
echo 1. 后端日志窗口 - 应该显示"调用E1服务 (本地AI服务)"
echo 2. 推荐响应中应包含辨证结果和推荐方剂
echo ============================================
echo.
pause
