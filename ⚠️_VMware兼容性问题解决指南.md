# ⚠️ VMware 兼容性问题解决指南

**问题**: VMware Workstation 与 Windows Device/Credential Guard 不兼容  
**症状**: 启动虚拟机时提示不兼容错误  
**解决**: 禁用 Device/Credential Guard

---

## 🎯 快速诊断

### 检查当前状态

**以管理员身份运行 PowerShell**:

```powershell
# 方法1：使用 systeminfo
systeminfo | findstr /C:"Device Guard" /C:"Credential Guard"

# 方法2：使用 bcdedit
bcdedit /enum | findstr /C:"deviceguard" /C:"credentialguard"

# 方法3：检查 hypervisor
bcdedit /enum | findstr /C:"hypervisorlaunchtype"
```

**判断标准**:
- 如果看到 "Running" 或 "Enabled" → **需要禁用**
- 如果看到 "Not configured" → **无需操作**
- 如果 hypervisorlaunchtype 是 "on" → **需要改为 "off"**

---

## 🔧 解决方案

### 方案1：组策略编辑器（推荐 - Windows 专业版/企业版）

**适用**: Windows 10/11 专业版、企业版、教育版

#### 步骤：

1. **打开组策略编辑器**
   - 按 `Win + R`
   - 输入 `gpedit.msc`
   - 按 Enter

2. **导航到 Device Guard**
   - `计算机配置` → `管理模板` → `系统` → `Device Guard`

3. **禁用基于虚拟化的安全性**
   - 双击 "打开基于虚拟化的安全性"
   - 选择 "已禁用"
   - 点击 "确定"

4. **重启计算机**
   - 必须重启才能生效

---

### 方案2：注册表编辑器（所有版本）

**适用**: Windows 家庭版/专业版/企业版（所有版本）

#### 步骤：

1. **打开注册表编辑器**
   - 按 `Win + R`
   - 输入 `regedit`
   - 按 Enter
   - 确认 UAC 提示

2. **修改 DeviceGuard 设置**
   - 导航到：`HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\DeviceGuard`
   - 如果该路径不存在，创建相应键
   - 创建 DWORD 32位值：`EnableVirtualizationBasedSecurity`
   - 设置值为：`0`

3. **修改 LSA 设置**
   - 导航到：`HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Lsa`
   - 修改 `LsaCfgFlags` 值为：`0`

4. **重启计算机**

---

### 方案3：PowerShell 脚本（自动化 - 高级用户）

**适用**: 所有版本，适合批量部署

#### 步骤：

1. **以管理员身份运行 PowerShell**

2. **复制并执行以下脚本**:

```powershell
# 检查当前状态
Write-Host "检查Device Guard状态..." -ForegroundColor Yellow
$status = bcdedit /enum | Select-String "hypervisorlaunchtype"
Write-Host $status -ForegroundColor Cyan

# 禁用Hyper-V（如果存在）
Write-Host "`n禁用Hyper-V..." -ForegroundColor Yellow
Disable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -Remove -NoRestart

# 禁用Device Guard和Credential Guard
Write-Host "禁用Device Guard/Credential Guard..." -ForegroundColor Yellow
bcdedit /set hypervisorlaunchtype off

# 修改注册表
Write-Host "修改注册表..." -ForegroundColor Yellow
$regPath1 = "HKLM:\SYSTEM\CurrentControlSet\Control\DeviceGuard"
if (!(Test-Path $regPath1)) {
    New-Item -Path $regPath1 -Force | Out-Null
}
Set-ItemProperty -Path $regPath1 -Name "EnableVirtualizationBasedSecurity" -Value 0 -Type DWord -Force

$regPath2 = "HKLM:\SYSTEM\CurrentControlSet\Control\Lsa"
Set-ItemProperty -Path $regPath2 -Name "LsaCfgFlags" -Value 0 -Type DWord -Force

Write-Host "`n✅ 配置完成！" -ForegroundColor Green
Write-Host "⚠️  请重启计算机以应用更改" -ForegroundColor Yellow

