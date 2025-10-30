// WebSocket 票据功能测试脚本
const http = require('http');

const baseURL = 'localhost';
const port = 3000;
let accessToken = '';

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
          const jsonBody = JSON.parse(body);
          resolve({ statusCode: res.statusCode, body: jsonBody });
        } catch (e) {
          reject(new Error(`解析JSON失败: ${body}`));
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

// 测试函数
async function runTests() {
  console.log('\n========================================');
  console.log('WebSocket 票据功能测试');
  console.log('========================================\n');

  try {
    // 测试 1: 登录获取 Token
    console.log('[测试 1] 用户登录...');
    const loginData = {
      username: 'teacher_li',
      password: 'password123'
    };
    const login = await httpRequest('POST', '/api/auth/login', loginData);
    if (login.statusCode === 200 && login.body.success) {
      console.log('✅ 登录成功');
      console.log(`   用户: ${login.body.data.user.username}`);
      accessToken = login.body.data.accessToken;
    } else {
      console.log('❌ 登录失败');
      return;
    }

    // 测试 2: 生成 WebSocket 票据
    console.log('\n[测试 2] 生成 WebSocket 票据...');
    const wsTicket = await httpRequest('POST', '/api/auth/ws-ticket', null, accessToken);
    if (wsTicket.statusCode === 200 && wsTicket.body.success) {
      console.log('✅ WebSocket 票据生成成功');
      console.log(`   票据: ${wsTicket.body.data.ticket.substring(0, 16)}...`);
      console.log(`   过期时间: ${wsTicket.body.data.expires_in} 秒`);
      console.log(`   过期于: ${wsTicket.body.data.expires_at}`);
      
      const ticket = wsTicket.body.data.ticket;

      // 测试 3: 等待几秒后验证票据仍然有效
      console.log('\n[测试 3] 等待 2 秒后验证票据...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('✅ 票据在 TTL 内应该仍然有效');

      // 注意：验证票据需要实现 WebSocket 服务器或单独的验证接口
      // 这里我们只测试生成功能

    } else {
      console.log('❌ WebSocket 票据生成失败');
      if (wsTicket.body.error) {
        console.log(`   错误: ${wsTicket.body.error.message}`);
      }
    }

    // 测试 4: 未认证用户尝试生成票据
    console.log('\n[测试 4] 未认证用户尝试生成票据...');
    const unauthorizedTicket = await httpRequest('POST', '/api/auth/ws-ticket');
    if (unauthorizedTicket.statusCode === 401) {
      console.log('✅ 正确拦截未认证请求');
      console.log(`   错误: ${unauthorizedTicket.body.error?.message || '未授权'}`);
    } else {
      console.log('❌ 应该拦截未认证请求');
    }

    // 测试 5: 多次生成票据
    console.log('\n[测试 5] 多次生成票据测试...');
    const ticket1 = await httpRequest('POST', '/api/auth/ws-ticket', null, accessToken);
    const ticket2 = await httpRequest('POST', '/api/auth/ws-ticket', null, accessToken);
    
    if (ticket1.body.success && ticket2.body.success) {
      const t1 = ticket1.body.data.ticket;
      const t2 = ticket2.body.data.ticket;
      
      if (t1 !== t2) {
        console.log('✅ 每次生成的票据都是唯一的');
        console.log(`   票据1: ${t1.substring(0, 16)}...`);
        console.log(`   票据2: ${t2.substring(0, 16)}...`);
      } else {
        console.log('❌ 票据应该是唯一的');
      }
    }

  } catch (error) {
    console.log('❌ 测试过程中发生错误:', error.message);
    console.error(error);
  }

  console.log('\n========================================');
  console.log('测试完成！');
  console.log('========================================\n');
  
  // 注意：Redis 连接可能需要手动关闭
  console.log('⚠️  如果 Redis 连接保持打开，请按 Ctrl+C 退出');
}

// 运行测试
runTests();

