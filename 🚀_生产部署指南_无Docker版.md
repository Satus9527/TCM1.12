# 🚀 TCM Platform 生产部署指南（无Docker简化版）

**目标**: 在干净的 Linux (Ubuntu/Debian) 服务器上，安全、可靠地部署 TCM 后端服务 (P1-P5)，使其能通过 Nginx (HTTPS) 被公网访问，并成功连接到本地的 MySQL/Redis 和云端的 E1 AI 模型服务。

**核心技术**: Nginx (反向代理), PM2 (进程管理), Certbot (HTTPS), ufw (防火墙)

**适用版本**: TCM Platform Backend v1.0.0

---

## 📋 目录

1. [服务器准备](#阶段0服务器准备虚拟机或云服务器)
2. [服务器基础环境准备](#阶段一服务器基础环境准备)
3. [数据库与防火墙配置](#阶段二数据库与防火墙配置)
4. [部署与配置后端](#阶段三部署与配置后端)
5. [配置 Nginx 与启动服务](#阶段四配置-nginx-与启动服务)
6. [验证与监控](#阶段五验证与监控)

---

## 阶段0：服务器准备（虚拟机或云服务器）

### 选择您的服务器方案

根据您的环境和需求，选择以下**任一方案**：

**方案A**: 使用虚拟机（推荐测试）  
**方案B**: 使用云服务器（推荐生产）  
**方案C**: 使用现有服务器（已有Linux服务器）

---

### 方案A：创建本地虚拟机（推荐测试环境）

适合：本地测试、学习、开发

#### 选项1：使用 VirtualBox

**优点**: 免费、开源、跨平台

##### 步骤1：下载并安装 VirtualBox

1. 访问: https://www.virtualbox.org/wiki/Downloads
2. 下载:
   - **Windows**: VirtualBox-x.x.x-xxxxx-Win.exe
   - **Mac**: VirtualBox-x.x.x-xxxxx-OSX.dmg
3. 安装: 双击安装包，按向导完成安装

##### 步骤2：下载 Ubuntu Server ISO

1. 访问: https://ubuntu.com/download/server
2. 下载: Ubuntu Server 22.04 LTS（推荐）
   - 文件: `ubuntu-22.04.3-live-server-amd64.iso` (~1.5GB)
3. 保存: 保存到本地磁盘

##### 步骤3：创建虚拟机

1. **打开 VirtualBox**
   - 点击左上角 "新建"

2. **基本设置**:
   - **名称**: TCM Platform Server
   - **类型**: Linux
   - **版本**: Ubuntu (64-bit)
   - 点击 "下一步"

3. **内存设置**:
   - **分配内存**: 2048 MB (2GB) 或更多
   - 至少: 1024 MB (1GB)
   - 推荐: 4096 MB (4GB)
   - 点击 "下一步"

4. **硬盘设置**:
   - 选择 "现在创建虚拟硬盘"
   - 点击 "创建"

5. **硬盘文件类型**:
   - 选择 "VDI (VirtualBox Disk Image)"
   - 点击 "下一步"

6. **存储设置**:
   - 选择 "动态分配"
   - 点击 "下一步"

7. **文件位置和大小**:
   - **文件名**: TCM_Platform.vdi
   - **大小**: 20 GB（至少）
   - 推荐: 40 GB 或更多
   - 点击 "创建"

**虚拟机已创建！** ✅

##### 步骤4：配置虚拟机网络

1. **选中虚拟机**，点击 "设置"

2. **网络 → 网卡1**:
   - **连接方式**: 桥接网卡（推荐）或 NAT
   - **混杂模式**: 全部允许（用于桥接）
   - 点击 "确定"

##### 步骤5：安装 Ubuntu Server

1. **选中虚拟机**，点击 "启动"

2. **选择启动盘**:
   - 点击文件夹图标
   - 选择下载的 Ubuntu ISO 文件
   - 点击 "启动"

3. **Ubuntu 安装向导**:
   - 选择语言: **English** 或 **简体中文**
   - 选择键盘布局
   - 选择安装类型: **Ubuntu Server**

4. **网络配置**:
   - 如果有多个网卡，选择一个
   - 通常使用自动配置（DHCP）

5. **代理配置**:
   - 如果没有代理，留空

6. **镜像源**:
   - 选择默认镜像源或大陆镜像（如阿里云）

7. **磁盘分区**:
   - 选择 "Use An Entire Disk"（使用整个磁盘）
   - 选择刚创建的虚拟磁盘
   - 点击 "Done"

8. **创建用户**:
   - **Your name**: 任意名称（如：tcmadmin）
   - **Server name**: tcm-server 或任意
   - **Username**: tcmadmin（用于登录）
   - **Password**: **记录下密码！**
   - 再次确认密码

9. **SSH 设置**:
   - 选择 "Install OpenSSH server"
   - 点击 "Done"

10. **安装额外的软件**:
    - 取消所有选项（我们稍后手动安装）
    - 点击 "Done"

11. **等待安装**:
    - 安装可能需要 10-20 分钟

12. **安装完成**:
    - 选择 "Reboot Now"
    - 等待重启

13. **登录**:
    - 使用创建的用户名和密码登录
    - 应该看到命令行提示符

**Ubuntu Server 安装完成！** ✅

---

#### 选项2：使用 VMware Workstation/Fusion

**优点**: 性能更好，功能更强大，稳定性高

##### ⚠️ 重要：Windows 10/11 兼容性检查

**如果您的系统是 Windows 10/11，在安装VMware之前必须检查并禁用 Device/Credential Guard**

VMware Workstation 与 Windows 的 Device/Credential Guard 功能不兼容，可能导致无法启动虚拟机。

**检查是否启用了 Device/Credential Guard**:

```powershell
# 以管理员身份运行PowerShell，执行：
systeminfo | findstr /C:"Device Guard" /C:"Credential Guard"

# 或者使用这条命令：
bcdedit /enum | findstr /C:"deviceguard" /C:"credentialguard"
```

**如果看到 "Running" 或 "Enabled"，需要禁用它**：

**方法1：通过组策略编辑器（推荐）**

1. 按 `Win + R`，输入 `gpedit.msc`，按Enter
2. 导航到：`计算机配置` → `管理模板` → `系统` → `Device Guard`
3. 双击 "基于虚拟化的安全性"
4. 选择 "已禁用"
5. 重启计算机

**方法2：通过注册表（如果没有组策略）**

1. 按 `Win + R`，输入 `regedit`，按Enter
2. 导航到：`HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\DeviceGuard`
3. 创建 DWORD 值 `EnableVirtualizationBasedSecurity`，设为 `0`
4. 导航到：`HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Lsa`
5. 修改 `LsaCfgFlags` 值为 `0`
6. 重启计算机

**方法3：使用 PowerShell 脚本（高级用户）**

1. 以管理员身份运行 PowerShell
2. 执行以下命令：

```powershell
# 运行配置脚本
$content = @"
# 禁用Hyper-V（如果已启用）
Disable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -Remove

# 禁用Device Guard和Credential Guard
bcdedit /set hypervisorlaunchtype off

# 修改注册表
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\DeviceGuard" -Name "EnableVirtualizationBasedSecurity" -Value 0 -Force
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\Lsa" -Name "LsaCfgFlags" -Value 0 -Force

Write-Host "配置完成，请重启计算机以生效"
"@

$content | Out-File -FilePath "$env:TEMP\disable-dg.ps1" -Encoding utf8
& "$env:TEMP\disable-dg.ps1"
```

3. 重启计算机

**方法4：如果使用BitLocker加密**

如果您使用BitLocker加密硬盘，需要额外步骤：

1. 暂停 BitLocker（在"控制面板" → "BitLocker驱动器加密"）
2. 执行上述禁用步骤
3. 重启计算机
4. 恢复 BitLocker

**验证禁用是否成功**:

```powershell
# 重启后，检查状态
bcdedit /enum | findstr /C:"hypervisorlaunchtype"
# 应该显示: hypervisorlaunchtype    off
```

**重要提示**:
- ⚠️ 禁用 Device/Credential Guard 会降低系统安全性
- 🔒 建议仅在开发/测试环境中禁用
- 🛡️ 生产环境应使用其他虚拟机方案（如VirtualBox或WSL2）

**更多信息**: 访问 http://www.vmware.com/go/turnoff_CG_DG

---

##### 步骤1：下载并安装 VMware

1. **访问 VMware 官网**:
   - 访问: https://www.vmware.com/products/workstation-pro/workstation-pro-evaluation.html
   - 或免费版: https://www.vmware.com/products/workstation-player.html

2. **选择版本**:
   - **Windows/Linux**: VMware Workstation Pro 或 Player
   - **Mac**: VMware Fusion
   - 下载: 选择适合您系统的安装包

3. **安装 VMware**:
   - 双击安装包
   - 按照向导完成安装
   - 可能需要重启电脑

##### 步骤2：下载 Ubuntu Server ISO

1. 访问: https://ubuntu.com/download/server
2. 下载: Ubuntu Server 22.04 LTS（推荐）
   - 文件: `ubuntu-22.04.3-live-server-amd64.iso` (~1.5GB)
3. 保存: 保存到本地磁盘

##### 步骤3：创建虚拟机

1. **打开 VMware**
   - 启动 VMware Workstation 或 VMware Fusion

2. **创建新虚拟机**
   - 点击 "文件" → "新建虚拟机"
   - 或点击 "创建新的虚拟机"

3. **选择配置类型**
   - 选择 "典型（推荐）"
   - 点击 "下一步"

4. **安装客户机操作系统**
   - 选择 "稍后安装操作系统"
   - 点击 "下一步"

5. **选择客户机操作系统**
   - **客户机操作系统**: Linux
   - **版本**: Ubuntu 64位
   - 点击 "下一步"

6. **命名虚拟机**
   - **虚拟机名称**: TCM Platform Server
   - **位置**: 选择一个有足够空间的磁盘
   - 点击 "下一步"

7. **指定磁盘容量**
   - **最大磁盘大小**: 20 GB
   - 推荐: 40 GB 或更多
   - 选择 "将虚拟磁盘存储为单个文件"
   - 点击 "下一步"

8. **已准备好创建虚拟机**
   - 点击 "自定义硬件..."（自定义配置）
   - 或点击 "完成"（使用默认配置）

9. **自定义硬件设置**（可选）:
   - **内存**: 调整到 2048 MB (2GB) 或更多
   - **处理器**: 分配 1-2 个内核
   - **新 CD/DVD**: 选择 "使用 ISO 镜像文件"
     - 浏览并选择下载的 Ubuntu ISO 文件
   - **网络适配器**: 
     - **NAT**（推荐新手）
     - 或 **桥接模式**（获得独立IP）
   - 点击 "关闭"

10. **完成创建**
   - 点击 "完成"
   - 虚拟机已创建并显示在列表中

**虚拟机已创建！** ✅

##### 步骤4：安装 Ubuntu Server

1. **启动虚拟机**
   - 选中 "TCM Platform Server"
   - 点击 "开启此虚拟机" 或 "播放" 按钮

2. **Ubuntu 安装向导**
   - 虚拟机自动从ISO启动
   - 应该看到 Ubuntu 安装界面

3. **选择安装类型**
   - 选择 "Ubuntu Server"
   - 按 Enter

4. **语言选择**
   - 选择 **English** 或 **简体中文**
   - 按 Enter

5. **键盘布局**
   - 选择键盘布局
   - 按 Enter

6. **网络配置**
   - 选择网络接口
   - 通常自动配置（DHCP）

7. **代理配置**
   - 如果没有代理，留空

8. **镜像源**
   - 选择默认镜像源
   - 或选择大陆镜像（如清华、阿里云）

9. **磁盘分区**
   - 选择 "Use An Entire Disk"（使用整个磁盘）
   - 选择虚拟磁盘
   - 选择 "Done"

10. **创建用户**
   - **Your name**: tcmadmin
   - **Server name**: tcm-server
   - **Username**: tcmadmin
   - **Password**: **设置并记录密码！**
   - 再次确认密码

11. **SSH 设置**
   - 选择 "Install OpenSSH server"
   - 点击 "Done"

12. **安装额外软件**
   - 取消所有选项
   - 点击 "Done"

13. **开始安装**
   - 等待 10-20 分钟
   - 安装进度显示

14. **安装完成**
   - 选择 "Reboot Now"
   - 可能需要手动移除光盘（虚拟机设置中）

15. **登录系统**
   - 启动后输入用户名: `tcmadmin`
   - 输入密码
   - 应该看到命令行提示符

**Ubuntu Server 安装完成！** ✅

##### VMware 常用操作

```bash
# 在Ubuntu中验证安装
cat /etc/os-release
lsb_release -a

# 检查IP地址（如果使用桥接模式）
ip addr show
# 或
ifconfig

# 如果使用NAT模式，可能无法从外部访问
# 需要配置端口转发（VMware设置中）
```

**常用VMware快捷键**:
- **Ctrl+Alt**: 释放鼠标（虚拟机窗口内）
- **Ctrl+Alt+Enter**: 全屏模式
- **Ctrl+Alt+Insert**: 重启客户机

##### VMware NAT端口转发配置（如果需要从宿主机访问虚拟机）

如果您使用的是NAT网络模式（默认），宿主机无法直接访问虚拟机服务。需要配置端口转发：

1. **打开虚拟机设置**
   - 选中虚拟机（关机状态）
   - 点击 "编辑虚拟机设置"

2. **配置网络**
   - 选择 "网络适配器"
   - 确保选择 "NAT"
   - 点击 "NAT设置..." 或 "高级..."

3. **添加端口转发**
   - 点击 "端口转发..."
   - 添加以下端口映射：
     ```
     SSH (22):
     - 主机端口: 2222
     - 虚拟机IP: 留空（自动）
     - 虚拟机端口: 22
     
     HTTP (80):
     - 主机端口: 8080
     - 虚拟机端口: 80
     
     HTTPS (443):
     - 主机端口: 8443
     - 虚拟机端口: 443
     ```

4. **保存设置**
   - 点击 "确定"
   - 启动虚拟机后生效

5. **从宿主机访问**
   ```bash
   # SSH访问
   ssh tcmadmin@localhost -p 2222
   
   # HTTP访问
   http://localhost:8080
   
   # HTTPS访问
   https://localhost:8443
   ```

**注意**: 桥接模式不需要端口转发，虚拟机获得独立IP。

---

#### 选项3：使用 WSL2（Windows 10/11 专用）

**优点**: 原生性能、与Windows集成好  
**注意**: 适合开发测试，不建议用于生产

##### 步骤1：启用 WSL2

1. **打开 PowerShell (管理员权限)**:
   - 右键点击"开始"菜单
   - 选择"Windows PowerShell (管理员)"

2. **执行安装命令**:
   ```powershell
   # 启用WSL功能
   dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
   
   # 启用虚拟机平台
   dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
   
   # 重启计算机
   Restart-Computer
   ```

3. **重启后，设置WSL2为默认版本**:
   ```powershell
   wsl --set-default-version 2
   ```

##### 步骤2：安装 Ubuntu

1. **打开 Microsoft Store**

2. **搜索 "Ubuntu 22.04 LTS"**

3. **点击"安装"**

4. **启动 Ubuntu**:
   - 从开始菜单启动 Ubuntu
   - 创建Linux用户名和密码
   - **记录下用户名和密码！**

##### 步骤3：配置 Ubuntu

```bash
# 1. 更新系统
sudo apt update && sudo apt upgrade -y

# 2. 验证系统
cat /etc/os-release

# 3. 检查网络
ping -c 3 8.8.8.8

# 应该能看到响应
```

**Ubuntu Server 已就绪！** ✅

##### WSL2 注意事项

⚠️ **限制**:
- 默认无公网IP（需要通过端口转发）
- 服务重启后IP可能变化
- 防火墙配置复杂

💡 **适合**:
- 本地开发测试
- 学习练习
- 不适用于生产部署

---

### 方案B：购买云服务器（推荐生产环境）

适合：生产环境、公网访问

#### 选项1：阿里云 ECS

##### 步骤1：注册并登录

1. 访问: https://www.aliyun.com/
2. 注册账号
3. 实名认证

##### 步骤2：购买 ECS 服务器

1. **进入控制台**
   - 登录后点击 "产品" → "云服务器 ECS"

2. **立即购买**
   - 点击 "立即购买" 或 "免费试用"

3. **配置选择**:

   **基础配置**:
   - **付费模式**: 包年包月 或 按量付费
   - **地域**: 选择离您最近的（如华东1）
   - **实例**: 选择 "共享型" 或 "计算型"
   - **CPU**: 2核
   - **内存**: 4GB
   - **镜像**: **Ubuntu 22.04 64位**

   **存储**:
   - **系统盘**: 40GB 云盘

   **网络**:
   - **专有网络**: 默认
   - **公网IP**: 分配公网IPv4地址
   - **带宽**: 3Mbps 或更高

4. **设置**:
   - **登录凭证**: 选择 "自定义密码"
   - **用户名**: root
   - **密码**: **设置强密码并记录！**

5. **确认订单**
   - 点击 "立即购买"
   - 支付费用

##### 步骤3：配置安全组

1. **进入 ECS 控制台**
   - 点击已购买的实例

2. **安全组规则**:
   - 点击 "安全组"
   - 点击 "配置规则"

3. **添加入站规则**:
   ```
   SSH (22):  允许来源 0.0.0.0/0
   HTTP (80):  允许来源 0.0.0.0/0
   HTTPS (443): 允许来源 0.0.0.0/0
   ```
   - 点击 "添加规则" 分别添加

4. **保存**
   - 点击 "确定"

##### 步骤4：连接服务器

**使用 SSH**:

**Windows**:
```powershell
# 使用 PowerShell 或 CMD
ssh root@您的公网IP
# 输入密码
```

**Mac/Linux**:
```bash
ssh root@您的公网IP
# 输入密码
```

**或使用 PuTTY**（Windows）:
1. 下载 PuTTY: https://www.putty.org/
2. 输入主机名: `root@您的公网IP`
3. 端口: 22
4. 点击 "Open"
5. 输入密码

**连接成功！** ✅

---

#### 选项2：腾讯云 CVM

##### 步骤1-2：注册和购买

1. 访问: https://cloud.tencent.com/
2. 类似阿里云流程
3. 选择配置: **2核4GB, Ubuntu 22.04, 40GB硬盘**

##### 步骤3：安全组配置

1. **进入 CVM 控制台**
2. **安全组**:
   - 点击 "新建安全组"
   - **模板**: 自定义
   - **入站规则**:
     ```
     SSH (22):  0.0.0.0/0
     HTTP (80):  0.0.0.0/0
     HTTPS (443): 0.0.0.0/0
     ```

##### 步骤4：连接

```bash
ssh root@您的公网IP
```

---

#### 选项3：AWS EC2

**适合**: 国际市场、企业用户

##### 步骤1：注册 AWS 账号

1. 访问: https://aws.amazon.com/
2. 创建账号
3. 完成信用卡验证（会有验证扣费，但会退款）

##### 步骤2：启动实例

1. **登录 AWS Console**
   - 登录 https://console.aws.amazon.com/

2. **EC2 服务**
   - 搜索 "EC2"
   - 点击 "启动实例"

3. **配置选择**:
   - **名称**: tcm-platform-server
   - **镜像**: Ubuntu Server 22.04 LTS
   - **实例类型**: t2.medium (2 vCPU, 4GB RAM)
   - **密钥对**: 创建新密钥对 或 选择现有
   - **网络安全组**: 创建新安全组
     - SSH (22) from 0.0.0.0/0
     - HTTP (80) from 0.0.0.0/0
     - HTTPS (443) from 0.0.0.0/0
   - **存储**: 20GB gp3
   - **配置脚本**: （可选）留空

4. **启动实例**
   - 点击 "启动实例"
   - 等待实例运行（绿色状态）

##### 步骤3：连接服务器

**使用 AWS 控制台**:
1. 选中实例
2. 点击 "连接"
3. 选择 "EC2 Instance Connect"
4. 点击 "连接"

**或使用 SSH**:
```bash
# 使用下载的 .pem 密钥
ssh -i your-key.pem ubuntu@公网IP
```

**连接成功！** ✅

---

### 方案C：使用现有服务器

**适合**: 已有 Linux 服务器

**要求**:
- Ubuntu 20.04+ 或 Debian 10+
- Root 或 sudo 权限
- 能访问外网（安装软件）

**验证**:
```bash
# 检查操作系统
cat /etc/os-release

# 检查用户权限
sudo whoami  # 应该返回 "root"
```

---

### 服务器配置要求汇总

#### 最低配置

- **CPU**: 1核
- **内存**: 1GB (最小)
- **硬盘**: 20GB
- **网络**: 能访问外网
- **系统**: Ubuntu 20.04+ / Debian 10+

**适合**: 测试、开发

#### 推荐配置

- **CPU**: 2核
- **内存**: 4GB
- **硬盘**: 40GB SSD
- **网络**: 3Mbps+ 公网带宽
- **系统**: Ubuntu 22.04 LTS

**适合**: 生产环境、演示

#### 理想配置

- **CPU**: 4核+
- **内存**: 8GB+
- **硬盘**: 80GB SSD
- **网络**: 10Mbps+ 公网带宽
- **系统**: Ubuntu 22.04 LTS

**适合**: 高并发、企业级

---

### 验证服务器就绪

**无论使用哪个方案，验证以下内容**:

```bash
# 1. 检查系统
cat /etc/os-release

# 应该显示 Ubuntu 或 Debian 信息

# 2. 检查网络
ping -c 3 8.8.8.8

# 应该收到 3 个响应

# 3. 检查磁盘空间
df -h

# 根分区应该至少有 10GB 可用

# 4. 检查内存
free -h

# 可用内存应该 > 500MB

# 5. 检查用户权限
sudo whoami

# 应该显示 "root"
```

**所有检查通过！可以继续下一阶段** ✅

---

## 阶段一：服务器基础环境准备

### 1. 安装核心依赖

```bash
# 更新系统包
sudo apt update

# 安装 Nginx, MySQL, Redis, Git, Certbot
sudo apt install -y nginx mysql-server redis-server git python3-certbot-nginx
```

### 2. 安装 NVM 和 Node.js

**重要**: 本项目需要 Node.js v18.x (LTS)

```bash
# 安装 nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 重新加载 shell 配置
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# 验证 nvm 安装
nvm --version
```

**安装并使用项目指定的 Node.js 版本**:

```bash
# 项目使用 lts/hydrogen (v18.x)
nvm install --lts
nvm use --lts

# 设置默认版本（可选）
nvm alias default lts/*

# 验证 Node.js 版本
node --version  # 应该显示 v18.x.x
npm --version
```

### 3. 安装 PM2 和日志轮转

```bash
# 全局安装 PM2 (Node.js 进程管理器)
npm install -g pm2

# 安装 PM2 日志轮转插件
pm2 install pm2-logrotate

# 配置日志轮转（防止日志文件过大）
pm2 set pm2-logrotate:max_size 10M     # 单个日志文件最大10MB
pm2 set pm2-logrotate:retain 10        # 保留10个历史日志
pm2 set pm2-logrotate:compress true    # 启用压缩
pm2 set pm2-logrotate:rotateInterval "0 0 * * *"  # 每天午夜轮转

# 验证 PM2 安装
pm2 --version
```

### 4. 安装 wait-for-it (依赖检查工具)

```bash
# 下载 wait-for-it 脚本
sudo wget https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh -O /usr/local/bin/wait-for-it

# 添加执行权限
sudo chmod +x /usr/local/bin/wait-for-it

# 验证安装
which wait-for-it
```

---

## 阶段二：数据库与防火墙配置

### 1. 配置 MySQL 数据库 (D1, D2, D3)

#### 1.1 安全加固

```bash
# 运行 MySQL 安全设置脚本
sudo mysql_secure_installation
```

**按照提示执行**:
- 设置 root 密码（请使用强密码）
- 移除匿名用户
- 禁用远程 root 登录
- 移除测试数据库
- 重新加载权限表

#### 1.2 创建应用专用数据库和用户

```bash
# 登录 MySQL
sudo mysql -u root -p
```

**在 MySQL 中执行以下 SQL**:

```sql
-- 创建数据库（使用 UTF-8 MB4 字符集）
CREATE DATABASE tcm_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建应用专用用户
CREATE USER 'tcm_app_user'@'localhost' IDENTIFIED BY 'YOUR_STRONG_SECURE_PASSWORD';

-- 授予所有权限（仅限本地连接）
GRANT ALL PRIVILEGES ON tcm_platform.* TO 'tcm_app_user'@'localhost';

-- 刷新权限
FLUSH PRIVILEGES;

-- 验证用户权限
SHOW GRANTS FOR 'tcm_app_user'@'localhost';

-- 退出 MySQL
EXIT;
```

**重要**: 请将 `YOUR_STRONG_SECURE_PASSWORD` 替换为您的强密码，并记录在安全的地方。

#### 1.3 配置 Redis (D4)

```bash
# 检查 Redis 状态
sudo systemctl status redis-server

# 启动 Redis（如果未启动）
sudo systemctl start redis-server

# 设置 Redis 开机自启
sudo systemctl enable redis-server

# 验证 Redis 连接
redis-cli ping  # 应该返回 PONG
```

---

### 2. 🔒 配置服务器防火墙 (User's Step 1)

**目标**: 锁定服务器，仅允许 SSH、HTTP 和 HTTPS 流量进入

**这将保护 MySQL (3306)、Redis (6379) 和 Node.js (3000) 端口不被公网访问**

```bash
# 设置默认规则
sudo ufw default deny incoming   # 拒绝所有入站流量
sudo ufw default allow outgoing  # 允许所有出站流量（后端需要访问云端 AI）

# 允许核心服务
sudo ufw allow ssh              # SSH (端口 22)
sudo ufw allow http             # HTTP (端口 80)
sudo ufw allow https            # HTTPS (端口 443)

# 启用防火墙
sudo ufw enable

# 检查防火墙状态
sudo ufw status verbose
```

**预期输出**:
```
Status: active
Logging: on (low)

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
```

---

## 阶段三：部署与配置后端 (P1-P5)

### 1. 部署代码

```bash
# 切换到部署目录
cd /var/www

# 克隆项目代码（替换为您的 Git 仓库 URL）
sudo git clone https://your-repo-url.com/project.git tcm-backend

# 进入项目目录
cd tcm-backend

# 检查 .nvmrc 文件（确保使用正确的 Node.js 版本）
cat .nvmrc
# 应该显示: lts/hydrogen 或 v18.x

# 切换到项目指定的 Node.js 版本
nvm use

# 设置目录所有者（可选，但推荐）
sudo chown -R $USER:$USER /var/www/tcm-backend
```

### 2. 安装依赖

```bash
cd /var/www/tcm-backend

# 安装生产依赖（忽略开发依赖）
npm install --production

# 验证关键依赖已安装
npm list express sequelize mysql2 jsonwebtoken ws redis pm2
```

### 3. 恢复数据库

#### 方案 A: 使用数据库迁移（推荐）

```bash
cd /var/www/tcm-backend

# 运行数据库迁移（创建表结构）
npm run db:migrate

# 填充种子数据（测试数据和演示用户）
npm run db:seed
```

#### 方案 B: 使用 SQL 备份文件

```bash
# 如果您有 backup.sql 文件
mysql -u tcm_app_user -p tcm_platform < /path/to/backup.sql
# 输入您设置的数据库密码
```

### 4. 🔐 配置环境变量 (User's Step 3)

**目标**: 安全地为后端应用提供所有密钥和配置

**严禁将此文件上传到 Git** ⚠️

```bash
cd /var/www/tcm-backend

# 创建 .env 文件
sudo nano .env
```

**粘贴并修改以下内容**:

```bash
# ============================================
# TCM Platform - 生产环境配置
# ============================================

# 环境设置
NODE_ENV=production
PORT=3000

# ============================================
# 数据库配置 (D1, D2, D3)
# ============================================
DB_HOST=localhost
DB_PORT=3306
DB_USER=tcm_app_user
DB_PASSWORD=YOUR_STRONG_SECURE_PASSWORD
DB_NAME=tcm_platform

# ============================================
# Redis 缓存配置 (D4)
# ============================================
REDIS_HOST=localhost
REDIS_PORT=6379
# REDIS_PASSWORD=your_redis_password  # 如果 Redis 设置了密码

# ============================================
# JWT 认证配置 (关键安全)
# ============================================
# ⚠️ 必须生成强随机字符串！至少32字符
# 生成方法: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=REPLACE_THIS_WITH_A_64_CHAR_RANDOM_STRING
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# ============================================
# AI 服务配置 (E1) - 云端模型
# ============================================
E1_RECOMMEND_URL=https://your-ai-cloud-service.com/recommend/formula
E1_ANALYZE_URL=https://your-ai-cloud-service.com/analyze/composition
E1_HEALTH_URL=https://your-ai-cloud-service.com/health

# 云端 AI 服务的认证密钥（如果有）
E1_API_KEY=YOUR_CLOUD_AI_SERVICE_API_KEY

# AI 服务超时配置 (与 P4/P5 逻辑一致)
E1_TIMEOUT_MS=5000

# ============================================
# D8 对象存储配置（MinIO 或 AWS S3）
# ============================================
D8_ENDPOINT=http://localhost:9000
D8_REGION=us-east-1
D8_BUCKET=tcm-platform-files
D8_ACCESS_KEY_ID=minioadmin
D8_SECRET_ACCESS_KEY=minioadmin
D8_FORCE_PATH_STYLE=true

# ============================================
# 文件上传配置
# ============================================
UPLOAD_MAX_FILE_SIZE=52428800  # 50MB
UPLOAD_ALLOWED_MIME_TYPES=application/pdf,image/jpeg,image/png,image/gif,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,video/mp4
UPLOAD_ALLOWED_EXTENSIONS=.pdf,.jpg,.jpeg,.png,.gif,.ppt,.pptx,.doc,.docx,.mp4

# ============================================
# 日志配置
# ============================================
LOG_LEVEL=info  # 生产环境使用 info 或 warn

# ============================================
# CORS 前端 URL
# ============================================
FRONTEND_URL=https://yourdomain.com
```

**保存并退出** (Ctrl+X, Y, Enter)

**设置文件权限**（重要安全步骤）:

```bash
# 设置 .env 文件权限（仅所有者可读写）
sudo chmod 600 .env

# 验证权限
ls -la .env
# 应该显示: -rw------- 1 ...
```

### 5. 测试配置

```bash
# 测试数据库连接
npm run start &
sleep 5
curl http://localhost:3000/api/health

# 如果返回 JSON 响应，说明配置正确
# 然后停止进程
pm2 delete all
```

---

## 阶段四：配置 Nginx 与启动服务

### 1. 🌐 Nginx 详细配置 (User's Step 2)

**目标**: 
- 将 Nginx 作为公网入口
- 处理 HTTPS
- 服务前端静态文件
- 将 `/api/` 转发到后端
- 将 WebSocket (`/api/simulation`) 转发到后端

#### 1.1 部署前端（如果有）

```bash
# 创建前端目录
sudo mkdir -p /var/www/tcm_frontend

# 复制前端构建文件（从本地的 npm run build 产生）
# 假设您已经在本地的 dist 目录中构建了前端
# 可以使用 scp 或其他方式将文件传输到服务器

# 示例：使用 scp 从本地传输
# scp -r ./dist/* user@your-server:/var/www/tcm_frontend/

# 设置目录权限
sudo chown -R www-data:www-data /var/www/tcm_frontend
```

#### 1.2 创建 Nginx 配置文件

```bash
sudo nano /etc/nginx/sites-available/tcm_platform
```

**粘贴以下完整配置**:

```nginx
# ============================================
# TCM Platform - Nginx 反向代理配置
# ============================================

# 1. API 限流区定义（安全性需求 E）
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=5r/m;      # AI推荐: 每分钟5次
limit_req_zone $binary_remote_addr zone=login_limit:10m rate=10r/m;   # 登录: 每分钟10次

# 2. HTTP (端口 80) -> HTTPS 重定向（由 Certbot 自动创建）
server {
    listen 80;
    server_name yourdomain.com;  # ⚠️ 替换为您的域名

    # Certbot 会自动填充以下内容:
    # location / {
    #     return 301 https://$host$request_uri;
    # }
}

# 3. HTTPS (端口 443) 主服务
server {
    listen 443 ssl http2;
    server_name yourdomain.com;  # ⚠️ 替换为您的域名

    # Certbot 会自动添加以下内容:
    # ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    # ssl_protocols TLSv1.2 TLSv1.3;
    # ssl_ciphers HIGH:!aNULL:!MD5;
    # ssl_prefer_server_ciphers on;

    # 4. 前端静态文件（Vue SPA）
    root /var/www/tcm_frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;  # 处理 Vue Router 的 history 模式
    }

    # 5. 反向代理 API (P1-P4, M4)
    location /api/ {
        # 6. 特定 API 限流
        if ($request_uri ~* "/api/recommend/formula") {
            limit_req zone=api_limit burst=3;  # 限制AI推荐
        }
        if ($request_uri ~* "/api/auth/login") {
            limit_req zone=login_limit burst=5;  # 限制登录
        }

        # 代理到后端
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 增加超时（用于 AI 分析）
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }

    # 7. 反向代理 WebSocket (P5) - 必须！
    location /api/simulation {
        proxy_pass http://localhost:3000/api/simulation;
        proxy_http_version 1.1;
        
        # WebSocket 升级必需的头
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket 超时配置
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }

    # 8. 安全响应头
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # 9. 日志配置
    access_log /var/log/nginx/tcm_platform_access.log;
    error_log /var/log/nginx/tcm_platform_error.log;
}
```

**保存并退出** (Ctrl+X, Y, Enter)

#### 1.3 启用 Nginx 配置

```bash
# 创建符号链接
sudo ln -s /etc/nginx/sites-available/tcm_platform /etc/nginx/sites-enabled/

# 删除默认配置（可选）
sudo rm /etc/nginx/sites-enabled/default

# 测试 Nginx 配置语法
sudo nginx -t

# 如果测试通过，重新加载 Nginx
sudo systemctl reload nginx
```

### 2. 🔐 获取 SSL 证书 (Certbot)

**必须在域名 DNS 解析生效后执行**

```bash
# 获取 SSL 证书（自动配置 Nginx）
sudo certbot --nginx -d yourdomain.com

# 按照提示操作:
# 1. 输入邮箱（用于证书到期提醒）
# 2. 同意服务条款
# 3. 选择是否共享邮箱（建议选N）
# 4. Certbot 会自动配置 HTTPS 和重定向

# 验证证书续期
sudo certbot renew --dry-run
```

**重要**: 将 `yourdomain.com` 替换为您的实际域名。

### 3. 🚀 严格的服务启动 (User's Step 5)

**目标**: 使用 PM2 和 wait-for-it 确保后端在依赖准备好之后才启动

#### 3.1 创建 PM2 生态系统文件

```bash
cd /var/www/tcm-backend

sudo nano ecosystem.config.js
```

**粘贴以下内容**:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      // 唯一的 Node.js 服务
      name: "tcm-backend",
      script: "src/app.js",
      
      // 生产环境不监听文件变化
      watch: false,
      
      // 环境变量
      env: {
        NODE_ENV: "production"
      },
      
      // 进程数（根据服务器性能调整）
      instances: 1,  // 或使用 "max" 启用集群模式
      
      // 自动重启配置
      autorestart: true,
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: "10s",
      
      // 日志配置
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      
      // 性能监控
      max_memory_restart: "500M"
    }
  ]
};
```

**保存并退出** (Ctrl+X, Y, Enter)

#### 3.2 创建启动脚本

```bash
sudo nano /usr/local/bin/start_tcm.sh
```

**粘贴以下内容**:

```bash
#!/bin/bash
# /usr/local/bin/start_tcm.sh
# TCM Platform 启动脚本

set -e  # 遇到错误立即退出

echo "==========================================="
echo "Starting TCM Platform Services..."
echo "==========================================="

# 启动基础设施服务
echo "[1/5] Starting MySQL..."
sudo systemctl start mysql
wait-for-it -h localhost -p 3306 -t 30
if [ $? -ne 0 ]; then 
    echo "❌ MySQL did not start." 
    exit 1
fi
echo "✅ MySQL is ready"

echo "[2/5] Starting Redis..."
sudo systemctl start redis-server
wait-for-it -h localhost -p 6379 -t 30
if [ $? -ne 0 ]; then 
    echo "❌ Redis did not start." 
    exit 1
fi
echo "✅ Redis is ready"

echo "[3/5] Starting Nginx..."
sudo systemctl start nginx
echo "✅ Nginx is ready"

# 启动后端应用
echo "[4/5] Starting Backend (P1-P5) via PM2..."
cd /var/www/tcm-backend
pm2 start ecosystem.config.js

# 保存 PM2 进程列表（便于服务器重启后自动恢复）
pm2 save
echo "✅ Backend is ready"

echo "[5/5] Status check..."
pm2 status

echo "==========================================="
echo "✅ All services started successfully!"
echo "==========================================="

# 显示最近日志
echo ""
echo "Recent logs:"
echo "-------------------------------------------"
pm2 logs tcm-backend --lines 20 --nostream

echo ""
echo "Useful commands:"
echo "  pm2 logs tcm-backend     # 查看实时日志"
echo "  pm2 status               # 查看服务状态"
echo "  pm2 restart tcm-backend  # 重启后端"
echo "  pm2 monit                # 监控性能"
echo ""
```

**保存并退出** (Ctrl+X, Y, Enter)

**添加执行权限**:

```bash
sudo chmod +x /usr/local/bin/start_tcm.sh
```

#### 3.3 设置 PM2 开机自启

```bash
# 生成 PM2 启动脚本
pm2 startup

# 执行命令（示例输出）:
# sudo env PATH=$PATH:/home/user/.nvm/versions/node/v18.17.0/bin /home/user/.nvm/versions/node/v18.17.0/lib/node_modules/pm2/bin/pm2 startup systemd -u user --hp /home/user

# 复制并执行上面的命令（根据您的实际输出调整）
# 例如:
# sudo env PATH=$PATH:/home/ubuntu/.nvm/versions/node/v18.17.0/bin /home/ubuntu/.nvm/versions/node/v18.17.0/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu

# 保存当前 PM2 进程列表
pm2 save
```

### 4. 启动所有服务

```bash
# 执行启动脚本
sudo /usr/local/bin/start_tcm.sh
```

**预期输出**:
```
===========================================
Starting TCM Platform Services...
===========================================
[1/5] Starting MySQL...
✅ MySQL is ready
[2/5] Starting Redis...
✅ Redis is ready
[3/5] Starting Nginx...
✅ Nginx is ready
[4/5] Starting Backend (P1-P5) via PM2...
[PM2] Starting ecosystem.config.js
✅ Backend is ready
[5/5] Status check...
┌─────┬───────────────┬─────────┬─────────┬──────────┐
│ id  │ name          │ status  │ cpu     │ memory   │
├─────┼───────────────┼─────────┼─────────┼──────────┤
│ 0   │ tcm-backend   │ online  │ 0%      │ 45.2mb   │
└─────┴───────────────┴─────────┴─────────┴──────────┘
===========================================
✅ All services started successfully!
===========================================
```

---

## 阶段五：验证与监控

### 1. 验证部署

#### 1.1 健康检查

```bash
# 检查后端健康状态
curl http://localhost:3000/api/health

# 预期响应:
# {"success":true,"data":{"status":"healthy","timestamp":"...","uptime":...,"environment":"production"}}

# 通过 HTTPS 检查（需要配置域名）
curl https://yourdomain.com/api/health
```

#### 1.2 检查服务状态

```bash
# 检查 PM2 进程
pm2 status

# 检查 MySQL
sudo systemctl status mysql

# 检查 Redis
sudo systemctl status redis-server

# 检查 Nginx
sudo systemctl status nginx

# 检查防火墙
sudo ufw status
```

#### 1.3 测试 API 端点

```bash
# 使用 curl 测试（替换为您的测试账户）
# 登录获取 Token
TOKEN=$(curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"health_user","password":"password123"}' \
  | jq -r '.data.access_token')

# 测试获取药材列表
curl https://yourdomain.com/api/medicines \
  -H "Authorization: Bearer $TOKEN"

# 测试获取方剂列表
curl https://yourdomain.com/api/formulas \
  -H "Authorization: Bearer $TOKEN"
```

### 2. 监控与日志

#### 2.1 PM2 监控

```bash
# 实时日志
pm2 logs tcm-backend

# 性能监控
pm2 monit

# 查看进程详情
pm2 show tcm-backend

# 查看错误日志
pm2 logs tcm-backend --err
```

#### 2.2 Nginx 日志

```bash
# 访问日志
sudo tail -f /var/log/nginx/tcm_platform_access.log

# 错误日志
sudo tail -f /var/log/nginx/tcm_platform_error.log
```

#### 2.3 应用日志

```bash
# 查看应用日志（使用 PM2）
pm2 logs tcm-backend

# 或直接查看日志文件
tail -f /var/www/tcm-backend/logs/combined.log
tail -f /var/www/tcm-backend/logs/error.log
```

### 3. 常用维护命令

```bash
# 重启后端
pm2 restart tcm-backend

# 停止后端
pm2 stop tcm-backend

# 删除后端
pm2 delete tcm-backend

# 重新启动所有服务
sudo /usr/local/bin/start_tcm.sh

# 重载 Nginx 配置
sudo nginx -t && sudo systemctl reload nginx

# 更新代码
cd /var/www/tcm-backend
git pull
npm install --production
pm2 restart tcm-backend

# 查看磁盘使用
df -h

# 查看内存使用
free -h

# 查看 CPU 使用
top
```

---

## ✅ 部署完成检查清单

- [ ] ✅ 服务器基础环境已安装（Node.js, MySQL, Redis, Nginx, PM2）
- [ ] ✅ MySQL 数据库已创建并配置
- [ ] ✅ 防火墙已配置并启用
- [ ] ✅ 项目代码已部署到 `/var/www/tcm-backend`
- [ ] ✅ 数据库迁移和种子数据已执行
- [ ] ✅ `.env` 文件已正确配置且权限安全
- [ ] ✅ Nginx 反向代理已配置
- [ ] ✅ SSL 证书已获取并配置
- [ ] ✅ PM2 启动脚本已创建
- [ ] ✅ 所有服务已启动并正常运行
- [ ] ✅ 健康检查端点返回正常
- [ ] ✅ PM2 开机自启已配置

---

## 🔐 安全建议

1. **定期更新**: 
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **备份数据库**:
   ```bash
   mysqldump -u tcm_app_user -p tcm_platform > backup_$(date +%Y%m%d).sql
   ```

3. **监控日志**: 定期检查日志文件，发现异常及时处理

4. **SSL 证书续期**: Certbot 会自动续期，但建议定期检查

5. **防火墙规则**: 仅开放必要端口

6. **密码策略**: 使用强密码，定期更换

---

## 📚 参考文档

- [README.md](./README.md) - 项目概述
- [QUICKSTART.md](./QUICKSTART.md) - 快速开始
- [完整自测指南.md](./完整自测指南.md) - 功能测试
- [PROJECT_STATUS.md](./PROJECT_STATUS.md) - 项目状态

---

## 🆘 故障排除

### 问题 1: Node.js 版本不匹配

```bash
# 检查当前版本
node --version

# 使用 nvm 切换到正确的版本
nvm use lts/hydrogen

# 或在项目根目录
nvm use
```

### 问题 2: 数据库连接失败

```bash
# 检查 MySQL 状态
sudo systemctl status mysql

# 测试数据库连接
mysql -u tcm_app_user -p tcm_platform

# 检查 .env 配置
cat /var/www/tcm-backend/.env | grep DB_
```

### 问题 3: Redis 连接失败

```bash
# 检查 Redis 状态
sudo systemctl status redis-server

# 测试 Redis 连接
redis-cli ping
```

### 问题 4: PM2 进程无法启动

```bash
# 查看详细错误
pm2 logs tcm-backend --err

# 检查端口占用
sudo netstat -tlnp | grep 3000

# 手动测试启动
cd /var/www/tcm-backend
node src/app.js
```

### 问题 5: Nginx 502 Bad Gateway

```bash
# 检查后端是否运行
pm2 status

# 检查 Nginx 错误日志
sudo tail -f /var/log/nginx/tcm_platform_error.log

# 重启后端
pm2 restart tcm-backend
```

---

## 📝 部署后步骤

1. **配置域名 DNS**:
   - A 记录: `yourdomain.com` → 服务器IP
   - A 记录: `www.yourdomain.com` → 服务器IP

2. **配置邮件服务**（可选）:
   - 用于用户注册、密码重置等

3. **配置备份策略**:
   - 数据库自动备份
   - 代码版本控制

4. **配置监控**（可选）:
   - Uptime monitoring
   - Error tracking (Sentry)

5. **配置CDN**（可选）:
   - 加速静态资源

---

**部署完成日期**: _________________  
**部署负责人**: _________________  
**服务器IP**: _________________  
**域名**: _________________

---

🎉 **恭喜！您的 TCM Platform 已成功部署到生产环境！**

