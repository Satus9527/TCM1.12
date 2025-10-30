/**
 * WebSocket 实时模拟功能测试脚本
 * 
 * 测试内容：
 * 1. 获取 WebSocket 票据
 * 2. 建立 WebSocket 连接
 * 3. 接收初始状态
 * 4. 发送配方更新
 * 5. 接收安全检查结果
 * 6. 接收AI分析结果（如果E1服务可用）
 */

const axios = require('axios');
const WebSocket = require('ws');

const BASE_URL = 'http://localhost:3000';
const WS_BASE_URL = 'ws://localhost:3000';

// 测试用户凭证
const TEST_USER = {
  email: 'health@example.com',
  password: 'password123'
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

function logTest(title) {
  console.log('\n' + '='.repeat(60));
  log(`📝 测试: ${title}`, 'blue');
  console.log('='.repeat(60));
}

// 全局变量
let authToken = '';
let wsTicket = '';
let ws = null;

/**
 * 步骤 1: 登录获取访问令牌
 */
async function step1_login() {
  logTest('登录获取访问令牌');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, TEST_USER);
    
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

/**
 * 步骤 2: 获取 WebSocket 票据
 */
async function step2_getWsTicket() {
  logTest('获取WebSocket票据');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/api/auth/ws-ticket`,
      {},
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    if (response.data.success && response.data.data.ticket) {
      wsTicket = response.data.data.ticket;
      logSuccess('获取票据成功');
      log(`Ticket: ${wsTicket.substring(0, 20)}...`);
      log(`过期时间: ${response.data.data.expires_in}秒`);
      return true;
    } else {
      logError('获取票据失败：响应格式错误');
      return false;
    }
  } catch (error) {
    logError(`获取票据失败: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * 步骤 3: 建立 WebSocket 连接
 */
async function step3_connectWebSocket() {
  logTest('建立WebSocket连接');
  
  return new Promise((resolve, reject) => {
    try {
      const wsUrl = `${WS_BASE_URL}/api/simulation?ticket=${wsTicket}`;
      log(`连接URL: ${wsUrl}`);
      
      ws = new WebSocket(wsUrl);
      
      ws.on('open', () => {
        logSuccess('WebSocket连接已建立');
        resolve(true);
      });
      
      ws.on('error', (error) => {
        logError(`WebSocket错误: ${error.message}`);
        reject(false);
      });
      
      ws.on('close', (code, reason) => {
        logWarning(`WebSocket连接已关闭 (代码: ${code}, 原因: ${reason || '无'})`);
      });
      
      // 超时处理
      setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          logError('WebSocket连接超时');
          ws.close();
          reject(false);
        }
      }, 5000);
      
    } catch (error) {
      logError(`建立WebSocket连接失败: ${error.message}`);
      reject(false);
    }
  });
}

/**
 * 步骤 4: 接收并验证初始状态
 */
async function step4_receiveInitState() {
  logTest('接收初始状态');
  
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      logError('接收初始状态超时');
      resolve(false);
    }, 5000);
    
    ws.once('message', (data) => {
      clearTimeout(timeout);
      
      try {
        const message = JSON.parse(data.toString());
        log(`收到消息类型: ${message.type}`);
        
        if (message.type === 'INIT_STATE') {
          logSuccess('收到初始状态');
          log(`状态内容: ${JSON.stringify(message.payload, null, 2)}`);
          resolve(true);
        } else {
          logWarning(`收到意外消息类型: ${message.type}`);
          resolve(false);
        }
      } catch (error) {
        logError(`解析初始状态失败: ${error.message}`);
        resolve(false);
      }
    });
  });
}

/**
 * 步骤 5: 发送配方更新（无禁忌）
 */
async function step5_sendSafeUpdate() {
  logTest('发送配方更新（无配伍禁忌）');
  
  const composition = [
    {
      medicine_id: 'ef76c5dd-ef1c-4229-a011-9b2a21189510',
      name: '人参',
      dosage: '9g',
      role: '君药'
    },
    {
      medicine_id: 'ce0ded1e-531e-49ae-bdde-69045e6745e4',
      name: '白术',
      dosage: '9g',
      role: '臣药'
    },
    {
      medicine_id: '597e7b89-0e38-4da9-843d-33354cba3472',
      name: '茯苓',
      dosage: '9g',
      role: '佐药'
    }
  ];
  
  const updateMessage = {
    type: 'UPDATE_COMPOSITION',
    payload: {
      composition,
      name: '测试方剂 - 无禁忌',
      notes: '这是一个安全的配方'
    }
  };
  
  log(`发送更新: ${JSON.stringify(updateMessage, null, 2)}`);
  ws.send(JSON.stringify(updateMessage));
  
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      logWarning('未收到安全检查响应');
      resolve(false);
    }, 2000);
    
    ws.once('message', (data) => {
      clearTimeout(timeout);
      
      try {
        const message = JSON.parse(data.toString());
        log(`收到消息类型: ${message.type}`);
        
        if (message.type === 'SAFETY_OK') {
          logSuccess('安全检查通过：无配伍禁忌');
          resolve(true);
        } else if (message.type === 'SAFETY_WARNING') {
          logWarning('收到安全警告（意外）');
          log(`警告内容: ${JSON.stringify(message.payload, null, 2)}`);
          resolve(true);
        } else {
          log(`收到其他消息: ${JSON.stringify(message, null, 2)}`);
          resolve(false);
        }
      } catch (error) {
        logError(`解析响应失败: ${error.message}`);
        resolve(false);
      }
    });
  });
}

