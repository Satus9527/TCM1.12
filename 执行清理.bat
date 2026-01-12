@echo off
chcp 65001 >nul
echo ============================================
echo 清理不需要的文件
echo ============================================
echo.
echo [警告] 此操作将删除以下类型的文件:
echo   - 临时测试脚本 (.ps1, .bat)
echo   - 重复的文档 (.md)
echo   - 过时的报告
echo.
echo 在执行前，请确认:
echo   1. 已查看 清理清单.md
echo   2. 已备份重要内容
echo.
pause

echo.
echo 开始清理...
echo.

REM 删除测试脚本
echo [1/5] 删除测试脚本...
if exist "测试后端API.ps1" del "测试后端API.ps1" /Q
if exist "测试后端推荐API.ps1" del "测试后端推荐API.ps1" /Q
if exist "测试登录-简化版.ps1" del "测试登录-简化版.ps1" /Q
if exist "测试登录.bat" del "测试登录.bat" /Q
if exist "测试登录-运行.bat" del "测试登录-运行.bat" /Q
if exist "测试推荐-运行.bat" del "测试推荐-运行.bat" /Q
if exist "验证AI接入-完整测试.bat" del "验证AI接入-完整测试.bat" /Q
if exist "启动测试.bat" del "启动测试.bat" /Q
echo   完成

REM 删除临时调试文档
echo [2/5] 删除临时调试文档...
if exist "⚠️_重要_必须重启前端.md" del "⚠️_重要_必须重启前端.md" /Q
if exist "⚠️_立即重启后端.md" del "⚠️_立即重启后端.md" /Q
if exist "🔍_浏览器调试步骤.md" del "🔍_浏览器调试步骤.md" /Q
if exist "✅_登录问题修复总结.md" del "✅_登录问题修复总结.md" /Q
if exist "✅_登录问题已修复.md" del "✅_登录问题已修复.md" /Q
echo   完成

REM 删除重复的修复文档
echo [3/5] 删除重复的修复文档...
if exist "修复总结和建议.md" del "修复总结和建议.md" /Q
if exist "🎉_修复成功报告.md" del "🎉_修复成功报告.md" /Q
if exist "🎊_最终修复报告.md" del "🎊_最终修复报告.md" /Q
if exist "🎯_完整修复总结报告.md" del "🎯_完整修复总结报告.md" /Q
if exist "🎯_完整修复执行总结.md" del "🎯_完整修复执行总结.md" /Q
if exist "🎉_完美修复完成.md" del "🎉_完美修复完成.md" /Q
if exist "✅_所有修复和配置完成.md" del "✅_所有修复和配置完成.md" /Q
if exist "🎊_所有修复已完成.md" del "🎊_所有修复已完成.md" /Q
if exist "📖_修复完成总索引.md" del "📖_修复完成总索引.md" /Q
echo   完成

REM 删除重复的测试报告
echo [4/5] 删除重复的测试报告...
if exist "全局测试自检报告.md" del "全局测试自检报告.md" /Q
if exist "实际测试验证报告.md" del "实际测试验证报告.md" /Q
if exist "测试结果正确解读.md" del "测试结果正确解读.md" /Q
if exist "如何实现100%测试通过率.md" del "如何实现100%测试通过率.md" /Q
if exist "✨_测试完成总结.md" del "✨_测试完成总结.md" /Q
echo   完成

REM 删除其他重复文档
echo [5/5] 删除其他重复文档...
if exist "为什么不需要所有测试通过.md" del "为什么不需要所有测试通过.md" /Q
if exist "✅_遗留问题解决状态.md" del "✅_遗留问题解决状态.md" /Q
if exist "遗留问题清单.md" del "遗留问题清单.md" /Q
if exist "工作日志报告.md" del "工作日志报告.md" /Q
echo   完成

echo.
echo ============================================
echo 清理完成！
echo ============================================
echo.
echo 已清理的文件类型:
echo   - 测试脚本
echo   - 临时调试文档
echo   - 重复的修复总结
echo   - 重复的测试报告
echo   - 过时的状态报告
echo.
echo 如需查看详细清单，请打开: 清理清单.md
echo.
pause
