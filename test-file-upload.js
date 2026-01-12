/**
 * 文件上传API集成测试
 * 测试 /api/files/upload, /api/files, /api/files/:file_id 端点
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000/api';

// 辅助函数：获取教师Token
async function getTeacherToken() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'teacher_li',
      password: 'password123'
    });
    
    if (response.data && response.data.data && response.data.data.access_token) {
      return response.data.data.access_token;
    }
    
    throw new Error('响应内容错误');
  } catch (error) {
    if (error.response) {
      throw new Error(`登录失败: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    }
    throw new Error(`登录失败: ${error.message}`);
  }
}

// 辅助函数：创建测试文件
function createTestFile(fileName, size = 1024) {
  const testDir = path.join(__dirname, 'test-files');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir);
  }
  
  const filePath = path.join(testDir, fileName);
  const content = Buffer.alloc(size, 'A');
  fs.writeFileSync(filePath, content);
  return filePath;
}

// 测试1: 成功上传PDF文件
async function testSuccessfulUpload() {
  console.log('\n[测试1] 上传PDF文件...');
  
  try {
    const token = await getTeacherToken();
    const filePath = createTestFile('test-document.pdf', 2048);
    
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    
    const response = await axios.post(`${BASE_URL}/files/upload`, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✓ 上传成功');
    console.log('  文件ID:', response.data.data.file_id);
    console.log('  文件名:', response.data.data.file_name);
    console.log('  存储URL:', response.data.data.file_url);
    
    // 返回file_id供后续测试使用
    return response.data.data.file_id;
    
  } catch (error) {
    if (error.response) {
      console.log('✗ 上传失败:', error.response.status, JSON.stringify(error.response.data));
    } else {
      console.log('✗ 上传失败:', error.message);
    }
    return null;
  }
}

// 测试2: 获取文件列表
async function testGetFileList(fileId) {
  console.log('\n[测试2] 获取文件列表...');
  
  try {
    const token = await getTeacherToken();
    
    const response = await axios.get(`${BASE_URL}/files`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✓ 获取成功');
    console.log(`  文件数量: ${response.data.data.length}`);
    
    if (response.data.data.length > 0) {
      console.log('  第一个文件:', {
        file_id: response.data.data[0].file_id,
        file_name: response.data.data[0].file_name
      });
    }
    
    return true;
  } catch (error) {
    if (error.response) {
      console.log('✗ 获取失败:', error.response.status, JSON.stringify(error.response.data));
    } else {
      console.log('✗ 获取失败:', error.message);
    }
    return false;
  }
}

// 测试3: 验证文件类型限制
async function testFileTypeRestriction() {
  console.log('\n[测试3] 测试文件类型限制（上传.txt文件应该失败）...');
  
  try {
    const token = await getTeacherToken();
    const filePath = createTestFile('test.txt', 512);
    
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    
    const response = await axios.post(`${BASE_URL}/files/upload`, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✗ 测试失败：应该拒绝.txt文件，但上传成功了');
    return false;
    
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✓ 正确拒绝不允许的文件类型');
      return true;
    } else {
      console.log('✗ 意外的错误:', error.message);
      return false;
    }
  }
}

// 测试4: 验证文件大小限制
async function testFileSizeLimit() {
  console.log('\n[测试4] 测试文件大小限制（上传超大文件应该失败）...');
  
  try {
    const token = await getTeacherToken();
    const filePath = createTestFile('large.pdf', 100 * 1024 * 1024); // 100MB
    
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    
    const response = await axios.post(`${BASE_URL}/files/upload`, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✗ 测试失败：应该拒绝超大文件，但上传成功了');
    return false;
    
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✓ 正确拒绝超大文件');
      return true;
    } else {
      console.log('✗ 意外的错误:', error.message);
      return false;
    }
  }
}

// 测试5: 验证权限（只有教师能上传）
async function testAuthorization() {
  console.log('\n[测试5] 测试权限验证（学生用户应该被拒绝）...');
  
  try {
    // 尝试用学生账号登录
    const studentResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'student_wang',
      password: 'password123'
    });
    
    const studentToken = studentResponse.data.data.access_token;
    const filePath = createTestFile('test-student.pdf', 1024);
    
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    
    const response = await axios.post(`${BASE_URL}/files/upload`, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${studentToken}`
      }
    });
    
    console.log('✗ 测试失败：学生用户应该被拒绝上传，但上传成功了');
    return false;
    
  } catch (error) {
    if (error.response && error.response.status === 403) {
      console.log('✓ 正确拒绝非教师用户');
      return true;
    } else {
      console.log('⚠ 意外的状态码:', error.response?.status, error.message);
      return false;
    }
  }
}

// 测试6: 删除文件
async function testDeleteFile(fileId) {
  console.log('\n[测试6] 删除文件...');
  
  if (!fileId) {
    console.log('⚠ 跳过测试（没有可删除的文件ID）');
    return false;
  }
  
  try {
    const token = await getTeacherToken();
    
    const response = await axios.delete(`${BASE_URL}/files/${fileId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✓ 删除成功');
    return true;
    
  } catch (error) {
    if (error.response) {
      console.log('✗ 删除失败:', error.response.status, JSON.stringify(error.response.data));
    } else {
      console.log('✗ 删除失败:', error.message);
    }
    return false;
  }
}

// 主测试函数
async function runAllTests() {
  console.log('========================================');
  console.log('文件上传API集成测试');
  console.log('========================================');
  
  const results = {
    passed: 0,
    failed: 0,
    skipped: 0
  };
  
  try {
    // 测试1: 上传文件
    const fileId = await testSuccessfulUpload();
    if (fileId) {
      results.passed++;
    } else {
      results.failed++;
    }
    
    // 测试2: 获取文件列表
    const listSuccess = await testGetFileList(fileId);
    if (listSuccess) {
      results.passed++;
    } else {
      results.failed++;
    }
    
    // 测试3: 文件类型限制
    const typeRestriction = await testFileTypeRestriction();
    if (typeRestriction) {
      results.passed++;
    } else {
      results.failed++;
    }
    
    // 测试4: 文件大小限制
    const sizeLimit = await testFileSizeLimit();
    if (sizeLimit) {
      results.passed++;
    } else {
      results.failed++;
    }
    
    // 测试5: 权限验证
    const auth = await testAuthorization();
    if (auth) {
      results.passed++;
    } else {
      results.failed++;
    }
    
    // 测试6: 删除文件
    const deleteSuccess = await testDeleteFile(fileId);
    if (deleteSuccess) {
      results.passed++;
    } else {
      results.failed++;
    }
    
  } catch (error) {
    console.error('测试过程中发生错误:', error.message);
    results.failed++;
  }
  
  // 清理测试文件
  try {
    const testDir = path.join(__dirname, 'test-files');
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  } catch (e) {
    // 忽略清理错误
  }
  
  console.log('\n========================================');
  console.log('测试完成');
  console.log('========================================');
  console.log(`通过: ${results.passed}`);
  console.log(`失败: ${results.failed}`);
  console.log(`跳过: ${results.skipped}`);
  console.log(`总计: ${results.passed + results.failed + results.skipped}`);
  console.log('========================================\n');
  
  process.exit(results.failed > 0 ? 1 : 0);
}

// 运行测试
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('致命错误:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests };

