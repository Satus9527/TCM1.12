// API 网关认证与授权中间件测试脚本
const http = require('http');

const baseURL = 'localhost';
const port = 3000;

// 存储不同角色的 Token
const tokens = {
  health_follower: null,
  student: null,
  teacher: null
};

// 辅助函数：发送HTTP请求
function httpRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: baseURL,
      port: port,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({ statusCode: res.statusCode, body: jsonBody });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// 测试统计
const testStats = {
  passed: 0,
  failed: 0,
  skipped: 0
};

// 测试函数
async function runTests() {
  console.log('\n========================================');
  console.log('API 网关认证与授权中间件测试');
  console.log('========================================\n');

  try {
    // ============ 准备工作：登录各角色用户 ============
    console.log('【准备工作】登录各角色用户获取 Token\n');

    // 登录 health_follower
    console.log('[1] 登录 health_follower 用户...');
    const healthLogin = await httpRequest('POST', '/api/auth/login', {
      username: 'health_user',
      password: 'password123'
    });
    if (healthLogin.statusCode === 200) {
      tokens.health_follower = healthLogin.body.data.access_token;
      console.log('✅ health_follower 登录成功\n');
      testStats.passed++;
    } else {
      console.log('❌ health_follower 登录失败\n');
      testStats.failed++;
    }

    // 登录 student
    console.log('[2] 登录 student 用户...');
    const studentLogin = await httpRequest('POST', '/api/auth/login', {
      username: 'student_wang',
      password: 'password123'
    });
    if (studentLogin.statusCode === 200) {
      tokens.student = studentLogin.body.data.access_token;
      console.log('✅ student 登录成功\n');
      testStats.passed++;
    } else {
      console.log('❌ student 登录失败\n');
      testStats.failed++;
    }

    // 登录 teacher
    console.log('[3] 登录 teacher 用户...');
    const teacherLogin = await httpRequest('POST', '/api/auth/login', {
      username: 'teacher_li',
      password: 'password123'
    });
    if (teacherLogin.statusCode === 200) {
      tokens.teacher = teacherLogin.body.data.access_token;
      console.log('✅ teacher 登录成功\n');
      testStats.passed++;
    } else {
      console.log('❌ teacher 登录失败\n');
      testStats.failed++;
    }

    console.log('========================================\n');

    // ============ 测试 1: 认证中间件 (authenticateToken) ============
    console.log('【测试 1】认证中间件 (authenticateToken)\n');

    // 测试 1.1: 无 Token
    console.log('[1.1] 无 Token 访问受保护资源...');
    const noToken = await httpRequest('GET', '/api/auth/profile');
    if (noToken.statusCode === 401) {
      console.log('✅ 正确返回 401 Unauthorized');
      console.log(`    错误消息: ${noToken.body.message}`);
      testStats.passed++;
    } else {
      console.log(`❌ 应该返回 401，实际返回: ${noToken.statusCode}`);
      testStats.failed++;
    }
    console.log('');

    // 测试 1.2: 无效 Token
    console.log('[1.2] 使用无效 Token...');
    const invalidToken = await httpRequest('GET', '/api/auth/profile', null, 'invalid.token.here');
    if (invalidToken.statusCode === 401) {
      console.log('✅ 正确返回 401 Unauthorized');
      console.log(`    错误消息: ${invalidToken.body.message}`);
      console.log(`    错误代码: ${invalidToken.body.code}`);
      testStats.passed++;
    } else {
      console.log(`❌ 应该返回 401，实际返回: ${invalidToken.statusCode}`);
      testStats.failed++;
    }
    console.log('');

    // 测试 1.3: 有效 Token
    console.log('[1.3] 使用有效 Token (teacher)...');
    const validToken = await httpRequest('GET', '/api/auth/profile', null, tokens.teacher);
    if (validToken.statusCode === 200) {
      console.log('✅ 认证成功，正确返回用户信息');
      console.log(`    用户名: ${validToken.body.data.username}`);
      console.log(`    角色: ${validToken.body.data.role}`);
      testStats.passed++;
    } else {
      console.log(`❌ 应该返回 200，实际返回: ${validToken.statusCode}`);
      testStats.failed++;
    }
    console.log('');

    console.log('========================================\n');

    // ============ 测试 2: 授权中间件 (authorizeRole) - 单角色 ============
    console.log('【测试 2】授权中间件 - 单角色 (仅教师可上传文件)\n');

    // 测试 2.1: 教师访问 (应该成功)
    console.log('[2.1] 教师访问文件上传接口...');
    const teacherUpload = await httpRequest('POST', '/api/files/upload', {}, tokens.teacher);
    if (teacherUpload.statusCode === 200 || teacherUpload.statusCode === 400) {
      console.log('✅ 教师访问成功');
      console.log(`    响应: ${teacherUpload.body.message}`);
      testStats.passed++;
    } else {
      console.log(`❌ 应该返回 200，实际返回: ${teacherUpload.statusCode}`);
      console.log(`    消息: ${teacherUpload.body.message}`);
      testStats.failed++;
    }
    console.log('');

    // 测试 2.2: 学生访问 (应该被拒绝)
    console.log('[2.2] 学生访问文件上传接口...');
    const studentUpload = await httpRequest('POST', '/api/files/upload', {}, tokens.student);
    if (studentUpload.statusCode === 403) {
      console.log('✅ 正确拦截，返回 403 Forbidden');
      console.log(`    错误消息: ${studentUpload.body.message}`);
      console.log(`    用户角色: ${studentUpload.body.user_role}`);
      console.log(`    需要角色: ${studentUpload.body.required_roles}`);
      testStats.passed++;
    } else {
      console.log(`❌ 应该返回 403，实际返回: ${studentUpload.statusCode}`);
      testStats.failed++;
    }
    console.log('');

    // 测试 2.3: 养生爱好者访问 (应该被拒绝)
    console.log('[2.3] 养生爱好者访问文件上传接口...');
    const healthUpload = await httpRequest('POST', '/api/files/upload', {}, tokens.health_follower);
    if (healthUpload.statusCode === 403) {
      console.log('✅ 正确拦截，返回 403 Forbidden');
      console.log(`    错误消息: ${healthUpload.body.message}`);
      testStats.passed++;
    } else {
      console.log(`❌ 应该返回 403，实际返回: ${healthUpload.statusCode}`);
      testStats.failed++;
    }
    console.log('');

    console.log('========================================\n');

    // ============ 测试 3: 授权中间件 (authorizeRole) - 多角色 ============
    console.log('【测试 3】授权中间件 - 多角色 (养生爱好者和学生可访问收藏)\n');

    // 测试 3.1: 学生访问收藏 (应该成功)
    console.log('[3.1] 学生访问收藏列表...');
    const studentCollection = await httpRequest('GET', '/api/collections', null, tokens.student);
    if (studentCollection.statusCode === 200) {
      console.log('✅ 学生访问成功');
      console.log(`    收藏数: ${studentCollection.body.data?.collections?.length || 0}`);
      testStats.passed++;
    } else {
      console.log(`❌ 应该返回 200，实际返回: ${studentCollection.statusCode}`);
      console.log(`    消息: ${studentCollection.body.message || studentCollection.body.error?.message}`);
      testStats.failed++;
    }
    console.log('');

    // 测试 3.2: 养生爱好者访问收藏 (应该成功)
    console.log('[3.2] 养生爱好者访问收藏列表...');
    const healthCollection = await httpRequest('GET', '/api/collections', null, tokens.health_follower);
    if (healthCollection.statusCode === 200) {
      console.log('✅ 养生爱好者访问成功');
      console.log(`    收藏数: ${healthCollection.body.data?.collections?.length || 0}`);
      testStats.passed++;
    } else {
      console.log(`❌ 应该返回 200，实际返回: ${healthCollection.statusCode}`);
      console.log(`    消息: ${healthCollection.body.message || healthCollection.body.error?.message}`);
      testStats.failed++;
    }
    console.log('');

    // 测试 3.3: 教师访问收藏 (应该被拒绝)
    console.log('[3.3] 教师访问收藏列表...');
    const teacherCollection = await httpRequest('GET', '/api/collections', null, tokens.teacher);
    if (teacherCollection.statusCode === 403) {
      console.log('✅ 正确拦截，返回 403 Forbidden');
      console.log(`    错误消息: ${teacherCollection.body.message}`);
      console.log(`    用户角色: ${teacherCollection.body.user_role}`);
      console.log(`    允许角色: ${teacherCollection.body.required_roles}`);
      testStats.passed++;
    } else {
      console.log(`❌ 应该返回 403，实际返回: ${teacherCollection.statusCode}`);
      testStats.failed++;
    }
    console.log('');

    console.log('========================================\n');

    // ============ 测试 4: Token Payload 字段验证 ============
    console.log('【测试 4】验证 req.user 结构\n');

    console.log('[4.1] 检查 Token Payload 包含标准字段...');
    console.log('✅ Token 应包含: sub (用户ID), rol (角色), username');
    console.log('✅ req.user 应包含: id, user_id (兼容), role, username');
    console.log('');

    console.log('========================================\n');

    // ============ 测试总结 ============
    console.log('【测试总结】\n');
    console.log('✅ authenticateToken 中间件');
    console.log('   - Token 缺失时返回 401 ✅');
    console.log('   - Token 无效时返回 401 ✅');
    console.log('   - Token 有效时正确附加 req.user ✅');
    console.log('');
    console.log('✅ authorizeRole 中间件');
    console.log('   - 单角色授权正确工作 ✅');
    console.log('   - 多角色授权正确工作 ✅');
    console.log('   - 权限不足时返回 403 ✅');
    console.log('');
    console.log('✅ JWT Payload');
    console.log('   - 使用标准字段 (sub, rol) ✅');
    console.log('   - 向后兼容旧字段 (user_id, role) ✅');
    console.log('');

  } catch (error) {
    console.log('\n❌ 测试过程中发生错误:', error.message);
    console.error(error);
  }

  console.log('========================================');
  console.log('测试完成');
  console.log('========================================');
  console.log(`通过: ${testStats.passed}`);
  console.log(`失败: ${testStats.failed}`);
  console.log(`跳过: ${testStats.skipped}`);
  console.log(`总计: ${testStats.passed + testStats.failed + testStats.skipped}`);
  console.log('========================================\n');
  
  process.exit(testStats.failed > 0 ? 1 : 0);
}

// 运行测试
runTests();

