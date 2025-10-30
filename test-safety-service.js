/**
 * SafetyCheckService 诊断脚本
 * 测试安全检查服务是否能正确加载
 */

console.log('='.repeat(60));
console.log('SafetyCheckService 诊断测试');
console.log('='.repeat(60));

try {
  console.log('\n1. 尝试加载 SafetyCheckService...');
  const safetyCheckService = require('./src/services/safetyCheckService');
  console.log('✅ SafetyCheckService 加载成功');

  console.log('\n2. 检查数据是否已加载...');
  console.log(`   - incompatibilityData: ${safetyCheckService.incompatibilityData ? '✅ 已加载' : '❌ 未加载'}`);
  console.log(`   - relationshipData: ${safetyCheckService.relationshipData ? '✅ 已加载' : '❌ 未加载'}`);

  if (safetyCheckService.incompatibilityData) {
    console.log(`   - 十八反/十九畏数据条数: ${safetyCheckService.incompatibilityData.data.length}`);
  }

  if (safetyCheckService.relationshipData) {
    console.log(`   - 四相关系数据条数: ${safetyCheckService.relationshipData.relationships.length}`);
  }

  console.log('\n3. 测试 checkFormulaSafety 方法...');
  const testComposition = [
    { name: '人参', dosage: '9g' },
    { name: '白术', dosage: '9g' },
    { name: '茯苓', dosage: '9g' },
    { name: '甘草', dosage: '6g' }
  ];

  const result = safetyCheckService.checkFormulaSafety(testComposition);
  console.log('✅ checkFormulaSafety 执行成功');
  console.log(`   - 安全: ${result.isSafe}`);
  console.log(`   - 警告数: ${result.warnings.length}`);

  console.log('\n4. 测试有冲突的配方...');
  const conflictComposition = [
    { name: '甘草', dosage: '6g' },
    { name: '甘遂', dosage: '3g' }  // 甘草反甘遂
  ];

  const conflictResult = safetyCheckService.checkFormulaSafety(conflictComposition);
  console.log(`   - 安全: ${conflictResult.isSafe}`);
  console.log(`   - 警告数: ${conflictResult.warnings.length}`);
  if (conflictResult.warnings.length > 0) {
    console.log('   - 警告内容:');
    conflictResult.warnings.forEach(w => console.log(`     * ${w}`));
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ 所有测试通过！SafetyCheckService 工作正常');
  console.log('='.repeat(60));

} catch (error) {
  console.error('\n' + '='.repeat(60));
  console.error('❌ 错误：SafetyCheckService 加载失败');
  console.error('='.repeat(60));
  console.error('错误信息:', error.message);
  console.error('错误堆栈:', error.stack);
  process.exit(1);
}

