# MinIO对象存储部署指南

**用途**: 为TCM平台提供AWS S3兼容的对象存储服务  
**版本**: MinIO RELEASE.2024-01-01T00-00-00Z（或最新版）  
**适用平台**: Windows 10/11, Linux, macOS

---

## 📦 方式一：Docker部署（推荐）

### 前置条件
- 已安装Docker Desktop（Windows）或Docker Engine（Linux）

### 部署步骤

#### 1. 拉取MinIO镜像

```bash
docker pull minio/minio:latest
```

#### 2. 创建数据目录

**Windows**:
```powershell
mkdir D:\minio-data
```

**Linux/Mac**:
```bash
mkdir -p ~/minio-data
```

#### 3. 启动MinIO容器

**Windows (PowerShell)**:
```powershell
docker run -d `
  --name minio `
  -p 9000:9000 `
  -p 9001:9001 `
  -e "MINIO_ROOT_USER=minioadmin" `
  -e "MINIO_ROOT_PASSWORD=minioadmin" `
  -v D:\minio-data:/data `
  minio/minio server /data --console-address ":9001"
```

**Linux/Mac**:
```bash
docker run -d \
  --name minio \
  -p 9000:9000 \
  -p 9001:9001 \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  -v ~/minio-data:/data \
  minio/minio server /data --console-address ":9001"
```

#### 4. 验证部署

```bash
# 检查容器状态
docker ps | grep minio

# 查看日志
docker logs minio
```

#### 5. 访问MinIO Console

打开浏览器访问: http://localhost:9001

```
用户名: minioadmin
密码: minioadmin
```

#### 6. 创建存储桶 (Bucket)

**方法A: 使用Console（推荐）**
1. 登录Console
2. 点击左侧 "Buckets"
3. 点击 "Create Bucket"
4. 输入名称: `tcm-platform-files`
5. 点击 "Create Bucket"

**方法B: 使用MinIO Client**
```bash
# 进入容器
docker exec -it minio sh

# 创建bucket
mc mb /data/tcm-platform-files

# 设置公共读取（可选）
mc policy set download /data/tcm-platform-files

# 退出容器
exit
```

---

## 💻 方式二：手动部署（Windows）

### 1. 下载MinIO

访问: https://min.io/download

或直接下载:
```powershell
# PowerShell下载
Invoke-WebRequest -Uri "https://dl.min.io/server/minio/release/windows-amd64/minio.exe" -OutFile "minio.exe"
```

### 2. 创建启动脚本

创建文件 `start-minio.bat`:

```batch
@echo off
REM MinIO启动脚本

REM 设置数据目录
set MINIO_ROOT_USER=minioadmin
set MINIO_ROOT_PASSWORD=minioadmin
set MINIO_VOLUMES=D:\minio-data

REM 创建数据目录
if not exist "%MINIO_VOLUMES%" mkdir "%MINIO_VOLUMES%"

REM 启动MinIO
echo 正在启动MinIO服务...
minio.exe server %MINIO_VOLUMES% --console-address ":9001"
```

### 3. 运行MinIO

```powershell
.\start-minio.bat
```

**输出示例**:
```
API: http://192.168.1.100:9000  http://127.0.0.1:9000
Console: http://192.168.1.100:9001 http://127.0.0.1:9001

Documentation: https://min.io/docs/minio/linux/index.html
```

### 4. 访问Console并创建Bucket

同Docker方式的步骤5-6

---

## 🐧 方式三：Linux部署

### 1. 下载MinIO

```bash
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
sudo mv minio /usr/local/bin/
```

### 2. 创建系统服务

创建文件 `/etc/systemd/system/minio.service`:

```ini
[Unit]
Description=MinIO Object Storage
Documentation=https://min.io/docs/minio/linux/index.html
Wants=network-online.target
After=network-online.target
AssertFileIsExecutable=/usr/local/bin/minio

[Service]
User=minio
Group=minio
Environment="MINIO_ROOT_USER=minioadmin"
Environment="MINIO_ROOT_PASSWORD=minioadmin"
ExecStart=/usr/local/bin/minio server /var/minio/data --console-address ":9001"
Restart=always
LimitNOFILE=65536
TasksMax=infinity
TimeoutStopSec=infinity

[Install]
WantedBy=multi-user.target
```

### 3. 创建用户和数据目录

```bash
# 创建MinIO用户
sudo useradd -r minio-user -s /sbin/nologin

# 创建数据目录
sudo mkdir -p /var/minio/data
sudo chown minio-user:minio-user /var/minio/data
```

### 4. 启动服务

```bash
# 重载systemd
sudo systemctl daemon-reload

# 启动MinIO
sudo systemctl start minio

