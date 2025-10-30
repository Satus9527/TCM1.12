# API 测试脚本
$baseURL = "http://localhost:3000"
$accessToken = ""
$refreshToken = ""

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "开始 API 测试" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 测试 1: 健康检查
Write-Host "[测试 1] 健康检查..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseURL/api/health" -Method Get
    Write-Host "✅ 健康检查通过" -ForegroundColor Green
    Write-Host "   状态: $($response.data.status)" -ForegroundColor Gray
} catch {
    Write-Host "❌ 健康检查失败: $_" -ForegroundColor Red
    exit 1
}

# 测试 2: 用户注册
Write-Host "`n[测试 2] 用户注册..." -ForegroundColor Yellow
$randomNum = Get-Random -Maximum 9999
$registerData = @{
    username = "testuser_$randomNum"
    password = "123456"
    role = "student"
    email = "testuser_$randomNum@example.com"
    phone = "13800138888"
}
$registerBody = $registerData | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseURL/api/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
    Write-Host "✅ 用户注册通过" -ForegroundColor Green
    Write-Host "   用户名: $($response.data.user.username)" -ForegroundColor Gray
    Write-Host "   角色: $($response.data.user.role)" -ForegroundColor Gray
    $accessToken = $response.data.accessToken
    $refreshToken = $response.data.refreshToken
} catch {
    Write-Host "❌ 用户注册失败: $_" -ForegroundColor Red
}

# 测试 3: 用户登录（使用预设账号）
Write-Host "`n[测试 3] 用户登录（预设账号）..." -ForegroundColor Yellow
$loginData = @{
    username = "teacher_li"
    password = "password123"
}
$loginBody = $loginData | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseURL/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    Write-Host "✅ 用户登录通过" -ForegroundColor Green
    Write-Host "   用户名: $($response.data.user.username)" -ForegroundColor Gray
    Write-Host "   角色: $($response.data.user.role)" -ForegroundColor Gray
    $accessToken = $response.data.accessToken
    $refreshToken = $response.data.refreshToken
    Write-Host "   Token已保存" -ForegroundColor Gray
} catch {
    Write-Host "❌ 用户登录失败: $_" -ForegroundColor Red
}

# 测试 4: 获取个人信息
Write-Host "`n[测试 4] 获取个人信息..." -ForegroundColor Yellow
try {
    $headers = @{
        Authorization = "Bearer $accessToken"
    }
    $response = Invoke-RestMethod -Uri "$baseURL/api/auth/profile" -Method Get -Headers $headers
    Write-Host "✅ 获取个人信息通过" -ForegroundColor Green
    Write-Host "   用户名: $($response.data.username)" -ForegroundColor Gray
    Write-Host "   角色: $($response.data.role)" -ForegroundColor Gray
} catch {
    Write-Host "❌ 获取个人信息失败: $_" -ForegroundColor Red
}

# 测试 5: 获取药材列表
Write-Host "`n[测试 5] 获取药材列表..." -ForegroundColor Yellow
$firstMedicineId = ""
try {
    $url = "$baseURL/api/medicines" + '?page=1&limit=5'
    $response = Invoke-RestMethod -Uri $url -Method Get
    Write-Host "✅ 获取药材列表通过" -ForegroundColor Green
    Write-Host "   总数: $($response.data.pagination.total)" -ForegroundColor Gray
    Write-Host "   当前页: $($response.data.pagination.page)" -ForegroundColor Gray
    if ($response.data.medicines.Count -gt 0) {
        Write-Host "   第一个药材: $($response.data.medicines[0].name)" -ForegroundColor Gray
        $firstMedicineId = $response.data.medicines[0].medicine_id
    }
} catch {
    Write-Host "❌ 获取药材列表失败: $_" -ForegroundColor Red
}

# 测试 6: 获取药材详情
if ($firstMedicineId) {
    Write-Host "`n[测试 6] 获取药材详情..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "$baseURL/api/medicines/$firstMedicineId" -Method Get
        Write-Host "✅ 获取药材详情通过" -ForegroundColor Green
        Write-Host "   药材名称: $($response.data.name)" -ForegroundColor Gray
        Write-Host "   分类: $($response.data.category)" -ForegroundColor Gray
        Write-Host "   性味: $($response.data.nature) / $($response.data.flavor)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ 获取药材详情失败: $_" -ForegroundColor Red
    }
}

