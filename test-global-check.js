/**
 * 全局测试自检脚本
 * 验证所有已实现的功能模块
 */

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log(`\n${'='.repeat(60)}`);
  log(`${title}`, 'bright');
  console.log('='.repeat(60));
}

function logSubSection(title) {
  console.log(`\n${'-'.repeat(60)}`);
  log(`${title}`, 'cyan');
  console.log('-'.repeat(60));
}

// 测试模块列表
const testModules = [
  {
    name: '认证与授权',
    tests: [
      { file: 'test-auth-middleware.js', name: '认证授权中间件测试' },
      { file: 'test-login-simple.js', name: '登录功能测试' }
    ]
  },
  {
    name: '知识库API',
    tests: [
      { file: 'test-knowledge-api.js', name: '知识库API测试' }
    ]
  },
  {
    name: 'AI推荐服务',
    tests: [
      { file: 'test-recommendation-api.js', name: 'AI推荐API测试' }
    ]
  },
  {
    name: 'WebSocket实时模拟',
    tests: [
      { file: 'test-websocket.js', name: 'WebSocket连接测试' }
    ]
  },
  {
    name: '个性化内容',
    tests: [
      { file: 'test-content-api.js', name: '个性化内容API测试' }
    ]
  },
  {
    name: '文件上传',
    tests: [
      { file: 'test-file-upload.js', name: '文件上传API测试' }
    ]
  }
];

// 全局统计
const globalStats = {
  totalModules: 0,
  passedModules: 0,
  failedModules: 0,
  skippedModules: 0,
  totalTests: 0,
  passedTests: 0,
  failedTests: 0
};

// 运行单个测试
async function runTest(testFile) {
  try {
    log(`\n正在运行: ${testFile}`, 'yellow');
    const { stdout, stderr } = await execAsync(`node ${testFile}`, {
      timeout: 30000, // 30秒超时
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });
    
    // 检查输出中是否有测试结果
    const output = stdout + stderr;
    const passedMatch = output.match(/通过:\s*(\d+)/);
    const failedMatch = output.match(/失败:\s*(\d+)/);
    
    if (passedMatch || failedMatch) {
      const passed = parseInt(passedMatch?.[1] || '0');
      const failed = parseInt(failedMatch?.[1] || '0');
      
      if (passed > 0 && failed === 0) {
        log(`✓ 测试通过`, 'green');
        return { success: true, passed, failed };
      } else if (failed > 0) {
        log(`✗ 测试失败`, 'red');
        return { success: false, passed, failed };
      }
    }
    
    // 如果没有明确的测试结果，检查退出代码
    log(`⚠ 无法解析测试结果`, 'yellow');
    return { success: null, passed: 0, failed: 0 };
    
  } catch (error) {
    log(`✗ 测试执行失败: ${error.message}`, 'red');
    return { success: false, passed: 0, failed: 1 };
  }
}

// 检查后端服务是否运行
async function checkBackendServer() {
  try {
    const axios = require('axios');
    const response = await axios.get('http://localhost:3000/api/health', { timeout: 5000 });
    if (response.status === 200) {
      log('✓ 后端服务运行正常', 'green');
      return true;
    } else {
      log('✗ 后端服务响应异常', 'red');
      return false;
    }
  } catch (error) {
    log('✗ 后端服务未运行或无法连接', 'red');
    log(`  请先启动后端: npm run dev`, 'yellow');
    return false;
  }
}

// 检查依赖服务
async function checkDependencies() {
  logSubSection('检查依赖服务');
  
  const checks = {
    MySQL: false,
    Redis: false,
    MinIO: false
  };
  
  // 检查MySQL
  try {
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      connectTimeout: 5000
    });
    await connection.end();
    checks.MySQL = true;
    log('✓ MySQL服务正常', 'green');
  } catch (error) {
    log('✗ MySQL服务异常或未运行', 'red');
  }
  
  // 检查Redis
  try {
    const redis = require('redis');
    const client = redis.createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        connectTimeout: 5000
      }
    });
    await client.connect();
    await client.disconnect();
    checks.Redis = true;
    log('✓ Redis服务正常', 'green');
  } catch (error) {
    log('✗ Redis服务异常或未运行', 'red');
  }
  
  // 检查MinIO
  try {
    const axios = require('axios');
    await axios.get('http://localhost:9000/minio/health/live', { timeout: 5000 });
    checks.MinIO = true;
    log('✓ MinIO服务正常', 'green');
  } catch (error) {
    log('⚠ MinIO服务未运行（文件上传功能将不可用）', 'yellow');
  }
  
  return checks;
}

