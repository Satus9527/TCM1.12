#!/usr/bin/env node

/**
 * Colab AI 服务快速连接测试脚本
 * 
 * 用途: 快速验证AI团队的Colab服务是否可访问
 * 使用方法: node test-ai-service-connection.js <public_url>
 * 
 * 示例: node test-ai-service-connection.js https://xxxx-xx-xx-xxx-xxx.ngrok-free.app
 */

const https = require('https');
const http = require('http');

// 从命令行参数获取URL
const publicUrl = process.argv[2];

if (!publicUrl) {
  console.error('❌ 错误: 请提供Colab Public URL');
  console.error('');
  console.error('使用方法:');
  console.error('  node test-ai-service-connection.js <public_url>');
  console.error('');
  console.error('示例:');
  console.error('  node test-ai-service-connection.js https://xxxx-xx-xx-xxx-xxx.ngrok-free.app');
  console.error('');
  console.error('提示: 从AI团队获取完整的Public URL');
  process.exit(1);
}

// 解析URL
let url;
try {
  url = new URL(publicUrl);
} catch (error) {
  console.error('❌ 错误: URL格式不正确');
  console.error('  请确保URL以 https:// 开头');
  process.exit(1);
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🧪 Colab AI 服务连接测试');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log(`目标URL: ${publicUrl}`);
console.log('');
console.log('开始测试...');
console.log('');

// 测试统计
const results = {
  health: null,
  consult: null,
  total: 2,
  passed: 0,
  failed: 0
};

// ============================================
// 测试1: 健康检查
// ============================================

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('测试1: 健康检查 (/health)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

function testHealthCheck() {
  return new Promise((resolve, reject) => {
    const healthUrl = `${publicUrl}/health`;
    const startTime = Date.now();
    
    const options = {
      method: 'GET',
      timeout: 10000,
      headers: {
        'User-Agent': 'TCM-Platform-Test/1.0'
      }
    };

    const client = url.protocol === 'https:' ? https : http;
    const req = client.request(healthUrl, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const duration = Date.now() - startTime;
        results.health = {
          statusCode: res.statusCode,
          duration,
          data
        };
        
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            console.log('✅ 健康检查成功');
            console.log(`   状态码: ${res.statusCode}`);
            console.log(`   响应时间: ${duration}ms`);
            console.log(`   响应内容:`);
            console.log(JSON.stringify(json, null, 2));
            results.passed++;
            resolve();
          } catch (error) {
            console.log('⚠️  健康检查成功但无法解析JSON');
            console.log(`   状态码: ${res.statusCode}`);
            console.log(`   响应时间: ${duration}ms`);
            console.log(`   原始响应: ${data.substring(0, 200)}`);
            results.health.error = 'Invalid JSON';
            results.passed++;
            resolve();
          }
        } else {
          console.log('❌ 健康检查失败');
          console.log(`   状态码: ${res.statusCode}`);
          console.log(`   响应: ${data.substring(0, 200)}`);
          results.failed++;
          resolve();
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ 健康检查连接失败');
      console.log(`   错误: ${error.message}`);
      results.health = { error: error.message };
      results.failed++;
      resolve();
    });

    req.on('timeout', () => {
      console.log('❌ 健康检查超时（>10秒）');
      req.destroy();
      results.health = { error: 'Timeout' };
      results.failed++;
      resolve();
    });

    req.end();
  });
}

// ============================================
// 测试2: 推荐接口测试
// ============================================

