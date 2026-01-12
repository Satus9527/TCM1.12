# 🔧 解决 pip 命令找不到问题

**日期**: 2025-01-03  
**问题**: `'pip'不是內部或外部命令,也不是可运行的程序 或批处理文件。`

---

## 🐛 问题原因

**错误信息**: `pip` 不在系统 PATH 环境变量中

**原因分析**:
- Python 安装在 `D:\python`
- pip 脚本位于 `D:\python\Scripts`
- 但 `D:\python\Scripts` 不在系统 PATH 中

---

## ✅ 解决方案（3种方法）

### 方法1: 使用 `python -m pip`（推荐）

**优点**: 不需要修改 PATH，直接可用

**步骤**:
```bash
# 1. 进入项目目录
cd "D:\TCM web\zhongjing-ai-api"

# 2. 使用 python -m pip 安装依赖
D:\python\python.exe -m pip install -r requirements.txt

# 3. 启动服务
D:\python\python.exe app.py
```

---

### 方法2: 使用批处理文件（最简单）

**已创建的批处理文件**:
- `安装依赖.bat` - 自动安装依赖
- `启动服务.bat` - 自动启动服务

**使用方法**:
1. 双击 `安装依赖.bat` 安装依赖
2. 双击 `启动服务.bat` 启动服务

---

### 方法3: 添加 Python 到 PATH（永久解决）

**步骤**:

1. **打开系统环境变量设置**:
   - 按 `Win + R`
   - 输入 `sysdm.cpl` 并回车
   - 点击 "高级" 标签
   - 点击 "环境变量" 按钮

2. **编辑 PATH 变量**:
   - 在 "系统变量" 或 "用户变量" 中找到 `Path`
   - 点击 "编辑"
   - 点击 "新建"
   - 添加以下路径：
     ```
     D:\python
     D:\python\Scripts
     ```
   - 点击 "确定" 保存

3. **重启命令行**:
   - 关闭当前命令行窗口
   - 重新打开命令行
   - 验证 `pip` 命令：
     ```bash
     pip --version
     ```

---

## 🚀 快速开始（使用批处理文件）

### 步骤1: 安装依赖

**双击运行**: `安装依赖.bat`

**或手动运行**:
```bash
cd "D:\TCM web\zhongjing-ai-api"
D:\python\python.exe -m pip install -r requirements.txt
```

---

### 步骤2: 启动服务

**双击运行**: `启动服务.bat`

**或手动运行**:
```bash
cd "D:\TCM web\zhongjing-ai-api"
D:\python\python.exe app.py
```

**启动成功后**:
- ✅ Flask REST API: `http://localhost:5000`
- ✅ Gradio 界面: `http://localhost:7860`

---

## 🧪 验证安装

### 检查 pip 是否可用

```bash
# 方法1: 使用完整路径
D:\python\python.exe -m pip --version

# 方法2: 如果已添加到 PATH
pip --version
```

---

### 检查依赖是否安装成功

```bash
D:\python\python.exe -m pip list | findstr "flask gradio"
```

**预期输出**:
```
flask           2.x.x
flask-cors      3.x.x
gradio          4.x.x
```

---

## ⚠️ 常见问题

### 问题1: 批处理文件找不到 Python

**解决**: 编辑 `安装依赖.bat` 或 `启动服务.bat`，修改 `PYTHON_CMD` 为您的 Python 安装路径

---

### 问题2: 安装依赖时网络错误

**解决**: 使用国内镜像源
```bash
D:\python\python.exe -m pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

---

### 问题3: 权限不足

**解决**: 以管理员身份运行命令行或批处理文件

---

## 📋 完整命令参考

### 安装依赖
```bash
cd "D:\TCM web\zhongjing-ai-api"
D:\python\python.exe -m pip install -r requirements.txt
```

### 启动服务
```bash
cd "D:\TCM web\zhongjing-ai-api"
D:\python\python.exe app.py
```

### 验证服务
```bash
# 健康检查
curl http://localhost:5000/health

# 或使用浏览器访问
# http://localhost:7860 (Gradio 界面)
```

---

## ✅ 推荐方案

**推荐使用方法2（批处理文件）**：
- ✅ 最简单，双击即可
- ✅ 自动检测 Python 路径
- ✅ 无需修改系统配置

**如果经常使用 Python**：
- ✅ 推荐使用方法3（添加到 PATH）
- ✅ 永久解决，一次配置长期使用

---

**问题解决后，请继续按照 `📋_AI服务对接完成总结.md` 中的步骤完成对接！**