// 主测试流程
async function runGlobalCheck() {
  logSection('TCM平台全局测试自检');
  
  // 1. 检查后端服务
  const backendRunning = await checkBackendServer();
  
  if (!backendRunning) {
    log('\n❌ 后端服务未运行，无法继续测试', 'red');
    process.exit(1);
  }
  
  // 2. 检查依赖服务
  const dependencies = await checkDependencies();
  
  // 3. 运行所有测试模块
  logSection('开始运行测试模块');
  
  const results = [];
  
  for (const module of testModules) {
    globalStats.totalModules++;
    logSubSection(`模块: ${module.name}`);
    
    const moduleResults = [];
    let modulePassed = true;
    
    for (const test of module.tests) {
      globalStats.totalTests++;
      const result = await runTest(test.file);
      moduleResults.push({ ...test, ...result });
      
      if (result.success === false) {
        modulePassed = false;
        globalStats.failedTests += result.failed;
        globalStats.passedTests += result.passed;
      } else if (result.success === true) {
        globalStats.passedTests += result.passed;
      }
      
      // 添加短暂延迟，避免过快请求
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    if (modulePassed && moduleResults.length > 0) {
      log(`\n✓ 模块 ${module.name} 测试通过`, 'green');
      globalStats.passedModules++;
    } else {
      log(`\n✗ 模块 ${module.name} 测试未完全通过`, 'red');
      globalStats.failedModules++;
    }
    
    results.push({ module: module.name, tests: moduleResults });
  }
  
  // 4. 生成报告
  logSection('测试结果汇总');
  
  log(`\n模块统计:`, 'bright');
  log(`  总数: ${globalStats.totalModules}`, 'blue');
  log(`  通过: ${globalStats.passedModules}`, 'green');
  log(`  失败: ${globalStats.failedModules}`, 'red');
  
  log(`\n测试用例统计:`, 'bright');
  log(`  总数: ${globalStats.totalTests}`, 'blue');
  log(`  通过: ${globalStats.passedTests}`, 'green');
  log(`  失败: ${globalStats.failedTests}`, 'red');
  
  if (globalStats.failedTests > 0) {
    log(`\n通过率: ${((globalStats.passedTests / (globalStats.passedTests + globalStats.failedTests)) * 100).toFixed(1)}%`, 'yellow');
  } else {
    log(`\n通过率: 100%`, 'green');
  }
  
  log(`\n依赖服务状态:`, 'bright');
  log(`  MySQL: ${dependencies.MySQL ? '✓ 正常' : '✗ 异常'}`, dependencies.MySQL ? 'green' : 'red');
  log(`  Redis: ${dependencies.Redis ? '✓ 正常' : '✗ 异常'}`, dependencies.Redis ? 'green' : 'red');
  log(`  MinIO: ${dependencies.MinIO ? '✓ 正常' : '⚠ 未运行'}`, dependencies.MinIO ? 'green' : 'yellow');
  
  // 5. 详细结果
  logSection('详细测试结果');
  
  for (const result of results) {
    logSubSection(result.module);
    for (const test of result.tests) {
      const status = test.success === true ? '✓' : test.success === false ? '✗' : '⚠';
      const color = test.success === true ? 'green' : test.success === false ? 'red' : 'yellow';
      log(`${status} ${test.name}`, color);
      if (test.passed > 0 || test.failed > 0) {
        log(`  通过: ${test.passed}, 失败: ${test.failed}`, 'blue');
      }
    }
  }
  
  // 6. 总结
  logSection('测试总结');
  
  if (globalStats.failedModules === 0 && globalStats.failedTests === 0) {
    log('\n🎉 所有测试通过！系统运行正常。', 'green');
    log('\n✅ 推荐操作:', 'bright');
    log('  • 检查日志文件确认无错误', 'blue');
    log('  • 进行压力测试', 'blue');
    log('  • 准备部署', 'blue');
  } else {
    log('\n⚠ 部分测试失败，请检查日志并修复问题。', 'yellow');
    log('\n🔧 建议操作:', 'bright');
    log('  • 查看错误日志确定问题', 'blue');
    log('  • 检查数据库连接', 'blue');
    log('  • 验证环境配置', 'blue');
    log('  • 重新运行失败的测试', 'blue');
  }
  
  console.log('\n');
  
  // 返回退出代码
  process.exit(globalStats.failedModules > 0 || globalStats.failedTests > 0 ? 1 : 0);
}

// 运行主流程
if (require.main === module) {
  runGlobalCheck().catch(error => {
    console.error('致命错误:', error);
    process.exit(1);
  });
}

module.exports = { runGlobalCheck };

