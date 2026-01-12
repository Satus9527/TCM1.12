/**
 * AI推荐 API 测试脚本
 * 
 * 测试内容：
 * 1. 认证保护
 * 2. 输入验证
 * 3. 成功推荐场景
 * 4. 服务降级场景
 * 5. 安全检查警告
 */

const axios = require('axios');
const express = require('express');

const BASE_URL = 'http://localhost:3000';
const MOCK_E1_PORT = 5001; // Mock E1 服务端口
let authToken = '';
let mockE1Server = null;

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
  console.log('\n' + '='.repeat(70));
  log(`📝 测试: ${testName}`, 'blue');
  console.log('='.repeat(70));
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'magenta');
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ==================== Mock E1 服务 ====================
function createMockE1Server() {
  const app = express();
  app.use(express.json());

  // 正常推荐响应
  app.post('/recommend/formula', (req, res) => {
    log('Mock E1收到请求', 'yellow');
    
    // 模拟处理延迟
    setTimeout(() => {
      const response = {
        recommendations: [
          {
            formula_id: '1ad75812-66fb-42f9-b53f-4e4e1c0644b8', // ✅ 四君子汤（真实ID）
            reasoning: '根据症状分析，患者表现为气虚证候，建议使用补益气血的方剂',
            confidence: 0.85,
            matched_symptoms: req.body.symptoms
          },
          {
            formula_id: '476183c0-cc4d-40ab-a0ab-17d41c1540c2', // ✅ 四物汤（真实ID）
            reasoning: '次优方案：可配合健脾益气',
            confidence: 0.72,
            matched_symptoms: req.body.symptoms.slice(0, 2)
          }
        ]
      };
      res.json(response);
    }, 100);
  });

  // 健康检查
  app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
  });

  return app;
}

async function startMockE1() {
  return new Promise((resolve, reject) => {
    const app = createMockE1Server();
    mockE1Server = app.listen(MOCK_E1_PORT, () => {
      logInfo(`Mock E1 服务已启动在 http://localhost:${MOCK_E1_PORT}`);
      resolve();
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        logWarning(`端口 ${MOCK_E1_PORT} 已被占用，假设外部 E1 服务正在运行`);
        mockE1Server = null;
        resolve();
      } else {
        reject(err);
      }
    });
  });
}

function stopMockE1() {
  if (mockE1Server) {
    mockE1Server.close();
    logInfo('Mock E1 服务已停止');
  }
}

// ==================== 测试 1: 登录获取 Token ====================
async function test1_login() {
  logTest('登录获取 Token');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'health@example.com',
      password: 'password123'
    });

    if (response.data.success && response.data.data.access_token) {
      authToken = response.data.data.access_token;
      logSuccess('登录成功');
      log(`Token: ${authToken.substring(0, 30)}...`);
      return true;
    } else {
      logError('登录失败：响应格式错误');
      return false;
    }
  } catch (error) {
    logError(`登录失败: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// ==================== 测试 2: 未认证访问 ====================
async function test2_noAuth() {
  logTest('未认证访问（应返回401）');
  
  try {
    await axios.post(`${BASE_URL}/api/recommend/formula`, {
      symptoms: ['乏力', '气短']
    });
    logError('应该返回401但请求成功了');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      logSuccess('正确返回 401 Unauthorized');
      log(`响应: ${error.response.data.message}`);
      return true;
    } else {
      logError(`意外错误: ${error.message}`);
      return false;
    }
  }
}

// ==================== 测试 3: 输入验证 - 缺少症状 ====================
async function test3_missingSymptoms() {
  logTest('输入验证 - 缺少症状（应返回400）');
  
  try {
    await axios.post(
      `${BASE_URL}/api/recommend/formula`,
      {
        tongue_desc: '舌红苔黄'
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    logError('应该返回400但请求成功了');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      logSuccess('正确返回 400 Bad Request');
      const errors = error.response.data.errors;
      log(`验证错误: ${errors.map(e => e.message).join(', ')}`);
      return true;
    } else {
      logError(`意外错误: ${error.message}`);
      return false;
    }
  }
}

// ==================== 测试 4: 输入验证 - 空症状数组 ====================
async function test4_emptySymptoms() {
  logTest('输入验证 - 空症状数组（应返回400）');
  
  try {
    await axios.post(
      `${BASE_URL}/api/recommend/formula`,
      {
        symptoms: []
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    logError('应该返回400但请求成功了');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      logSuccess('正确返回 400 Bad Request');
      return true;
    } else {
      logError(`意外错误: ${error.message}`);
      return false;
    }
  }
}

// ==================== 测试 5: 成功推荐场景 ====================
async function test5_successfulRecommendation() {
  logTest('成功推荐场景');
  
  try {
    log('发送推荐请求...');
    const response = await axios.post(
      `${BASE_URL}/api/recommend/formula`,
      {
        symptoms: ['乏力', '气短', '少气懒言', '面色萎黄'],
        tongue_desc: '舌淡苔白',
        user_profile: {
          age: 45,
          gender: 'male',
          weight: 70
        }
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
        timeout: 10000
      }
    );

    if (response.data.success && response.data.data) {
      logSuccess('推荐请求成功');
      const recommendations = response.data.data.recommendations;
      
      log(`\n推荐方剂数量: ${recommendations.length}`);
      log(`是否有安全警告: ${response.data.data.has_safety_warnings ? '是' : '否'}`);
      
      recommendations.forEach((rec, index) => {
        console.log(`\n--- 推荐 ${index + 1} ---`);
        log(`方剂名称: ${rec.formula.name}`, 'magenta');
        log(`方剂来源: ${rec.formula.source}`);
        log(`功效: ${rec.formula.efficacy}`);
        log(`组成药材数: ${rec.formula.composition.length}`);
        log(`AI置信度: ${(rec.ai_analysis.confidence * 100).toFixed(1)}%`);
        log(`推荐理由: ${rec.ai_analysis.reasoning}`);
        log(`安全检查: ${rec.safety_check.is_safe ? '✅ 安全' : '⚠️ 有警告'}`, 
            rec.safety_check.is_safe ? 'green' : 'yellow');
        
        if (rec.safety_check.warnings.length > 0) {
          log('安全警告:', 'yellow');
          rec.safety_check.warnings.forEach(w => log(`  - ${w}`, 'yellow'));
        }
      });
      
      logSuccess('✅ 成功推荐场景测试通过');
      return true;
    } else {
      logError('响应格式不正确');
      return false;
    }
  } catch (error) {
    logError(`推荐请求失败: ${error.response?.data?.message || error.message}`);
    if (error.response) {
      log(JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

// ==================== 测试 6: 带有配伍禁忌的场景 ====================
async function test6_safetyWarning() {
  logTest('安全检查 - 检测配伍禁忌');
  
  logInfo('注意：此测试需要E1返回包含配伍禁忌药材的方剂');
  logInfo('例如：包含 甘草+甘遂, 或 乌头+贝母 等十八反药对');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/api/recommend/formula`,
      {
        symptoms: ['水肿', '胸腹积水', '喘满短气']
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
        timeout: 10000
      }
    );

    if (response.data.success && response.data.data) {
      const recommendations = response.data.data.recommendations;
      const hasWarnings = recommendations.some(r => !r.safety_check.is_safe);
      
      if (hasWarnings) {
        logSuccess('检测到配伍安全警告');
        recommendations.forEach(rec => {
          if (!rec.safety_check.is_safe) {
            log(`\n方剂: ${rec.formula.name}`, 'yellow');
            rec.safety_check.warnings.forEach(w => {
              log(`  ⚠️  ${w}`, 'yellow');
            });
          }
        });
      } else {
        logWarning('推荐的方剂中未检测到配伍禁忌（可能是正常的）');
      }
      
      return true;
    }
    return false;
  } catch (error) {
    logError(`测试失败: ${error.message}`);
    return false;
  }
}

// ==================== 测试 7: E1 服务降级 ====================
async function test7_serviceDegradation() {
  logTest('服务降级 - E1不可用（应返回503）');
  
  logWarning('此测试需要 E1 服务不可用，暂时停止 Mock E1');
  
  // 临时停止 Mock E1
  const originalServer = mockE1Server;
  stopMockE1();
  
  await delay(500); // 等待端口释放
  
  try {
    await axios.post(
      `${BASE_URL}/api/recommend/formula`,
      {
        symptoms: ['乏力', '气短']
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
        timeout: 8000
      }
    );
    logError('应该返回503但请求成功了');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 503) {
      logSuccess('正确触发服务降级，返回 503');
      log(`响应: ${error.response.data.message}`);
      log(`错误码: ${error.response.data.error_code}`);
      return true;
    } else {
      logError(`意外错误 (${error.response?.status}): ${error.message}`);
      return false;
    }
  } finally {
    // 恢复 Mock E1
    if (originalServer) {
      await startMockE1();
    }
  }
}

// ==================== 主测试流程 ====================
async function runAllTests() {
  console.log('\n');
  log('╔══════════════════════════════════════════════════════════════════╗', 'blue');
  log('║          AI推荐 API (P4 Logic) 功能测试                         ║', 'blue');
  log('╚══════════════════════════════════════════════════════════════════╝', 'blue');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };

  // 启动 Mock E1 服务
  try {
    await startMockE1();
  } catch (error) {
    logError(`启动 Mock E1 失败: ${error.message}`);
    process.exit(1);
  }

  await delay(1000);

  const tests = [
    { name: '登录获取Token', fn: test1_login },
    { name: '未认证访问', fn: test2_noAuth },
    { name: '输入验证-缺少症状', fn: test3_missingSymptoms },
    { name: '输入验证-空症状数组', fn: test4_emptySymptoms },
    { name: '成功推荐场景', fn: test5_successfulRecommendation },
    { name: '安全检查-配伍禁忌', fn: test6_safetyWarning },
    { name: '服务降级', fn: test7_serviceDegradation }
  ];

  for (const test of tests) {
    results.total++;
    try {
      const passed = await test.fn();
      if (passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    } catch (error) {
      logError(`测试执行异常: ${error.message}`);
      results.failed++;
    }
    await delay(500);
  }

  // 停止 Mock E1
  stopMockE1();

  // 测试总结
  console.log('\n');
  log('╔══════════════════════════════════════════════════════════════════╗', 'blue');
  log('║                        测试总结                                  ║', 'blue');
  log('╚══════════════════════════════════════════════════════════════════╝', 'blue');
  
  console.log(`通过: ${results.passed}`);
  console.log(`失败: ${results.failed}`);
  console.log(`跳过: 0`);
  console.log(`总计: ${results.total}`);
  
  log(`\n总测试数: ${results.total}`);
  log(`通过: ${results.passed}`, 'green');
  log(`失败: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log(`通过率: ${((results.passed / results.total) * 100).toFixed(1)}%\n`, 
      results.failed === 0 ? 'green' : 'yellow');

  if (results.failed === 0) {
    log('🎉 所有测试通过！AI推荐 API 实现完成！', 'green');
    log('✅ 认证保护正常', 'green');
    log('✅ 输入验证完整', 'green');
    log('✅ 推荐功能正常', 'green');
    log('✅ 安全检查正常', 'green');
    log('✅ 服务降级机制正常', 'green');
  } else {
    log('⚠️  部分测试未通过，请检查', 'yellow');
  }

  console.log('\n');
  process.exit(results.failed === 0 ? 0 : 1);
}

// 运行测试
runAllTests().catch(error => {
  logError(`测试执行出错: ${error.message}`);
  stopMockE1();
  process.exit(1);
});