# 询问是否立即重启
$restart = Read-Host "`n是否立即重启？(Y/N)"
if ($restart -eq 'Y' -or $restart -eq 'y') {
    Restart-Computer -Force
}
```

3. **按 Y 重启计算机，或手动重启**

---

### 方案4：BitLocker 环境

**适用**: 使用BitLocker加密的系统

#### 额外步骤：

**BitLocker 会阻止 hypervisor 更改，必须先暂停**

1. **暂停 BitLocker**
   ```
   控制面板 → 系统和安全 → BitLocker驱动器加密
   点击 "暂停保护"
   或使用命令行：
   manage-bde -protectors -disable C:
   ```

2. **执行上述禁用方案（方案1/2/3）**

3. **重启计算机**

4. **恢复 BitLocker**
   ```
   控制面板 → BitLocker驱动器加密 → 恢复保护
   或使用命令行：
   manage-bde -protectors -enable C:
   ```

---

## ✅ 验证修复

**重启后，验证禁用是否成功**:

```powershell
# 以管理员身份运行PowerShell

# 检查1：Device Guard状态
systeminfo | findstr /C:"Device Guard"
# 预期：看到 "Not configured" 或没有任何输出

# 检查2：Credential Guard状态
systeminfo | findstr /C:"Credential Guard"
# 预期：看到 "Not configured" 或没有任何输出

# 检查3：Hypervisor状态
bcdedit /enum | findstr /C:"hypervisorlaunchtype"
# 预期：hypervisorlaunchtype    off

# 检查4：尝试启动VMware
# 应该不再出现兼容性错误
```

---

## 🔍 常见问题

### Q1: 方法1不可用（找不到组策略）

**原因**: Windows 家庭版没有组策略编辑器

**解决**: 使用方法2（注册表）或方法3（PowerShell）

### Q2: 修改注册表后仍然不生效

**原因**: 未重启计算机

**解决**: 
- 确保已完全重启（不是注销）
- 检查BitLocker是否阻止了更改

### Q3: PowerShell执行出错（执行策略限制）

**解决**:
```powershell
# 临时允许执行脚本
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# 然后重新执行脚本
```

### Q4: 担心安全性影响

**说明**:
- Device Guard 主要用于企业安全策略
- 开发/测试环境禁用不影响日常使用
- 如果担心安全，考虑使用VirtualBox或WSL2

### Q5: 其他虚拟机软件不受影响吗？

**不受影响的方案**:
- ✅ VirtualBox（完全不受影响）
- ✅ WSL2（Windows原生虚拟化）
- ✅ Hyper-V（本身就是Windows虚拟化）

**受影响的方案**:
- ❌ VMware Workstation
- ❌ VMware Player

---

## 📚 技术背景

### Device Guard / Credential Guard 是什么？

- **Device Guard**: 硬件级别的安全策略，防止未授权代码执行
- **Credential Guard**: 保护 Windows 凭据和域用户特权
- **Hyper-V**: 基于虚拟化的安全性基础

### 为什么与VMware冲突？

- VMware使用Type-2虚拟化（嵌套虚拟化）
- Device Guard使用Hyper-V虚拟化基础架构
- 两者不能同时运行

### 安全影响

**禁用后**:
- ❌ 失去基于虚拟化的安全保护
- ❌ 恶意软件可能更容易运行
- ✅ 不影响防火墙、杀毒软件
- ✅ 不影响Windows Update

**建议**:
- 🏠 开发/测试环境：可以禁用
- 🏢 生产环境：不建议禁用
- 🔐 企业环境：咨询IT安全部门

---

## 🎯 替代方案

如果您不想禁用Device Guard，可考虑：

### 方案1：使用 VirtualBox

- ✅ 完全兼容Device Guard
- ✅ 免费开源
- ✅ 跨平台

### 方案2：使用 WSL2

- ✅ Windows原生支持
- ✅ 性能优秀
- ✅ 无缝集成

### 方案3：使用云服务器

- ✅ 无需本地虚拟化
- ✅ 随时可用
- ✅ 生产就绪

### 方案4：升级到 VMware 新版本

- 某些新版本可能支持某些配置
- 查看：https://docs.vmware.com/

---

## 📞 需要帮助？

- **VMware官方**: http://www.vmware.com/go/turnoff_CG_DG
- **VMware论坛**: https://communities.vmware.com/
- **微软文档**: Device Guard and Credential Guard

---

## 📝 检查清单

完成以下检查：

- [ ] 确认错误信息是 Device Guard/Credential Guard 相关
- [ ] 以管理员身份运行命令
- [ ] 选择并执行一个禁用方案
- [ ] 完成计算机重启
- [ ] 验证禁用成功
- [ ] 重新尝试启动VMware
- [ ] 确认虚拟机可以正常启动

---

**祝您解决问题顺利！** 🎉

