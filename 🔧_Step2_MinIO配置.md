# 🔧 步骤2: MinIO对象存储配置

**目标**: 配置MinIO让文件上传测试通过  
**时间**: 10-15分钟  
**优先级**: 可选（需要文件上传功能时）

---

## 📋 前置条件

### 检查Docker

**命令**:
```bash
docker --version
```

**预期**: 显示Docker版本号

**如果没有Docker**:
- 安装Docker Desktop: https://www.docker.com/products/docker-desktop
- 安装完成后重启电脑

---

## 🚀 配置步骤

### 步骤2.1: 启动MinIO容器

**命令**:
```bash
docker run -d -p 9000:9000 -p 9001:9001 \
  --name minio \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  minio/minio server /data --console-address ":9001"
```

**预期输出**:
```
✓ Container started successfully
MinIO Console: http://localhost:9001
MinIO API: http://localhost:9000
```

---

### 步骤2.2: 验证容器运行

**命令**:
```bash
docker ps
```

**预期**: 看到minio容器在运行

**如果容器没有运行**:
```bash
docker logs minio
```

---

### 步骤2.3: 访问MinIO控制台

**步骤**:
1. 打开浏览器
2. 访问: `http://localhost:9001`
3. 登录信息:
   - **用户名**: `minioadmin`
   - **密码**: `minioadmin`

---

### 步骤2.4: 创建Bucket

**步骤**:
1. 登录后点击左侧菜单 **"Buckets"**
2. 点击右上角 **"Create Bucket"** 按钮
3. 配置:
   - **Bucket Name**: `tcm-files`
   - **Versioning**: 保持默认
   - **Region**: 留空
4. 点击 **"Create Bucket"** 按钮

---

### 步骤2.5: 配置访问策略（可选）

**如果是第一次使用**:

1. 回到左侧菜单 **"Access Policies"**
2. 为 `tcm-files` bucket设置：
   - **Access**: ReadWrite
   - **Public**: No

---

### 步骤2.6: 更新.env配置

**文件**: `.env`（如果不存在则创建）

**添加配置**:
```env
# MinIO对象存储配置
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=tcm-files
MINIO_USE_SSL=false
```

**完整配置示例**:
```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=tcm_platform

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT配置
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_ACCESS_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d

# MinIO对象存储配置
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=tcm-files
MINIO_USE_SSL=false

# 其他配置...
```

---

### 步骤2.7: 重启服务器

**命令**:
```bash
# 停止当前服务器（Ctrl+C）
# 然后重新启动
npm run dev
```

**预期输出**:
```
info: MinIO connection successful
info: Server is running on port 3000
```

---

### 步骤2.8: 测试文件上传

**命令**:
```bash
node test-file-upload.js
```

**预期结果**:
```
通过: 6
失败: 0
跳过: 0
总计: 6
```

---

## 🔍 故障排查

### 问题1: Docker启动失败

**错误**: `Cannot connect to the Docker daemon`

**解决**:
1. 打开Docker Desktop
2. 等待Docker完全启动
3. 重新运行docker命令

---

### 问题2: 端口被占用

**错误**: `port 9000 is already allocated`

**解决**:
```bash
# 停止现有容器
docker stop minio
docker rm minio

# 或使用其他端口
docker run -d -p 9002:9000 -p 9003:9001 ...
# 然后更新.env:
# MINIO_PORT=9002
```

---

### 问题3: MinIO连接失败

**错误**: `MinIO connection failed`

**检查**:
1. Docker容器是否运行: `docker ps`
2. .env配置是否正确
3. MinIO日志: `docker logs minio`

---

## ✅ 验证清单

- [ ] Docker已安装并运行
- [ ] MinIO容器已启动
- [ ] Bucket `tcm-files` 已创建
- [ ] .env配置已更新
- [ ] 服务器重启成功
- [ ] 文件上传测试通过

---

## 📊 预期结果

### 修复前
```
文件上传测试: 通过: 4, 失败: 2 (MinIO未配置)
```

### 修复后 ✅
```
文件上传测试: 通过: 6, 失败: 0
```

---

## ⚠️ 注意事项

### 数据持久化

当前配置数据存储在容器内，删除容器会丢失数据。

**生产环境建议**:
```bash
docker run -d -p 9000:9000 -p 9001:9001 \
  --name minio \
  -v minio-data:/data \
  -e "MINIO_ROOT_USER=..." \
  -e "MINIO_ROOT_PASSWORD=..." \
  minio/minio server /data --console-address ":9001"
```

---

## 🎯 步骤2完成

**状态**: 按需配置  
**影响**: 文件上传功能从67% → 100%

**下一步**: 步骤3 - AI推荐优化（可选）