# 测试 7: 获取方剂列表
Write-Host "`n[测试 7] 获取方剂列表..." -ForegroundColor Yellow
$firstFormulaId = ""
try {
    $url = "$baseURL/api/formulas" + '?page=1&limit=5'
    $response = Invoke-RestMethod -Uri $url -Method Get
    Write-Host "✅ 获取方剂列表通过" -ForegroundColor Green
    Write-Host "   总数: $($response.data.pagination.total)" -ForegroundColor Gray
    Write-Host "   当前页: $($response.data.pagination.page)" -ForegroundColor Gray
    if ($response.data.formulas.Count -gt 0) {
        Write-Host "   第一个方剂: $($response.data.formulas[0].name)" -ForegroundColor Gray
        $firstFormulaId = $response.data.formulas[0].formula_id
    }
} catch {
    Write-Host "❌ 获取方剂列表失败: $_" -ForegroundColor Red
}

# 测试 8: 获取方剂详情（包含组成）
if ($firstFormulaId) {
    Write-Host "`n[测试 8] 获取方剂详情（包含组成）..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "$baseURL/api/formulas/$firstFormulaId" -Method Get
        Write-Host "✅ 获取方剂详情通过" -ForegroundColor Green
        Write-Host "   方剂名称: $($response.data.name)" -ForegroundColor Gray
        Write-Host "   分类: $($response.data.category)" -ForegroundColor Gray
        Write-Host "   组成药材数: $($response.data.compositions.Count)" -ForegroundColor Gray
        if ($response.data.compositions.Count -gt 0) {
            Write-Host "   第一味药: $($response.data.compositions[0].medicine.name) - $($response.data.compositions[0].dosage)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "❌ 获取方剂详情失败: $_" -ForegroundColor Red
    }
}

# 测试 9: 创建药材（需要教师权限）
Write-Host "`n[测试 9] 创建药材（教师权限）..." -ForegroundColor Yellow
$randomNum = Get-Random -Maximum 9999
$newMedicineData = @{
    name = "测试药材_$randomNum"
    pinyin = "ceshiyaocai"
    category = "补虚药"
    nature = "温"
    flavor = "甘"
    meridian = "脾、肺"
    efficacy = "补气健脾"
    indications = "脾虚气弱"
    usage_dosage = "6-12g"
}
$newMedicineBody = $newMedicineData | ConvertTo-Json

try {
    $headers = @{
        Authorization = "Bearer $accessToken"
    }
    $response = Invoke-RestMethod -Uri "$baseURL/api/medicines" -Method Post -Body $newMedicineBody -ContentType "application/json" -Headers $headers
    Write-Host "✅ 创建药材通过" -ForegroundColor Green
    Write-Host "   药材名称: $($response.data.name)" -ForegroundColor Gray
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 403) {
        Write-Host "⚠️  创建药材失败: 权限不足（预期行为）" -ForegroundColor Yellow
    } else {
        Write-Host "❌ 创建药材失败: $_" -ForegroundColor Red
    }
}

# 测试 10: 刷新 Token
Write-Host "`n[测试 10] 刷新 Token..." -ForegroundColor Yellow
$refreshData = @{
    refreshToken = $refreshToken
}
$refreshBody = $refreshData | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseURL/api/auth/refresh" -Method Post -Body $refreshBody -ContentType "application/json"
    Write-Host "✅ 刷新 Token 通过" -ForegroundColor Green
    Write-Host "   新 Token 已生成" -ForegroundColor Gray
} catch {
    Write-Host "❌ 刷新 Token 失败: $_" -ForegroundColor Red
}

# 测试 11: 登出
Write-Host "`n[测试 11] 登出..." -ForegroundColor Yellow
$logoutData = @{
    refreshToken = $refreshToken
}
$logoutBody = $logoutData | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseURL/api/auth/logout" -Method Post -Body $logoutBody -ContentType "application/json"
    Write-Host "✅ 登出通过" -ForegroundColor Green
} catch {
    Write-Host "❌ 登出失败: $_" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "测试完成！" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
