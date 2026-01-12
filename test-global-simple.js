/**
 * 全局测试自检脚本（简化版）
 * 逐个运行测试并输出汇总报告
 */

const { spawn } = require('child_process');
const path = require('path');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log(`\n${'='.repeat(70)}`);
  log(`${title}`, 'bright');
  console.log('='.repeat(70));
}

function logSubSection(title) {
  console.log(`\n${'-'.repeat(70)}`);
  log(`${title}`, 'cyan');
  console.log('-'.repeat(70));
}

// 测试模块
const testModules = [
  { file: 'test-auth-middleware.js', name: '认证授权中间件', desc: 'JWT认证、RBAC权限验证' },
  { file: 'test-knowledge-api.js', name: '知识库API', desc: '药材查询、方剂查询、缓存' },
  { file: 'test-recommendation-api.js', name: 'AI推荐服务', desc: '方剂推荐、症状分析' },
  { file: 'test-content-api.js', name: '个性化内容', desc: '收藏管理、模拟方案、文件列表' },
  { file: 'test-file-upload.js', name: '文件上传', desc: '文件上传、类型限制、权限控制' },
  { file: 'test-websocket.js', name: 'WebSocket实时模拟', desc: '实时模拟、安全校验' }
];

// 运行单个测试
function runTest(testFile, testName, testDesc) {
  return new Promise((resolve, reject) => {
    log(`\n运行测试: ${testName}`, 'yellow');
    log(`  描述: ${testDesc}`, 'blue');
    
    const testPath = path.join(__dirname, testFile);
    const process = spawn('node', [testFile], {
      cwd: __dirname,
      stdio: 'pipe'
    });
    
    let stdout = '';
    let stderr = '';
    
    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    process.on('close', (code) => {
      // 尝试解析输出
      const output = stdout + stderr;
      const passedMatch = output.match(/通过:\s*(\d+)/);
      // 改进：只匹配统计输出的"失败: N"，避免匹配错误信息中的"xxx失败: 500"
      const failedMatch = output.match(/(?:^\s*|[\r\n]+\s*)失败:\s*(\d+)(?:\s*[\r\n]|\s*总计)/m);
      const skippedMatch = output.match(/跳过:\s*(\d+)/);
      
      const passed = parseInt(passedMatch?.[1] || '0');
      const failed = parseInt(failedMatch?.[1] || '0');
      const skipped = parseInt(skippedMatch?.[1] || '0');
      
      if (passed > 0 && failed === 0 && code === 0) {
        log(`✓ ${testName} - 全部通过 (${passed}个测试)`, 'green');
        resolve({ success: true, passed, failed, skipped, output });
      } else if (failed > 0) {
        log(`✗ ${testName} - 有失败 (通过: ${passed}, 失败: ${failed})`, 'red');
        resolve({ success: false, passed, failed, skipped, output });
      } else if (code !== 0) {
        log(`✗ ${testName} - 执行异常 (退出码: ${code})`, 'red');
        if (stderr) {
          log(`  错误: ${stderr.split('\n').slice(0, 2).join(' ')}`, 'red');
        }
        resolve({ success: false, passed, failed, skipped, output: stderr });
      } else {
        log(`⚠ ${testName} - 结果未明确 (退出码: ${code})`, 'yellow');
        resolve({ success: null, passed, failed, skipped, output });
      }
    });
    
    process.on('error', (error) => {
      log(`✗ ${testName} - 启动失败: ${error.message}`, 'red');
      resolve({ success: false, passed: 0, failed: 1, skipped: 0, output: error.message });
    });
    
    // 30秒超时
    setTimeout(() => {
      process.kill();
      log(`✗ ${testName} - 超时`, 'red');
      resolve({ success: false, passed: 0, failed: 1, skipped: 0, output: 'Timeout' });
    }, 30000);
  });
}