# 设置开机自启
sudo systemctl enable minio

# 查看状态
sudo systemctl status minio
```

---

## 🔧 配置TCM平台

### 1. 修改 `.env` 文件

```bash
# D8对象存储配置
D8_ENDPOINT=http://localhost:9000
D8_REGION=us-east-1
D8_BUCKET=tcm-platform-files
D8_ACCESS_KEY_ID=minioadmin
D8_SECRET_ACCESS_KEY=minioadmin
D8_FORCE_PATH_STYLE=true
```

### 2. 重启后端服务

```bash
cd "D:\TCM web"
npm run dev
```

---

## 🧪 测试连接

### 方式A: 使用测试脚本

创建 `test-minio-connection.js`:

```javascript
const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  endpoint: 'http://localhost:9000',
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'minioadmin',
    secretAccessKey: 'minioadmin'
  },
  forcePathStyle: true
});

async function testConnection() {
  try {
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);
    console.log('✅ MinIO连接成功！');
    console.log('Buckets:', response.Buckets.map(b => b.Name));
  } catch (error) {
    console.error('❌ MinIO连接失败:', error.message);
  }
}

testConnection();
```

运行测试:
```bash
node test-minio-connection.js
```

### 方式B: 直接运行文件上传测试

```bash
node test-file-upload.js
```

---

## 🔐 安全配置（生产环境）

### 1. 修改默认凭证

**切勿在生产环境使用默认凭证！**

```bash
# 生成强密码
export MINIO_ROOT_USER=your-secure-username
export MINIO_ROOT_PASSWORD=your-very-secure-password-min-8-chars
```

### 2. 启用HTTPS

创建SSL证书:
```bash
# 使用Let's Encrypt或自签名证书
mkdir -p ~/.minio/certs
# 放置证书文件: private.key 和 public.crt
```

启动MinIO with HTTPS:
```bash
minio server /data --console-address ":9001" --certs-dir ~/.minio/certs
```

### 3. 设置Bucket策略

只允许特定IP访问:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {"AWS": "*"},
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::tcm-platform-files/*",
      "Condition": {
        "IpAddress": {"aws:SourceIp": "192.168.1.0/24"}
      }
    }
  ]
}
```

---

## 📊 监控与维护

### 查看MinIO日志

**Docker**:
```bash
docker logs -f minio
```

**Systemd**:
```bash
sudo journalctl -u minio -f
```

### 查看存储使用情况

访问Console → Dashboard → Usage

或使用CLI:
```bash
docker exec minio mc admin info /data
```

### 备份策略

**方法1: 文件系统备份**
```bash
# 备份data目录
tar -czf minio-backup-$(date +%Y%m%d).tar.gz /var/minio/data
```

**方法2: MinIO镜像**
```bash
# 使用mc mirror命令同步到另一个MinIO实例
mc mirror source-minio/tcm-platform-files target-minio/tcm-platform-files-backup
```

---

## 🐛 常见问题

### 问题1: 端口被占用

**错误**:
```
bind: address already in use
```

**解决**:
```bash
# 检查端口占用
netstat -ano | findstr 9000

# 修改MinIO端口
minio server /data --address ":9002" --console-address ":9003"
```

### 问题2: 权限错误（Linux）

**错误**:
```
Permission denied
```

**解决**:
```bash
sudo chown -R minio-user:minio-user /var/minio/data
sudo chmod -R 755 /var/minio/data
```

### 问题3: Docker容器无法启动

**排查**:
```bash
# 查看详细日志
docker logs minio

# 检查端口冲突
docker port minio

# 重启容器
docker restart minio
```

### 问题4: 文件上传失败（403 Forbidden）

**原因**: Bucket策略限制

**解决**:
```bash
# 设置公共读写（仅测试环境）
mc policy set public /data/tcm-platform-files

# 生产环境使用精细化策略
mc policy set download /data/tcm-platform-files
```

---

## 📚 参考资源

- **官方文档**: https://min.io/docs/minio/linux/index.html
- **Docker Hub**: https://hub.docker.com/r/minio/minio
- **GitHub**: https://github.com/minio/minio
- **MinIO Client**: https://min.io/docs/minio/linux/reference/minio-mc.html

---

## ✅ 部署检查清单

在开始使用前，请确认：

- [ ] MinIO服务正常运行
- [ ] Console可访问 (http://localhost:9001)
- [ ] Bucket `tcm-platform-files` 已创建
- [ ] TCM平台 `.env` 配置正确
- [ ] 测试连接成功
- [ ] 文件上传测试通过

---

**文档版本**: v1.0  
**最后更新**: 2025-10-30  
**维护者**: TCM Platform Team

