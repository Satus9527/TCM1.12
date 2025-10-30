/**
 * 测试推荐 API 验证器
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// 先登录获取 token
async function login() {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'health@example.com',
      password: 'password123'
    });
    return response.data.data.access_token;
  } catch (error) {
    console.error('登录失败:', error.message);
    process.exit(1);
  }
}

async function test() {
  const token = await login();
  console.log('✅ 登录成功\n');

  // 测试 1: 缺少 symptoms 字段
  console.log('测试 1: 缺少 symptoms 字段');
  console.log('发送数据:', JSON.stringify({ tongue_desc: '舌红苔黄' }, null, 2));
  try {
    await axios.post(
      `${BASE_URL}/api/recommend/formula`,
      { tongue_desc: '舌红苔黄' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('❌ 应该返回 400 但请求成功了\n');
  } catch (error) {
    console.log(`状态码: ${error.response?.status || 'N/A'}`);
    console.log('响应数据:', JSON.stringify(error.response?.data, null, 2));
    console.log();
  }

  // 测试 2: 空 symptoms 数组
  console.log('测试 2: 空 symptoms 数组');
  console.log('发送数据:', JSON.stringify({ symptoms: [] }, null, 2));
  try {
    await axios.post(
      `${BASE_URL}/api/recommend/formula`,
      { symptoms: [] },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('❌ 应该返回 400 但请求成功了\n');
  } catch (error) {
    console.log(`状态码: ${error.response?.status || 'N/A'}`);
    console.log('响应数据:', JSON.stringify(error.response?.data, null, 2));
    console.log();
  }

  // 测试 3: 正确的请求
  console.log('测试 3: 正确的请求');
  console.log('发送数据:', JSON.stringify({ symptoms: ['头痛', '发热'] }, null, 2));
  try {
    const response = await axios.post(
      `${BASE_URL}/api/recommend/formula`,
      { symptoms: ['头痛', '发热'] },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(`状态码: ${response.status}`);
    console.log('✅ 请求成功（AI 服务可能不可用，这是正常的）');
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log(`状态码: ${error.response?.status || 'N/A'}`);
    console.log('响应数据:', JSON.stringify(error.response?.data, null, 2));
  }
}

test().catch(console.error);