// 检查后端服务
async function checkBackend() {
  try {
    const axios = require('axios');
    const response = await axios.get('http://localhost:3000/api/health', { timeout: 5000 });
    if (response.status === 200) {
      log('✓ 后端服务运行正常', 'green');
      log(`  URL: http://localhost:3000`, 'blue');
      return true;
    }
  } catch (error) {
    log('✗ 后端服务未运行', 'red');
    log('  请先启动: npm run dev', 'yellow');
    return false;
  }
}

// 主流程
async function main() {
  logSection('TCM 平台全局测试自检');
  
  log('\n开始时间:', 'bright');
  log(`  ${new Date().toLocaleString('zh-CN')}`, 'blue');
  
  // 检查后端
  const backendOk = await checkBackend();
  if (!backendOk) {
    process.exit(1);
  }
  
  // 运行所有测试
  logSection('运行测试');
  
  const results = [];
  
  for (const test of testModules) {
    const result = await runTest(test.file, test.name, test.desc);
    results.push({ ...test, ...result });
    
    // 短暂延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 汇总报告
  logSection('测试结果汇总');
  
  const totalPassed = results.reduce((sum, r) => sum + r.passed, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
  const totalSkipped = results.reduce((sum, r) => sum + r.skipped, 0);
  
  const successCount = results.filter(r => r.success === true).length;
  const failedCount = results.filter(r => r.success === false).length;
  const unclearCount = results.filter(r => r.success === null).length;
  
  // 模块统计
  log('\n模块统计:', 'bright');
  log(`  总数: ${testModules.length}`, 'blue');
  log(`  ✓ 全部通过: ${successCount}`, 'green');
  log(`  ✗ 有失败: ${failedCount}`, 'red');
  log(`  ⚠ 结果不明: ${unclearCount}`, 'yellow');
  
  // 用例统计
  log('\n测试用例统计:', 'bright');
  log(`  通过: ${totalPassed}`, 'green');
  log(`  失败: ${totalFailed}`, 'red');
  log(`  跳过: ${totalSkipped}`, 'yellow');
  log(`  总计: ${totalPassed + totalFailed + totalSkipped}`, 'blue');
  
  if (totalPassed + totalFailed > 0) {
    const passRate = ((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1);
    log(`  通过率: ${passRate}%`, passRate === '100.0' ? 'green' : 'yellow');
  }
  
  // 详细结果
  logSection('详细结果');
  
  for (const result of results) {
    const icon = result.success === true ? '✓' : result.success === false ? '✗' : '⚠';
    const color = result.success === true ? 'green' : result.success === false ? 'red' : 'yellow';
    const status = result.success === true ? '通过' : result.success === false ? '失败' : '不明';
    
    log(`\n${icon} ${result.name}`, color);
    log(`  状态: ${status}`, color);
    log(`  通过: ${result.passed}, 失败: ${result.failed}, 跳过: ${result.skipped}`, 'blue');
  }
  
  // 总结
  logSection('总结');
  
  if (failedCount === 0 && totalFailed === 0) {
    log('\n🎉 所有测试通过！系统运行正常。', 'green');
    log('\n建议:', 'bright');
    log('  ✓ 检查日志文件确认无警告', 'blue');
    log('  ✓ 进行性能测试', 'blue');
    log('  ✓ 准备部署', 'blue');
  } else {
    log('\n⚠ 部分测试失败，需要修复。', 'yellow');
    log('\n建议:', 'bright');
    log('  • 查看失败的测试详情', 'blue');
    log('  • 检查日志文件确定原因', 'blue');
    log('  • 修复问题后重新测试', 'blue');
  }
  
  log('\n结束时间:', 'bright');
  log(`  ${new Date().toLocaleString('zh-CN')}`, 'blue');
  
  console.log('\n');
  
  // 退出码
  process.exit(failedCount > 0 || totalFailed > 0 ? 1 : 0);
}

// 运行
if (require.main === module) {
  main().catch(error => {
    console.error('\n致命错误:', error);
    process.exit(1);
  });
}

module.exports = { main };

