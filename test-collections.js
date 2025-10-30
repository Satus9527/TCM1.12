// 用户收藏功能测试脚本
const http = require('http');

const baseURL = 'localhost';
const port = 3000;
let accessToken = '';
let testFormulaId = '';

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
  console.log('用户收藏功能测试');
  console.log('========================================\n');

  try {
    // 测试 1: 登录获取 Token
    console.log('[测试 1] 用户登录...');
    const loginData = {
      username: 'student_wang',
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

    // 测试 2: 获取方剂列表（获取测试用的方剂ID）
    console.log('\n[测试 2] 获取方剂列表...');
    const formulas = await httpRequest('GET', '/api/formulas?limit=1');
    if (formulas.statusCode === 200 && formulas.body.success) {
      console.log('✅ 获取方剂列表成功');
      if (formulas.body.data.formulas.length > 0) {
        testFormulaId = formulas.body.data.formulas[0].formula_id;
        console.log(`   测试方剂: ${formulas.body.data.formulas[0].name} (${testFormulaId})`);
      }
    } else {
      console.log('❌ 获取方剂列表失败');
      return;
    }

    // 测试 3: 添加收藏
    console.log('\n[测试 3] 添加收藏...');
    const addCollectionData = {
      formula_id: testFormulaId,
      notes: '这个方剂很不错，值得收藏学习！'
    };
    const addCollection = await httpRequest('POST', '/api/collections', addCollectionData, accessToken);
    if (addCollection.statusCode === 201 && addCollection.body.success) {
      console.log('✅ 添加收藏成功');
      console.log(`   方剂: ${addCollection.body.data.formula.name}`);
      console.log(`   备注: ${addCollection.body.data.notes}`);
    } else if (addCollection.statusCode === 409) {
      console.log('⚠️  该方剂已收藏（预期行为）');
    } else {
      console.log('❌ 添加收藏失败:', addCollection.body.error?.message || '未知错误');
    }

    // 测试 4: 检查是否已收藏
    console.log('\n[测试 4] 检查是否已收藏...');
    const checkCollection = await httpRequest('GET', `/api/collections/check/${testFormulaId}`, null, accessToken);
    if (checkCollection.statusCode === 200 && checkCollection.body.success) {
      console.log('✅ 检查收藏状态成功');
      console.log(`   是否已收藏: ${checkCollection.body.data.is_collected ? '是' : '否'}`);
    } else {
      console.log('❌ 检查收藏状态失败');
    }

    // 测试 5: 获取收藏列表
    console.log('\n[测试 5] 获取收藏列表...');
    const getCollections = await httpRequest('GET', '/api/collections?page=1&limit=10', null, accessToken);
    if (getCollections.statusCode === 200 && getCollections.body.success) {
      console.log('✅ 获取收藏列表成功');
      console.log(`   总收藏数: ${getCollections.body.data.pagination.total}`);
      if (getCollections.body.data.collections.length > 0) {
        console.log(`   第一个收藏: ${getCollections.body.data.collections[0].formula.name}`);
      }
    } else {
      console.log('❌ 获取收藏列表失败');
    }

    // 测试 6: 更新收藏备注
    console.log('\n[测试 6] 更新收藏备注...');
    const updateNotesData = {
      notes: '更新后的备注：这个方剂的组成非常经典！'
    };
    const updateNotes = await httpRequest('PUT', `/api/collections/${testFormulaId}`, updateNotesData, accessToken);
    if (updateNotes.statusCode === 200 && updateNotes.body.success) {
      console.log('✅ 更新备注成功');
      console.log(`   新备注: ${updateNotes.body.data.notes}`);
    } else {
      console.log('❌ 更新备注失败:', updateNotes.body.error?.message || '未知错误');
    }

    // 测试 7: 获取收藏统计
    console.log('\n[测试 7] 获取收藏统计...');
    const getStats = await httpRequest('GET', '/api/collections/stats', null, accessToken);
    if (getStats.statusCode === 200 && getStats.body.success) {
      console.log('✅ 获取收藏统计成功');
      console.log(`   总收藏数: ${getStats.body.data.total_collections}`);
    } else {
      console.log('❌ 获取收藏统计失败');
    }

    // 测试 8: 取消收藏
    console.log('\n[测试 8] 取消收藏...');
    const removeCollection = await httpRequest('DELETE', `/api/collections/${testFormulaId}`, null, accessToken);
    if (removeCollection.statusCode === 200 && removeCollection.body.success) {
      console.log('✅ 取消收藏成功');
    } else {
      console.log('❌ 取消收藏失败:', removeCollection.body.error?.message || '未知错误');
    }

    // 测试 9: 再次检查收藏状态（应该是未收藏）
    console.log('\n[测试 9] 再次检查收藏状态...');
    const checkAgain = await httpRequest('GET', `/api/collections/check/${testFormulaId}`, null, accessToken);
    if (checkAgain.statusCode === 200 && checkAgain.body.success) {
      console.log('✅ 检查收藏状态成功');
      console.log(`   是否已收藏: ${checkAgain.body.data.is_collected ? '是' : '否'}`);
    } else {
      console.log('❌ 检查收藏状态失败');
    }

  } catch (error) {
    console.log('❌ 测试过程中发生错误:', error.message);
  }

  console.log('\n========================================');
  console.log('测试完成！');
  console.log('========================================\n');
}

// 运行测试
runTests();