function testConsultEndpoint() {
  return new Promise((resolve, reject) => {
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('测试2: 咨询接口 (/consult)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const consultUrl = `${publicUrl}/consult`;
    const startTime = Date.now();
    
    // 模拟后端发送的推荐请求
    const requestBody = JSON.stringify({
      question: "我的症状是：发热，恶寒，头痛。请根据这些信息，辨证并推荐合适的经典方剂ID（格式：辨证为：[证型]。方剂ID：[uuid]。）。"
    });
    
    const options = {
      method: 'POST',
      timeout: 30000, // 30秒超时
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
        'User-Agent': 'TCM-Platform-Test/1.0'
      }
    };

    const client = url.protocol === 'https:' ? https : http;
    const req = client.request(consultUrl, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const duration = Date.now() - startTime;
        results.consult = {
          statusCode: res.statusCode,
          duration,
          dataLength: data.length
        };
        
        console.log(`状态码: ${res.statusCode}`);
        console.log(`响应时间: ${duration}ms`);
        console.log(`响应长度: ${data.length} bytes`);
        
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            console.log('');
            console.log('✅ 咨询接口响应成功');
            console.log(`响应内容:`);
            console.log(JSON.stringify(json, null, 2));
            
            // 检查响应格式
            if (json.success === true && json.answer) {
              console.log('');
              console.log('✅ 响应格式正确');
              console.log(`   - success: true`);
              console.log(`   - answer: 存在 (${json.answer.length} 字符)`);
              
              // 检查是否包含预期标记
              const hasFormulaId = /方剂ID：\[([^\]]+)\]/.test(json.answer);
              const hasReasoning = /辨证为：\[([^\]]+)\]/.test(json.answer);
              
              if (hasFormulaId && hasReasoning) {
                console.log('✅ 响应包含必要的标记格式');
                console.log('   推荐格式: ✅');
              } else {
                console.log('⚠️  响应缺少部分标记格式');
                console.log('   方剂ID标记: ' + (hasFormulaId ? '✅' : '❌'));
                console.log('   辨证标记: ' + (hasReasoning ? '✅' : '❌'));
              }
              
            } else {
              console.log('');
              console.log('⚠️  响应格式不符合预期');
              console.log(`   - success: ${json.success}`);
              console.log(`   - answer: ${json.answer ? '存在' : '缺失'}`);
            }
            
            results.passed++;
            resolve();
          } catch (error) {
            console.log('');
            console.log('❌ 无法解析JSON响应');
            console.log(`原始响应前200字符: ${data.substring(0, 200)}`);
            results.consult.error = 'Invalid JSON';
            results.failed++;
            resolve();
          }
        } else {
          console.log('');
          console.log('❌ 咨询接口返回错误');
          console.log(`响应: ${data.substring(0, 200)}`);
          results.failed++;
          resolve();
        }
      });
    });

    req.on('error', (error) => {
      console.log('');
      console.log('❌ 咨询接口连接失败');
      console.log(`错误: ${error.message}`);
      results.consult = { error: error.message };
      results.failed++;
      resolve();
    });

    req.on('timeout', () => {
      console.log('');
      console.log('❌ 咨询接口超时（>30秒）');
      req.destroy();
      results.consult = { error: 'Timeout' };
      results.failed++;
      resolve();
    });

    req.write(requestBody);
    req.end();
  });
}

// ============================================
// 主测试流程
// ============================================

async function runTests() {
  // 测试1: 健康检查
  await testHealthCheck();
  
  // 测试2: 咨询接口（如果健康检查通过）
  if (results.health && !results.health.error) {
    await testConsultEndpoint();
  } else {
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  跳过咨询接口测试（健康检查未通过）');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    results.consult = { skipped: true };
  }
  
  // 显示总结
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 测试总结');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log(`总计: ${results.total} 个测试`);
  console.log(`通过: ${results.passed} ✅`);
  console.log(`失败: ${results.failed} ❌`);
  console.log('');
  
  if (results.passed === results.total) {
    console.log('🎉 所有测试通过！');
    console.log('');
    console.log('✅ AI服务可以正常使用');
    console.log('   下一步: 更新 .env 文件并重启后端服务');
    process.exit(0);
  } else if (results.passed > 0) {
    console.log('⚠️  部分测试通过');
    console.log('');
    console.log('建议:');
    console.log('   - 检查网络连接');
    console.log('   - 确认AI服务URL正确');
    console.log('   - 联系AI团队确认服务状态');
    process.exit(1);
  } else {
    console.log('❌ 所有测试失败');
    console.log('');
    console.log('可能的原因:');
    console.log('   - URL不正确');
    console.log('   - AI服务未启动');
    console.log('   - 网络连接问题');
    console.log('   - Colab会话已过期');
    process.exit(1);
  }
}

// 执行测试
runTests().catch((error) => {
  console.error('');
  console.error('❌ 测试脚本错误:');
  console.error(error);
  process.exit(1);
});

