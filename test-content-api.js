/**
 * 个性化内容API测试脚本
 * 
 * 测试内容：
 * 1. 用户收藏功能（添加、查询、删除）
 * 2. 模拟方案功能（保存、查询、删除）
 * 3. 文件元数据功能（保存、查询、删除）
 * 4. 权限控制测试
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// 测试用户凭证
const USERS = {
  health: {
    email: 'health@example.com',
    password: 'password123'
  },
  student: {
    email: 'student@example.com',
    password: 'password123'
  },
  teacher: {
    email: 'teacher@example.com',
    password: 'password123'
  }
};

// ANSI颜色代码
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// 日志函数
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logSeparator() {
  console.log('\n' + '='.repeat(80) + '\n');
}

// 登录函数
async function login(email, password) {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email,
      password
    });
    // 修复：Token在response.data.data中
    return response.data.data.access_token;
  } catch (error) {
    throw new Error(`登录失败: ${error.response?.data?.message || error.message}`);
  }
}

// 测试计数器
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// 运行单个测试
async function runTest(testName, testFn) {
  totalTests++;
  logInfo(`测试: ${testName}`);
  try {
    await testFn();
    passedTests++;
    logSuccess(`通过: ${testName}`);
  } catch (error) {
    failedTests++;
    logError(`失败: ${testName}`);
    logError(`  错误: ${error.message}`);
  }
  console.log('');
}

// ========== 收藏功能测试 ==========

async function testCollections() {
  logSeparator();
  log('📚 测试: 用户收藏功能', 'blue');
  logSeparator();

  const token = await login(USERS.health.email, USERS.health.password);

  // 测试1: 添加药材收藏
  await runTest('添加药材收藏', async () => {
    const response = await axios.post(
      `${BASE_URL}/api/content/collections`,
      {
        content_type: 'medicine',
        content_id: 'd85c3b55-0f83-4354-a37c-73d01b273072' // 甘草
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (response.status !== 201) {
      throw new Error(`状态码错误: ${response.status}`);
    }
    if (!response.data.data.collection_id) {
      throw new Error('响应中缺少collection_id');
    }
  });

  // 测试2: 添加方剂收藏
  await runTest('添加方剂收藏', async () => {
    const response = await axios.post(
      `${BASE_URL}/api/content/collections`,
      {
        content_type: 'formula',
        content_id: '1ad75812-66fb-42f9-b53f-4e4e1c0644b8' // 四君子汤
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (response.status !== 201) {
      throw new Error(`状态码错误: ${response.status}`);
    }
  });

  // 测试3: 重复收藏（应返回409）
  await runTest('重复收藏检测', async () => {
    try {
      await axios.post(
        `${BASE_URL}/api/content/collections`,
        {
          content_type: 'medicine',
          content_id: 'd85c3b55-0f83-4354-a37c-73d01b273072'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      throw new Error('应该返回409错误');
    } catch (error) {
      if (error.response?.status === 409) {
        return; // 正确
      }
      throw error;
    }
  });

  // 测试4: 获取收藏列表
  let collectionId;
  await runTest('获取收藏列表', async () => {
    const response = await axios.get(
      `${BASE_URL}/api/content/collections`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (response.status !== 200) {
      throw new Error(`状态码错误: ${response.status}`);
    }
    if (!Array.isArray(response.data.data)) {
      throw new Error('响应数据应该是数组');
    }
    if (response.data.data.length < 2) {
      throw new Error('收藏数量不正确');
    }

    collectionId = response.data.data[0].collection_id;
    logInfo(`  收藏数量: ${response.data.total}`);
  });

  // 测试5: 删除收藏
  await runTest('删除收藏', async () => {
    const response = await axios.delete(
      `${BASE_URL}/api/content/collections/${collectionId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (response.status !== 200) {
      throw new Error(`状态码错误: ${response.status}`);
    }
  });

  // 测试6: 删除不存在的收藏（应返回404）
  await runTest('删除不存在的收藏', async () => {
    try {
      await axios.delete(
        `${BASE_URL}/api/content/collections/00000000-0000-0000-0000-000000000000`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      throw new Error('应该返回404错误');
    } catch (error) {
      if (error.response?.status === 404) {
        return; // 正确
      }
      throw error;
    }
  });

  // 测试7: 教师角色无法访问收藏接口（应返回403）
  await runTest('教师角色权限检查', async () => {
    const teacherToken = await login(USERS.teacher.email, USERS.teacher.password);
    try {
      await axios.get(
        `${BASE_URL}/api/content/collections`,
        {
          headers: { Authorization: `Bearer ${teacherToken}` }
        }
      );
      throw new Error('应该返回403错误');
    } catch (error) {
      if (error.response?.status === 403) {
        return; // 正确
      }
      throw error;
    }
  });
}

// ========== 模拟方案功能测试 ==========

async function testSimulations() {
  logSeparator();
  log('🧪 测试: 模拟方案功能', 'blue');
  logSeparator();

  const token = await login(USERS.student.email, USERS.student.password);

  // 测试1: 保存模拟方案
  let simulationId;
  await runTest('保存模拟方案', async () => {
    const response = await axios.post(
      `${BASE_URL}/api/content/simulations/save`,
      {
        name: '测试方案 - 补气方',
        composition_data: {
          medicines: [
            { medicine_id: 'd85c3b55-0f83-4354-a37c-73d01b273072', name: '甘草', dosage: '6g' },
            { medicine_id: 'test-id-ginseng', name: '人参', dosage: '9g' }
          ]
        },
        ai_analysis_data: {
          recommendation: '补气健脾',
          confidence: 0.85
        },
        user_notes: '这是我的第一个配方'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (response.status !== 201) {
      throw new Error(`状态码错误: ${response.status}`);
    }
    if (!response.data.data.simulation_id) {
      throw new Error('响应中缺少simulation_id');
    }

    simulationId = response.data.data.simulation_id;
  });

  // 测试2: 获取模拟方案列表
  await runTest('获取模拟方案列表', async () => {
    const response = await axios.get(
      `${BASE_URL}/api/content/simulations`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (response.status !== 200) {
      throw new Error(`状态码错误: ${response.status}`);
    }
    if (!Array.isArray(response.data.data)) {
      throw new Error('响应数据应该是数组');
    }
    if (response.data.data.length === 0) {
      throw new Error('应该有至少一个模拟方案');
    }

    logInfo(`  方案数量: ${response.data.total}`);
  });

  // 测试3: 输入验证 - 缺少必需字段
  await runTest('输入验证 - 缺少方案名称', async () => {
    try {
      await axios.post(
        `${BASE_URL}/api/content/simulations/save`,
        {
          composition_data: { medicines: [] }
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      throw new Error('应该返回400错误');
    } catch (error) {
      if (error.response?.status === 400) {
        return; // 正确
      }
      throw error;
    }
  });

  // 测试4: 删除模拟方案
  await runTest('删除模拟方案', async () => {
    const response = await axios.delete(
      `${BASE_URL}/api/content/simulations/${simulationId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (response.status !== 200) {
      throw new Error(`状态码错误: ${response.status}`);
    }
  });
}

// ========== 文件功能测试 ==========

async function testFiles() {
  logSeparator();
  log('📁 测试: 文件元数据功能', 'blue');
  logSeparator();

  const teacherToken = await login(USERS.teacher.email, USERS.teacher.password);

  // 测试1: 保存文件元数据（内部接口）
  let fileId;
  await runTest('保存文件元数据', async () => {
    // 首先获取教师的user_id
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: USERS.teacher.email,
      password: USERS.teacher.password
    });
    
    // 从token中解码user_id（简化处理，生产环境应该有更安全的方式）
    // 修复：Token在response.data.data中
    const tokenPayload = JSON.parse(Buffer.from(loginResponse.data.data.access_token.split('.')[1], 'base64').toString());
    const userId = tokenPayload.sub;

    const response = await axios.post(
      `${BASE_URL}/api/content/files/meta`,
      {
        user_id: userId,
        file_name: '中医基础理论.pdf',
        storage_url: 'https://d8.example.com/files/tcm-basics.pdf',
        file_type: 'application/pdf',
        file_size: 1024000,
        uploaded_at: new Date().toISOString()
      },
      {
        headers: { Authorization: `Bearer ${teacherToken}` }
      }
    );

    if (response.status !== 201) {
      throw new Error(`状态码错误: ${response.status}`);
    }
    if (!response.data.data.file_id) {
      throw new Error('响应中缺少file_id');
    }

    fileId = response.data.data.file_id;
  });

  // 测试2: 获取文件列表
  await runTest('获取文件列表', async () => {
    const response = await axios.get(
      `${BASE_URL}/api/content/files`,
      {
        headers: { Authorization: `Bearer ${teacherToken}` }
      }
    );

    if (response.status !== 200) {
      throw new Error(`状态码错误: ${response.status}`);
    }
    if (!Array.isArray(response.data.data)) {
      throw new Error('响应数据应该是数组');
    }

    logInfo(`  文件数量: ${response.data.total}`);
  });

  // 测试3: 学生角色无法访问文件接口（应返回403）
  await runTest('学生角色权限检查', async () => {
    const studentToken = await login(USERS.student.email, USERS.student.password);
    try {
      await axios.get(
        `${BASE_URL}/api/content/files`,
        {
          headers: { Authorization: `Bearer ${studentToken}` }
        }
      );
      throw new Error('应该返回403错误');
    } catch (error) {
      if (error.response?.status === 403) {
        return; // 正确
      }
      throw error;
    }
  });

  // 测试4: 删除文件
  await runTest('删除文件', async () => {
    const response = await axios.delete(
      `${BASE_URL}/api/content/files/${fileId}`,
      {
        headers: { Authorization: `Bearer ${teacherToken}` }
      }
    );

    if (response.status !== 200) {
      throw new Error(`状态码错误: ${response.status}`);
    }
  });
}

// ========== 未认证访问测试 ==========

async function testUnauthorized() {
  logSeparator();
  log('🔒 测试: 未认证访问控制', 'blue');
  logSeparator();

  // 测试1: 无Token访问收藏接口
  await runTest('无Token访问收藏接口', async () => {
    try {
      await axios.get(`${BASE_URL}/api/content/collections`);
      throw new Error('应该返回401错误');
    } catch (error) {
      if (error.response?.status === 401) {
        return; // 正确
      }
      throw error;
    }
  });

  // 测试2: 无Token访问模拟方案接口
  await runTest('无Token访问模拟方案接口', async () => {
    try {
      await axios.get(`${BASE_URL}/api/content/simulations`);
      throw new Error('应该返回401错误');
    } catch (error) {
      if (error.response?.status === 401) {
        return; // 正确
      }
      throw error;
    }
  });

  // 测试3: 无Token访问文件接口
  await runTest('无Token访问文件接口', async () => {
    try {
      await axios.get(`${BASE_URL}/api/content/files`);
      throw new Error('应该返回401错误');
    } catch (error) {
      if (error.response?.status === 401) {
        return; // 正确
      }
      throw error;
    }
  });
}

// ========== 主测试函数 ==========

async function runAllTests() {
  console.clear();
  log('🚀 个性化内容API测试开始', 'cyan');
  console.log('');

  try {
    await testCollections();
    await testSimulations();
    await testFiles();
    await testUnauthorized();

    // 打印测试总结
    logSeparator();
    log('📊 测试总结', 'blue');
    logSeparator();
    
    console.log(`通过: ${passedTests}`);
    console.log(`失败: ${failedTests}`);
    console.log(`跳过: 0`);
    console.log(`总计: ${totalTests}`);
    
    console.log(`总测试数: ${totalTests}`);
    logSuccess(`通过: ${passedTests}`);
    if (failedTests > 0) {
      logError(`失败: ${failedTests}`);
    }
    console.log(`通过率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    console.log('');

    if (failedTests === 0) {
      logSuccess('🎉 所有测试通过！');
    } else {
      logWarning(`⚠️  ${failedTests} 个测试失败，请检查`);
    }

  } catch (error) {
    logError('测试执行出错:');
    console.error(error);
    process.exit(1);
  }
}

// 运行测试
runAllTests();

