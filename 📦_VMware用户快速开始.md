# 📦 VMware用户快速开始

**适用**: 使用VMware Workstation/Fusion的用户  
**参考文档**: `🚀_生产部署指南_无Docker版.md`

---

## 🚀 快速导航

### 步骤总览

```
阶段0: 服务器准备
  └─ 选项2: 使用VMware Workstation/Fusion ⭐
      ├─ 步骤1: 下载并安装VMware
      ├─ 步骤2: 下载Ubuntu ISO
      ├─ 步骤3: 创建虚拟机（10步）
      ├─ 步骤4: 安装Ubuntu Server（15步）
      └─ NAT端口转发配置（可选）

阶段1-5: 按照部署指南继续
```

---

## 📍 在部署指南中的位置

**文件**: `🚀_生产部署指南_无Docker版.md`  
**位置**: **阶段0** → **选项2** (第162-380行)

---

## ⚡ 关键步骤

### 1. VMware下载

- Workstation Pro: https://www.vmware.com/products/workstation-pro.html
- Workstation Player (免费): https://www.vmware.com/products/workstation-player.html
- Fusion (Mac): https://www.vmware.com/products/fusion.html

### 2. 创建虚拟机要点

- **配置**: 典型安装
- **内存**: 2GB-4GB推荐
- **磁盘**: 20GB起步，40GB推荐
- **网络**: NAT或桥接模式

### 3. 安装Ubuntu要点

- 选择 "Ubuntu Server"
- 安装OpenSSH server
- 创建用户: `tcmadmin`
- 记录密码！

### 4. NAT端口转发（如果使用NAT）

如使用NAT模式，需要配置端口转发才能从宿主机访问：

| 服务 | 主机端口 | 虚拟机端口 |
|------|---------|-----------|
| SSH   | 2222    | 22        |
| HTTP  | 8080    | 80        |
| HTTPS | 8443    | 443       |

**设置位置**: 虚拟机设置 → 网络适配器 → NAT设置

---

## 🔗 相关链接

- **完整指南**: `🚀_生产部署指南_无Docker版.md` (选项2部分)
- **VirtualBox用户**: 参考部署指南的选项1
- **云服务器用户**: 参考部署指南的方案B

---

## ✅ 验证安装

安装完成后，验证：

```bash
# 在Ubuntu中执行
cat /etc/os-release
lsb_release -a

# 检查网络
ip addr show

# 测试网络连通性
ping -c 3 8.8.8.8
```

---

## 📚 下一步

完成阶段0后，继续执行：

1. **阶段1**: 服务器基础环境准备
2. **阶段2**: 数据库与防火墙配置
3. **阶段3**: 部署与配置后端
4. **阶段4**: 配置Nginx与启动服务
5. **阶段5**: 验证与监控

---

## 🆘 常见问题

### ⚠️ VMware无法启动（Device Guard错误）？

**这是最常见的问题！**

如果启动VMware时看到 "与 Device/Credential Guard 不兼容" 错误：

1. **快速诊断**:
```powershell
# 以管理员身份运行PowerShell
bcdedit /enum | findstr /C:"hypervisorlaunchtype"
```

2. **解决方法**:
   - 查看详细指南: `⚠️_VMware兼容性问题解决指南.md`
   - 或参考主文档: `🚀_生产部署指南_无Docker版.md` (选项2，兼容性检查部分)

3. **快速修复** (PowerShell):
```powershell
bcdedit /set hypervisorlaunchtype off
# 然后重启计算机
```

### 虚拟机无法启动？

- 检查虚拟化是否启用（BIOS设置）
- 检查VMware版本兼容性

### 网络连接问题？

- NAT模式需要端口转发
- 桥接模式需要正确网卡选择

### 性能慢？

- 增加分配内存
- 启用VT-x/AMD-V虚拟化
- 分配更多CPU核心

---

**祝部署顺利！** 🎉