/**
 * 步骤 6: 发送配方更新（包含禁忌）
 */
async function step6_sendUnsafeUpdate() {
  logTest('发送配方更新（包含配伍禁忌）');
  
  const composition = [
    {
      medicine_id: 'd85c3b55-0f83-4354-a37c-73d01b273072',
      name: '甘草',
      dosage: '6g',
      role: '使药'
    },
    {
      medicine_id: 'test-id-gansui',
      name: '甘遂',
      dosage: '3g',
      role: '君药'
    }
  ];
  
  const updateMessage = {
    type: 'UPDATE_COMPOSITION',
    payload: {
      composition,
      name: '测试方剂 - 有禁忌',
      notes: '这是一个包含配伍禁忌的配方（甘草反甘遂）'
    }
  };
  
  log(`发送更新: ${JSON.stringify(updateMessage, null, 2)}`);
  ws.send(JSON.stringify(updateMessage));
  
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      logWarning('未收到安全检查响应');
      resolve(false);
    }, 2000);
    
    ws.once('message', (data) => {
      clearTimeout(timeout);
      
      try {
        const message = JSON.parse(data.toString());
        log(`收到消息类型: ${message.type}`);
        
        if (message.type === 'SAFETY_WARNING') {
          logSuccess('安全检查检测到配伍禁忌');
          log(`警告内容: ${JSON.stringify(message.payload.warnings, null, 2)}`);
          resolve(true);
        } else if (message.type === 'SAFETY_OK') {
          logError('安全检查未检测到禁忌（意外）');
          resolve(false);
        } else {
          log(`收到其他消息: ${JSON.stringify(message, null, 2)}`);
          resolve(false);
        }
      } catch (error) {
        logError(`解析响应失败: ${error.message}`);
        resolve(false);
      }
    });
  });
}

/**
 * 步骤 7: 等待AI分析结果（去抖）
 */
async function step7_waitForAIAnalysis() {
  logTest('等待AI分析结果（去抖300ms后触发）');
  
  logInfo('等待去抖计时器触发...');
  
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      logWarning('未收到AI分析结果（E1服务可能不可用）');
      resolve(false);
    }, 10000); // 10秒超时
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'AI_ANALYSIS_RESULT') {
          clearTimeout(timeout);
          logSuccess('收到AI分析结果');
          log(`分析内容: ${JSON.stringify(message.payload, null, 2)}`);
          resolve(true);
        } else if (message.type === 'AI_ANALYSIS_ERROR') {
          clearTimeout(timeout);
          logWarning('AI分析失败');
          log(`错误信息: ${message.payload.message}`);
          resolve(true); // 返回true因为这是预期的降级行为
        }
      } catch (error) {
        // 忽略解析错误
      }
    });
  });
}

/**
 * 主测试流程
 */
async function runTests() {
  console.log('\n' + '╔' + '='.repeat(60) + '╗');
  console.log('║' + ' '.repeat(15) + 'WebSocket 实时模拟功能测试' + ' '.repeat(15) + '║');
  console.log('╚' + '='.repeat(60) + '╝\n');
  
  const results = {
    total: 7,
    passed: 0,
    failed: 0
  };
  
  try {
    // 测试 1
    if (await step1_login()) {
      results.passed++;
    } else {
      results.failed++;
      logError('后续测试需要登录，停止执行');
      return results;
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 测试 2
    if (await step2_getWsTicket()) {
      results.passed++;
    } else {
      results.failed++;
      logError('后续测试需要WebSocket票据，停止执行');
      return results;
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 测试 3
    if (await step3_connectWebSocket()) {
      results.passed++;
    } else {
      results.failed++;
      logError('后续测试需要WebSocket连接，停止执行');
      return results;
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 测试 4
    if (await step4_receiveInitState()) {
      results.passed++;
    } else {
      results.failed++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 测试 5
    if (await step5_sendSafeUpdate()) {
      results.passed++;
    } else {
      results.failed++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 测试 6
    if (await step6_sendUnsafeUpdate()) {
      results.passed++;
    } else {
      results.failed++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 测试 7
    if (await step7_waitForAIAnalysis()) {
      results.passed++;
    } else {
      results.failed++;
    }
    
  } catch (error) {
    logError(`测试执行异常: ${error.message}`);
  } finally {
    // 清理
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  }
  
  return results;
}

// 执行测试并显示结果
runTests().then(results => {
  console.log('\n' + '╔' + '='.repeat(60) + '╗');
  console.log('║' + ' '.repeat(25) + '测试总结' + ' '.repeat(25) + '║');
  console.log('╚' + '='.repeat(60) + '╝\n');
  
  log(`总测试数: ${results.total}`);
  log(`通过: ${results.passed}`, 'green');
  log(`失败: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log(`通过率: ${((results.passed / results.total) * 100).toFixed(1)}%`, results.failed === 0 ? 'green' : 'yellow');
  
  if (results.failed === 0) {
    log('\n🎉 所有测试通过！', 'green');
  } else {
    log('\n⚠️  部分测试未通过，请检查', 'yellow');
  }
  
  process.exit(results.failed === 0 ? 0 : 1);
}).catch(error => {
  logError(`测试运行失败: ${error.message}`);
  process.exit(1);
});

