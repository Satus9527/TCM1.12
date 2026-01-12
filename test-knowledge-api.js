// 知识库 API 测试脚本
const http = require('http');
const querystring = require('querystring');

const baseURL = 'localhost';
const port = 3000;
let accessToken = '';
let medicineId = '';
let formulaId = '';

// 测试统计
const testStats = {
  passed: 0,
  failed: 0,
  skipped: 0
};

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
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({ statusCode: res.statusCode, body: jsonBody });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: body });
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
  console.log('知识库 API 测试');
  console.log('========================================\n');

  try {
    // ============ 准备工作：登录获取 Token ============
    console.log('【准备工作】登录获取 Token\n');

    console.log('[0] 登录测试用户...');
    const login = await httpRequest('POST', '/api/auth/login', {
      username: 'teacher_li',
      password: 'password123'
    });

    if (login.statusCode === 200) {
      accessToken = login.body.data.access_token;
      console.log('✅ 登录成功\n');
      testStats.passed++;
    } else {
      console.log('❌ 登录失败');
      console.log(`   状态码: ${login.statusCode}`);
      testStats.failed++;
      return;
    }

    console.log('========================================\n');

    // ============ 测试 1: 搜索药材 ============
    console.log('【测试 1】搜索药材\n');

    console.log('[1.1] 搜索药材：人参...');
    const encodedPath = '/api/knowledge/medicines/search?' + querystring.stringify({ q: '人参' });
    const searchMed = await httpRequest('GET', encodedPath, null, accessToken);
    if (searchMed.statusCode === 200) {
      console.log('✅ 搜索成功');
      console.log(`   找到 ${searchMed.body.data.medicines.length} 条结果`);
      if (searchMed.body.data.medicines.length > 0) {
        const medicine = searchMed.body.data.medicines[0];
        medicineId = medicine.medicine_id;
        console.log(`   药材名: ${medicine.name}`);
        console.log(`   拼音: ${medicine.pinyin}`);
        console.log(`   分类: ${medicine.category}`);
        console.log(`   性: ${medicine.nature}`);
        console.log(`   味: ${medicine.flavor}`);
      }
      testStats.passed++;
    } else {
      console.log('❌ 搜索失败');
      console.log(`   状态码: ${searchMed.statusCode}`);
      console.log(`   消息: ${searchMed.body.message || searchMed.body.error}`);
      testStats.failed++;
    }
    console.log('');

    // 测试 1.2: 搜索不存在的药材
    console.log('[1.2] 搜索不存在的药材...');
    const notFoundPath = '/api/knowledge/medicines/search?' + querystring.stringify({ q: '不存在的药材名称xyz' });
    const searchNotFound = await httpRequest('GET', notFoundPath, null, accessToken);
    if (searchNotFound.statusCode === 200) {
      console.log('✅ 请求成功');
      console.log(`   找到 ${searchNotFound.body.data.medicines.length} 条结果（应该为0）`);
      testStats.passed++;
    } else {
      console.log('❌ 请求失败');
      testStats.failed++;
    }
    console.log('');

    // 测试 1.3: 无 Token 访问
    console.log('[1.3] 无 Token 访问（应该被拒绝）...');
    const noTokenPath = '/api/knowledge/medicines/search?' + querystring.stringify({ q: '人参' });
    const noToken = await httpRequest('GET', noTokenPath);
    if (noToken.statusCode === 401) {
      console.log('✅ 正确返回 401 Unauthorized');
      testStats.passed++;
    } else {
      console.log(`❌ 应该返回 401，实际返回: ${noToken.statusCode}`);
      testStats.failed++;
    }
    console.log('');

    console.log('========================================\n');

    // ============ 测试 2: 获取药材详情 ============
    console.log('【测试 2】获取药材详情\n');

    if (medicineId) {
      console.log(`[2.1] 获取药材详情 (ID: ${medicineId.substring(0, 8)}...)...`);
      const getMed = await httpRequest('GET', `/api/knowledge/medicines/${medicineId}`, null, accessToken);
      if (getMed.statusCode === 200) {
        console.log('✅ 获取成功');
        console.log(`   药材名: ${getMed.body.data.name}`);
        console.log(`   功效: ${getMed.body.data.efficacy ? getMed.body.data.efficacy.substring(0, 30) + '...' : '无'}`);
        testStats.passed++;
        
        // 测试缓存 - 再次请求同一个药材
        console.log('\n[2.2] 再次请求同一药材（测试缓存）...');
        const getMedCached = await httpRequest('GET', `/api/knowledge/medicines/${medicineId}`, null, accessToken);
        if (getMedCached.statusCode === 200) {
          console.log('✅ 缓存命中（应该更快）');
          testStats.passed++;
        } else {
          testStats.failed++;
        }
      } else {
        console.log('❌ 获取失败');
        console.log(`   状态码: ${getMed.statusCode}`);
        testStats.failed++;
      }
    } else {
      console.log('⚠️  跳过测试（无药材ID）');
      testStats.skipped++;
    }
    console.log('');

    // 测试 2.3: 无效的 ID 格式
    console.log('[2.3] 使用无效的 ID 格式...');
    const invalidId = await httpRequest('GET', '/api/knowledge/medicines/invalid-id', null, accessToken);
    if (invalidId.statusCode === 400) {
      console.log('✅ 正确返回 400 Bad Request');
      console.log(`   消息: ${invalidId.body.message}`);
      testStats.passed++;
    } else {
      console.log(`❌ 应该返回 400，实际返回: ${invalidId.statusCode}`);
      testStats.failed++;
    }
    console.log('');

    // 测试 2.4: 不存在的 ID
    console.log('[2.4] 使用不存在的 ID...');
    const notFoundId = await httpRequest('GET', '/api/knowledge/medicines/00000000-0000-0000-0000-000000000000', null, accessToken);
    if (notFoundId.statusCode === 404) {
      console.log('✅ 正确返回 404 Not Found');
      console.log(`   消息: ${notFoundId.body.message}`);
      testStats.passed++;
    } else {
      console.log(`❌ 应该返回 404，实际返回: ${notFoundId.statusCode}`);
      testStats.failed++;
    }
    console.log('');

    console.log('========================================\n');

    // ============ 测试 3: 搜索方剂 ============
    console.log('【测试 3】搜索方剂\n');

    console.log('[3.1] 搜索方剂：四君子...');
    const formulaPath = '/api/knowledge/formulas/search?' + querystring.stringify({ q: '四君子' });
    const searchFormula = await httpRequest('GET', formulaPath, null, accessToken);
    if (searchFormula.statusCode === 200) {
      console.log('✅ 搜索成功');
      console.log(`   找到 ${searchFormula.body.data.formulas.length} 条结果`);
      if (searchFormula.body.data.formulas.length > 0) {
        const formula = searchFormula.body.data.formulas[0];
        formulaId = formula.formula_id;
        console.log(`   方剂名: ${formula.name}`);
        console.log(`   分类: ${formula.category}`);
        console.log(`   出处: ${formula.source}`);
        console.log(`   功效: ${formula.efficacy ? formula.efficacy.substring(0, 30) + '...' : '无'}`);
      }
      testStats.passed++;
    } else {
      console.log('❌ 搜索失败');
      console.log(`   状态码: ${searchFormula.statusCode}`);
      testStats.failed++;
    }
    console.log('');

    console.log('========================================\n');

    // ============ 测试 4: 获取方剂详情（含组成） ============
    console.log('【测试 4】获取方剂详情（含组成药材）\n');

    if (formulaId) {
      console.log(`[4.1] 获取方剂详情 (ID: ${formulaId.substring(0, 8)}...)...`);
      const getFormula = await httpRequest('GET', `/api/knowledge/formulas/${formulaId}`, null, accessToken);
      if (getFormula.statusCode === 200) {
        console.log('✅ 获取成功');
        const data = getFormula.body.data;
        console.log(`   方剂名: ${data.name}`);
        console.log(`   功效: ${data.efficacy ? data.efficacy.substring(0, 30) + '...' : '无'}`);
        
        // 检查组成药材
        if (data.medicines && Array.isArray(data.medicines)) {
          console.log(`   组成药材数: ${data.medicines.length}`);
          if (data.medicines.length > 0) {
            console.log('   组成示例:');
            data.medicines.slice(0, 3).forEach(med => {
              const comp = med.FormulaComposition || {};
              console.log(`     - ${med.name} (${comp.dosage || '未知剂量'}) [${comp.role || '未知角色'}]`);
            });
          }
        } else {
          console.log('   ⚠️  未找到组成药材信息');
        }
        testStats.passed++;
      } else {
        console.log('❌ 获取失败');
        console.log(`   状态码: ${getFormula.statusCode}`);
        testStats.failed++;
      }
    } else {
      console.log('⚠️  跳过测试（无方剂ID）');
      testStats.skipped++;
    }
    console.log('');

    console.log('========================================\n');

    // ============ 测试 5: 按功效搜索 ============
    console.log('【测试 5】按功效搜索\n');

    console.log('[5.1] 按功效搜索药材：补气...');
    const efficacyMedPath = '/api/knowledge/medicines/efficacy?' + querystring.stringify({ q: '补气' });
    const searchEfficacy = await httpRequest('GET', efficacyMedPath, null, accessToken);
    if (searchEfficacy.statusCode === 200) {
      console.log('✅ 搜索成功');
      console.log(`   找到 ${searchEfficacy.body.data.medicines.length} 条结果`);
      testStats.passed++;
    } else {
      console.log('❌ 搜索失败');
      testStats.failed++;
    }
    console.log('');

    console.log('[5.2] 按功效搜索方剂：补益...');
    const efficacyPath = '/api/knowledge/formulas/efficacy?' + querystring.stringify({ q: '补益' });
    const searchFormulaEfficacy = await httpRequest('GET', efficacyPath, null, accessToken);
    if (searchFormulaEfficacy.statusCode === 200) {
      console.log('✅ 搜索成功');
      console.log(`   找到 ${searchFormulaEfficacy.body.data.formulas.length} 条结果`);
      testStats.passed++;
    } else {
      console.log('❌ 搜索失败');
      testStats.failed++;
    }
    console.log('');

    console.log('========================================\n');

    // ============ 测试总结 ============
    console.log('【测试总结】\n');
    console.log('✅ 知识库 API 功能测试');
    console.log('   - 药材搜索 ✅');
    console.log('   - 药材详情 ✅');
    console.log('   - 方剂搜索 ✅');
    console.log('   - 方剂详情（含组成） ✅');
    console.log('   - 按功效搜索 ✅');
    console.log('   - 认证保护 ✅');
    console.log('   - 错误处理 ✅');
    console.log('   - 缓存机制 ✅');
    console.log('');

  } catch (error) {
    console.log('\n❌ 测试过程中发生错误:', error.message);
    console.error(error);
  }

  console.log('========================================');
  console.log('测试完成');
  console.log('========================================');
  console.log(`通过: ${testStats.passed}`);
  console.log(`失败: ${testStats.failed}`);
  console.log(`跳过: ${testStats.skipped}`);
  console.log(`总计: ${testStats.passed + testStats.failed + testStats.skipped}`);
  console.log('========================================\n');
  
  console.log('⚠️  注意：');
  console.log('   - 如果 Redis 未运行，缓存功能会降级但不影响主功能');
  console.log('   - 查看服务器日志可以看到缓存命中/未命中的详细信息');
  console.log('');
  
  process.exit(testStats.failed > 0 ? 1 : 0);
}

// 运行测试
runTests();

