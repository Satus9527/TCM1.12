# 文件上传API快速参考

**基础URL**: `http://localhost:3000/api/files`  
**认证方式**: JWT Bearer Token  
**权限要求**: 仅教师（`teacher`）

---

## 🚀 快速开始

### 1. 部署MinIO（首次使用）

```bash
# Docker快速部署
docker run -d \
  --name minio \
  -p 9000:9000 \
  -p 9001:9001 \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  -v D:\minio-data:/data \
  minio/minio server /data --console-address ":9001"

# 访问Console创建bucket
# http://localhost:9001 (minioadmin/minioadmin)
# 创建bucket: tcm-platform-files
```

### 2. 配置环境变量

修改 `.env`:
```bash
D8_ENDPOINT=http://localhost:9000
D8_BUCKET=tcm-platform-files
```

### 3. 启动服务

```bash
cd "D:\TCM web"
npm run dev
```

---

## 📤 POST /api/files/upload

**上传文件**

### cURL示例

```bash
curl -X POST http://localhost:3000/api/files/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@./document.pdf"
```

### JavaScript示例

```javascript
const FormData = require('form-data');
const fs = require('fs');

const form = new FormData();
form.append('file', fs.createReadStream('./document.pdf'));

const response = await axios.post(
  'http://localhost:3000/api/files/upload',
  form,
  {
    headers: {
      ...form.getHeaders(),
      'Authorization': `Bearer ${token}`
    }
  }
);

console.log('File ID:', response.data.data.fileId);
console.log('File URL:', response.data.data.fileUrl);
```

### 前端示例（HTML + JS）

```html
<form id="uploadForm">
  <input type="file" id="fileInput" name="file" required>
  <button type="submit">上传</button>
</form>

<script>
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData();
  const fileInput = document.getElementById('fileInput');
  formData.append('file', fileInput.files[0]);
  
  try {
    const response = await fetch('http://localhost:3000/api/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: formData
    });
    
    const result = await response.json();
    if (result.success) {
      alert('上传成功! File ID: ' + result.data.fileId);
    }
  } catch (error) {
    alert('上传失败: ' + error.message);
  }
});
</script>
```

### 成功响应

```json
{
  "success": true,
  "message": "文件上传成功",
  "data": {
    "fileId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "fileName": "document.pdf",
    "fileUrl": "http://localhost:9000/tcm-platform-files/uploads/users/xxx/file.pdf",
    "fileType": "application/pdf",
    "fileSize": 1024000,
    "uploadedAt": "2025-10-30T15:33:39.000Z"
  },
  "timestamp": "2025-10-30T15:33:39.123Z"
}
```

---

## 📋 GET /api/files

**获取文件列表**

### cURL示例

```bash
curl http://localhost:3000/api/files \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### JavaScript示例

```javascript
const response = await axios.get(
  'http://localhost:3000/api/files',
  {
    headers: { Authorization: `Bearer ${token}` }
  }
);

console.log('Total files:', response.data.total);
response.data.data.forEach(file => {
  console.log(file.file_name, file.file_size);
});
```

### 成功响应

```json
{
  "success": true,
  "message": "获取文件列表成功",
  "data": [
    {
      "file_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "user_id": "teacher-uuid",
      "file_name": "中医基础理论.pdf",
      "storage_url": "http://localhost:9000/tcm-platform-files/...",
      "file_type": "application/pdf",
      "file_size": 1024000,
      "uploaded_at": "2025-10-30T15:33:39.000Z"
    }
  ],
  "total": 1
}
```

---

## 🗑️ DELETE /api/files/:file_id

**删除文件**

### cURL示例

```bash
curl -X DELETE http://localhost:3000/api/files/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### JavaScript示例

```javascript
const fileId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

const response = await axios.delete(
  `http://localhost:3000/api/files/${fileId}`,
  {
    headers: { Authorization: `Bearer ${token}` }
  }
);

console.log(response.data.message); // '文件删除成功'
```

### 成功响应

```json
{
  "success": true,
  "message": "文件删除成功",
  "timestamp": "2025-10-30T15:33:39.123Z"
}
```

---

## 🔒 权限矩阵

| 接口 | health_follower | student | teacher |
|------|----------------|---------|---------|
| POST /upload | ❌ | ❌ | ✅ |
| GET /files | ❌ | ❌ | ✅ |
| DELETE /files/:id | ❌ | ❌ | ✅ |

---

## 📏 文件限制

| 限制项 | 默认值 | 配置项 |
|--------|--------|--------|
| 最大文件大小 | 50MB | `UPLOAD_MAX_FILE_SIZE` |
| 允许的文件类型 | PDF, 图片, Office | `UPLOAD_ALLOWED_MIME_TYPES` |

**允许的文件类型**:
- 📄 **文档**: PDF, DOC, DOCX
- 🖼️ **图片**: JPEG, PNG, GIF
- 📊 **演示**: PPT, PPTX
- 🎬 **视频**: MP4

---

## ⚠️ 错误代码

| 状态码 | 错误类型 | 原因 | 解决方案 |
|--------|----------|------|----------|
| 400 | Bad Request | 文件缺失/类型不允许/过大 | 检查文件是否符合要求 |
| 401 | Unauthorized | Token缺失/无效 | 重新登录获取Token |
| 403 | Forbidden | 非教师角色 | 使用教师账号登录 |
| 404 | Not Found | 文件不存在 | 检查file_id是否正确 |
| 500 | Internal Error | 服务器错误 | 查看日志/联系管理员 |

---

## 🧪 测试脚本

### 运行测试

```bash
# 确保服务运行中
npm run dev

# 运行文件上传测试
node test-file-upload.js
```

### 测试覆盖

- ✅ 上传PDF文件
- ✅ 上传图片文件
- ✅ 拒绝不允许的文件类型
- ✅ 无Token访问（401）
- ✅ 学生角色权限检查（403）
- ✅ 获取文件列表
- ✅ 删除文件
- ✅ 删除不存在的文件（404）

---

## 🔍 调试技巧

### 查看后端日志

```bash
# 实时查看日志
tail -f logs/combined.log

# 搜索上传相关日志
grep "文件上传" logs/combined.log

# 搜索错误日志
grep "ERROR" logs/error.log
```

### 查看MinIO日志

```bash
# Docker
docker logs -f minio

# 检查文件是否上传
docker exec minio mc ls /data/tcm-platform-files/uploads/
```

### 常见问题排查

**问题1: 上传失败（500错误）**
```
可能原因:
1. MinIO未启动
2. Bucket不存在
3. 凭证错误

排查:
- 访问 http://localhost:9001
- 检查 .env 配置
- 查看后端日志
```

**问题2: 文件上传成功但元数据保存失败**
```
检查:
- 数据库连接是否正常
- user_files表是否存在
- 后端日志中的补偿逻辑是否执行
```

**问题3: 删除文件报404**
```
检查:
- file_id是否正确
- 文件是否属于当前用户
- 数据库中是否存在该记录
```

---

## 📋 开发检查清单

在开发文件上传功能前，确认：

- [ ] MinIO服务已启动
- [ ] Bucket `tcm-platform-files` 已创建
- [ ] 后端服务运行中
- [ ] 数据库连接正常
- [ ] `.env` 配置正确
- [ ] 已获取教师Token

---

## 🔗 相关文档

- [文件上传API实现报告](./文件上传API实现报告.md) - 完整技术文档
- [MinIO部署指南](./MinIO部署指南.md) - 对象存储部署
- [个性化内容API](./个性化内容API快速参考.md) - P3接口文档

---

**文档版本**: v1.0  
**最后更新**: 2025-10-30

