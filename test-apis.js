// API 测试脚本
const http = require('http');

const baseURL = 'localhost';
const port = 3000;
let accessToken = '';
let refreshToken = '';
let firstMedicineId = '';
let firstFormulaId = '';

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
  console.log('开始 API 测试');
  console.log('========================================\n');

  try {
    // 测试 1: 健康检查
    console.log('[测试 1] 健康检查...');
    const health = await httpRequest('GET', '/api/health');
    if (health.statusCode === 200 && health.body.success) {
      console.log('✅ 健康检查通过');
      console.log(`   状态: ${health.body.data.status}`);
    } else {
      console.log('❌ 健康检查失败');
    }

    // 测试 2: 用户注册
    console.log('\n[测试 2] 用户注册...');
    const randomNum = Math.floor(Math.random() * 9999);
    const registerData = {
      username: `testuser_${randomNum}`,
      password: '123456',
      role: 'student',
      email: `testuser_${randomNum}@example.com`,
      phone: '13800138888'
    };
    const register = await httpRequest('POST', '/api/auth/register', registerData);
    if (register.statusCode === 201 && register.body.success) {
      console.log('✅ 用户注册通过');
      console.log(`   用户名: ${register.body.data.user.username}`);
      console.log(`   角色: ${register.body.data.user.role}`);
      accessToken = register.body.data.accessToken;
      refreshToken = register.body.data.refreshToken;
    } else {
      console.log('❌ 用户注册失败:', register.body.error?.message || '未知错误');
    }

    // 测试 3: 用户登录
    console.log('\n[测试 3] 用户登录（预设账号）...');
    const loginData = {
      username: 'teacher_li',
      password: 'password123'
    };
    const login = await httpRequest('POST', '/api/auth/login', loginData);
    if (login.statusCode === 200 && login.body.success) {
      console.log('✅ 用户登录通过');
      console.log(`   用户名: ${login.body.data.user.username}`);
      console.log(`   角色: ${login.body.data.user.role}`);
      accessToken = login.body.data.accessToken;
      refreshToken = login.body.data.refreshToken;
      console.log('   Token已保存');
    } else {
      console.log('❌ 用户登录失败:', login.body.error?.message || '未知错误');
    }

    // 测试 4: 获取个人信息
    console.log('\n[测试 4] 获取个人信息...');
    const profile = await httpRequest('GET', '/api/auth/profile', null, accessToken);
    if (profile.statusCode === 200 && profile.body.success) {
      console.log('✅ 获取个人信息通过');
      console.log(`   用户名: ${profile.body.data.username}`);
      console.log(`   角色: ${profile.body.data.role}`);
    } else {
      console.log('❌ 获取个人信息失败:', profile.body.error?.message || '未知错误');
    }

    // 测试 5: 获取药材列表
    console.log('\n[测试 5] 获取药材列表...');
    const medicines = await httpRequest('GET', '/api/medicines?page=1&limit=5');
    if (medicines.statusCode === 200 && medicines.body.success) {
      console.log('✅ 获取药材列表通过');
      console.log(`   总数: ${medicines.body.data.pagination.total}`);
      console.log(`   当前页: ${medicines.body.data.pagination.page}`);
      if (medicines.body.data.medicines.length > 0) {
        console.log(`   第一个药材: ${medicines.body.data.medicines[0].name}`);
        firstMedicineId = medicines.body.data.medicines[0].medicine_id;
      }
    } else {
      console.log('❌ 获取药材列表失败:', medicines.body.error?.message || '未知错误');
    }

    // 测试 6: 获取药材详情
    if (firstMedicineId) {
      console.log('\n[测试 6] 获取药材详情...');
      const medicine = await httpRequest('GET', `/api/medicines/${firstMedicineId}`);
      if (medicine.statusCode === 200 && medicine.body.success) {
        console.log('✅ 获取药材详情通过');
        console.log(`   药材名称: ${medicine.body.data.name}`);
        console.log(`   分类: ${medicine.body.data.category}`);
        console.log(`   性味: ${medicine.body.data.nature} / ${medicine.body.data.flavor}`);
      } else {
        console.log('❌ 获取药材详情失败:', medicine.body.error?.message || '未知错误');
      }
    }

    // 测试 7: 获取方剂列表
    console.log('\n[测试 7] 获取方剂列表...');
    const formulas = await httpRequest('GET', '/api/formulas?page=1&limit=5');
    if (formulas.statusCode === 200 && formulas.body.success) {
      console.log('✅ 获取方剂列表通过');
      console.log(`   总数: ${formulas.body.data.pagination.total}`);
      console.log(`   当前页: ${formulas.body.data.pagination.page}`);
      if (formulas.body.data.formulas.length > 0) {
        console.log(`   第一个方剂: ${formulas.body.data.formulas[0].name}`);
        firstFormulaId = formulas.body.data.formulas[0].formula_id;
      }
    } else {
      console.log('❌ 获取方剂列表失败:', formulas.body.error?.message || '未知错误');
    }

    // 测试 8: 获取方剂详情（包含组成）
    if (firstFormulaId) {
      console.log('\n[测试 8] 获取方剂详情（包含组成）...');
      const formula = await httpRequest('GET', `/api/formulas/${firstFormulaId}`);
      if (formula.statusCode === 200 && formula.body.success) {
        console.log('✅ 获取方剂详情通过');
        console.log(`   方剂名称: ${formula.body.data.name}`);
        console.log(`   分类: ${formula.body.data.category}`);
        console.log(`   组成药材数: ${formula.body.data.compositions.length}`);
        if (formula.body.data.compositions.length > 0) {
          const first = formula.body.data.compositions[0];
          console.log(`   第一味药: ${first.medicine.name} - ${first.dosage}`);
        }
      } else {
        console.log('❌ 获取方剂详情失败:', formula.body.error?.message || '未知错误');
      }
    }

    // 测试 9: 创建药材（需要教师权限）
    console.log('\n[测试 9] 创建药材（教师权限）...');
    const randomNum2 = Math.floor(Math.random() * 9999);
    const newMedicineData = {
      name: `测试药材_${randomNum2}`,
      pinyin: 'ceshiyaocai',
      category: '补虚药',
      nature: '温',
      flavor: '甘',
      meridian: '脾、肺',
      efficacy: '补气健脾',
      indications: '脾虚气弱',
      usage_dosage: '6-12g'
    };
    const newMedicine = await httpRequest('POST', '/api/medicines', newMedicineData, accessToken);
    if (newMedicine.statusCode === 201 && newMedicine.body.success) {
      console.log('✅ 创建药材通过');
      console.log(`   药材名称: ${newMedicine.body.data.name}`);
    } else if (newMedicine.statusCode === 403) {
      console.log('⚠️  创建药材失败: 权限不足（预期行为）');
    } else {
      console.log('❌ 创建药材失败:', newMedicine.body.error?.message || '未知错误');
    }

    // 测试 10: 刷新 Token
    console.log('\n[测试 10] 刷新 Token...');
    const refresh = await httpRequest('POST', '/api/auth/refresh', { refreshToken });
    if (refresh.statusCode === 200 && refresh.body.success) {
      console.log('✅ 刷新 Token 通过');
      console.log('   新 Token 已生成');
    } else {
      console.log('❌ 刷新 Token 失败:', refresh.body.error?.message || '未知错误');
    }

    // 测试 11: 登出
    console.log('\n[测试 11] 登出...');
    const logout = await httpRequest('POST', '/api/auth/logout', { refreshToken });
    if (logout.statusCode === 200 && logout.body.success) {
      console.log('✅ 登出通过');
    } else {
      console.log('❌ 登出失败:', logout.body.error?.message || '未知错误');
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

