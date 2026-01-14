const axios = require('axios');

// 模拟前端API调用
async function testApiCalls() {
  console.log('开始测试API调用...');
  
  // 测试1: 药材列表API
  console.log('\n1. 测试药材列表API: GET /api/medicines');
  try {
    const response = await axios.get('http://localhost:3000/api/medicines');
    console.log('状态码:', response.status);
    console.log('数据结构:', Object.keys(response.data));
    if (response.data.success) {
      console.log('药材总数:', response.data.data.medicines.length);
      console.log('分页信息:', response.data.data.pagination);
      console.log('前3个药材:', response.data.data.medicines.slice(0, 3).map(m => m.name));
    }
  } catch (error) {
    console.error('错误:', error.message);
    if (error.response) {
      console.error('响应数据:', error.response.data);
    }
  }
  
  // 测试2: 药材分类API
  console.log('\n2. 测试药材分类API: GET /api/medicine-categories');
  try {
    const response = await axios.get('http://localhost:3000/api/medicine-categories');
    console.log('状态码:', response.status);
    console.log('数据结构:', Object.keys(response.data));
    if (response.data.success) {
      console.log('分类数量:', response.data.data.length);
      console.log('分类列表:', response.data.data);
    }
  } catch (error) {
    console.error('错误:', error.message);
    if (error.response) {
      console.error('响应数据:', error.response.data);
    }
  }
  
  // 测试3: 收藏列表API
  console.log('\n3. 测试收藏列表API: GET /api/content/collections');
  try {
    const response = await axios.get('http://localhost:3000/api/content/collections');
    console.log('状态码:', response.status);
    console.log('数据结构:', Object.keys(response.data));
    console.log('响应数据:', response.data);
  } catch (error) {
    console.error('错误:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
  
  console.log('\nAPI测试完成');
}

testApiCalls();
