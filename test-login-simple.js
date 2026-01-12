/**
 * 简单登录测试 - 诊断问题
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testLogin() {
  console.log('🔍 测试登录功能...\n');
  
  try {
    console.log('发送登录请求:');
    console.log('  URL:', `${BASE_URL}/api/auth/login`);
    console.log('  Email: health@example.com');
    console.log('  Password: password123\n');
    
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'health@example.com',
      password: 'password123'
    });
    
    console.log('✅ 登录成功!');
    console.log('状态码:', response.status);
    console.log('响应数据:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.access_token) {
      console.log('\n✅ Access Token已获取');
      console.log('Token长度:', response.data.access_token.length);
    } else {
      console.log('\n❌ 未找到access_token字段');
      console.log('可用字段:', Object.keys(response.data));
    }
    
  } catch (error) {
    console.log('❌ 登录失败!');
    console.log('错误:', error.message);
    
    if (error.response) {
      console.log('状态码:', error.response.status);
      console.log('响应数据:');
      console.log(JSON.stringify(error.response.data, null, 2));
    }
  }
}

testLogin();

