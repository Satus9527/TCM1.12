<template>
  <div class="chinese-medicine-login">
    <!-- 背景层 -->
    <div class="login-bg">
      <div class="bg-texture"></div>
      <div class="bg-pattern"></div>
      <div class="bg-herbs"></div>
    </div>

    <!-- 主内容 -->
    <div class="login-container">
      <!-- 顶部标题 -->
      <div class="login-header">
        <h1 class="platform-title">智慧平台</h1>
        <p class="platform-subtitle">传承千年智慧 · 守护现代健康</p>
      </div>

      <!-- 卷轴式登录框 -->
      <div class="scroll-login-box">
        <!-- 卷轴顶部装饰 -->
        <div class="scroll-top"></div>

        <!-- 登录内容 -->
        <div class="login-content">
          <!-- 右侧表单区域 -->
          <div class="form-section">
            <el-form
                :model="loginForm"
                :rules="loginRules"
                ref="loginFormRef"
                class="login-form"
            >
              <!-- 账号输入 -->
              <div class="form-item ancient-style">
                <div class="input-label">
                  <i class="el-icon-user"></i>
                  <span>账号</span>
                </div>
                <el-form-item prop="username">
                  <el-input
                      v-model="loginForm.username"
                      placeholder="请输入您的账号"
                      class="ancient-input"
                      size="large"
                  >
                    <template #prefix>
                      <i class="el-icon-user ancient-icon"></i>
                    </template>
                  </el-input>
                </el-form-item>
              </div>

              <!-- 密码输入 -->
              <div class="form-item ancient-style">
                <div class="input-label">
                  <i class="el-icon-lock"></i>
                  <span>密码</span>
                </div>
                <el-form-item prop="password">
                  <el-input
                      v-model="loginForm.password"
                      type="password"
                      placeholder="请输入您的密码"
                      class="ancient-input"
                      size="large"
                      show-password
                  >
                    <template #prefix>
                      <i class="el-icon-lock ancient-icon"></i>
                    </template>
                  </el-input>
                </el-form-item>
              </div>

              <!-- 登录按钮 -->
              <el-form-item>
                <el-button
                    type="primary"
                    class="login-btn ancient-btn"
                    :loading="loading"
                    @click="handleLogin"
                    size="large"
                >
                  <i class="el-icon-reading"></i>
                  账号登录
                </el-button>
              </el-form-item>

              <!-- 游客登录按钮 -->
              <el-form-item>
                <el-button
                    class="guest-login-btn"
                    :loading="guestLoading"
                    @click="handleGuestLogin"
                    size="large"
                >
                  <i class="el-icon-user"></i>
                  游客体验
                </el-button>
              </el-form-item>
            </el-form>

            <!-- 注册链接 -->
            <div class="register-link">
              <span>还没有账号？</span>
              <el-button
                  type="text"
                  class="register-btn"
                  @click="goToRegister"

              >立即注册</el-button>
            </div>
          </div>
        </div>

        <!-- 卷轴底部装饰 -->
        <div class="scroll-bottom"></div>
      </div>

      <!-- 页脚 -->
      <div class="login-footer">
        <div class="footer-content">
          <p class="copyright">
            © 2023 中医智慧平台 - 传承千年智慧，守护现代健康
          </p>
          <div class="footer-links">
            <el-button type="text" class="footer-link">帮助中心</el-button>
            <el-button type="text" class="footer-link">用户协议</el-button>
            <el-button type="text" class="footer-link">隐私政策</el-button>
            <el-button type="text" class="footer-link">联系我们</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { authAPI } from '@/api/index.js'  // 添加导入

export default {
  name: 'ChineseMedicineLogin',
  setup() {
    const store = useStore()
    const router = useRouter()
    const loginFormRef = ref(null)
    const loading = ref(false)
    const guestLoading = ref(false)

    const loginForm = reactive({
      username: '',
      password: '',
    })

    const loginRules = {
      username: [
        { required: true, message: '请输入账号', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' }
      ]
    }

    const goToRegister = () => {
      router.push('/register')
    }

    const handleLogin = async () => {
      if (!loginFormRef.value) return

      try {
        const valid = await loginFormRef.value.validate()
        if (!valid) return

        loading.value = true

        console.log('开始真实登录...')
        console.log('登录前 localStorage 状态:', {
          token: localStorage.getItem('token'),
          user: localStorage.getItem('user')
        })

        // 调用真实登录接口
        const loginResponse = await authAPI.login({
          username: loginForm.username.trim(),
          password: loginForm.password
        })

        console.log('登录响应:', loginResponse)
        console.log('完整的登录响应数据:', JSON.stringify(loginResponse, null, 2))

        // 根据日志，正确的路径是：loginResponse.data.data.access_token
        const token = loginResponse.data?.data?.access_token

        console.log('获取到的token:', token ? token.substring(0, 20) + '...' : 'null')

        if (token) {
          localStorage.setItem('token', token)
          console.log('保存token到localStorage后立即读取:', localStorage.getItem('token')?.substring(0, 20) + '...')
        } else {
          console.error('token为空！响应结构:', loginResponse)
          ElMessage.error('登录失败：未获取到token')
          return
        }

        // 保存refresh token
        const refreshToken = loginResponse.data?.data?.refresh_token
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken)
        }

        // 保存用户信息
        const userInfo = loginResponse.data?.data?.user
        console.log('用户信息:', userInfo)
        if (userInfo) {
          localStorage.setItem('user', JSON.stringify(userInfo))
          console.log('保存用户信息后立即读取:', localStorage.getItem('user'))
          // 更新store
          await store.dispatch('login', userInfo)
        }

        ElMessage.success('登录成功！')

        // 等待一小段时间确保状态已保存
        await new Promise(resolve => setTimeout(resolve, 50))

        console.log('跳转前最终的localStorage状态:', {
          token: localStorage.getItem('token'),
          user: localStorage.getItem('user')
        })

        // 跳转到首页
        console.log('执行路由跳转到 /dashboard')
        router.push('/dashboard').catch(err => {
          console.error('路由跳转失败:', err)
          // 如果路由跳转失败，尝试强制刷新
          window.location.href = '/dashboard'
        })
      } catch (error) {
        console.error('登录失败:', error)
        if (error.response) {
          console.error('登录失败详情:', error.response.data)
          ElMessage.error(error.response.data?.message || '登录失败，请检查账号密码')
        } else {
          ElMessage.error('网络错误，请稍后重试')
        }
      } finally {
        loading.value = false
      }
    }

    const handleGuestLogin = async () => {
      guestLoading.value = true
      try {
        console.log('开始游客登录...')

        // 模拟登录成功
        await new Promise(resolve => setTimeout(resolve, 800))

        const userInfo = {
          username: 'guest-user',
          name: '游客用户',
          role: '游客',
          avatar: '',
          permissions: ['dashboard', 'knowledge', 'simulation']
        }

        await store.dispatch('login', userInfo)
        console.log('游客登录成功，准备跳转...')
        ElMessage.success('游客登录成功！')

        // 跳转到首页
        setTimeout(() => {
          router.push('/dashboard').then(() => {
            console.log('游客登录跳转成功')
          }).catch(err => {
            console.error('游客登录跳转失败:', err)
            window.location.href = '/dashboard'
          })
        }, 100)

      } catch (error) {
        console.error('游客登录失败:', error)
        ElMessage.error('登录失败')
      } finally {
        guestLoading.value = false
      }
    }

    onMounted(() => {
      console.log('Login component mounted')

      // 检查是否已登录 - 使用正确的键名
      const token = localStorage.getItem('token')
      if (token) {
        console.log('已登录，自动跳转到首页')
        router.push('/dashboard')
      }
    })

    return {
      loginFormRef,
      loading,
      guestLoading,
      loginForm,
      loginRules,
      handleLogin,
      handleGuestLogin,
      goToRegister
    }
  }
}
</script>

<style scoped lang="scss">
.chinese-medicine-login {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  font-family: "Microsoft YaHei", "SimSun", serif;

  // 背景层
  .login-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;

    .bg-texture {
      position: absolute;
      width: 100%;
      height: 100%;
      background:
          linear-gradient(135deg, #f5e6d3 0%, #e8d5b5 100%),
          url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" opacity="0.1"><rect fill="none" stroke="%238B4513" stroke-width="2" x="10" y="10" width="80" height="80"/></svg>');
      background-size: cover, 200px 200px;
    }

    .bg-pattern {
      position: absolute;
      width: 100%;
      height: 100%;
      background-image:
          radial-gradient(circle at 20% 80%, rgba(139, 69, 19, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(139, 69, 19, 0.1) 0%, transparent 50%);
    }

    .bg-herbs {
      position: absolute;
      width: 100%;
      height: 100%;
      background-image:
          url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" opacity="0.05"><path d="M30,20 Q50,5 70,20 T90,40 T70,60 T50,80 T30,60 T10,40 T30,20" fill="none" stroke="%238B4513" stroke-width="1"/></svg>');
      background-size: 300px 300px;
    }
  }

  // 主容器
  .login-container {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
  }

  // 顶部标题
  .login-header {
    text-align: center;
    margin-bottom: 40px;

    .platform-title {
      font-size: 42px;
      font-weight: bold;
      color: #8B4513;
      margin: 0 0 16px 0;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
      letter-spacing: 6px;
      line-height: 1.2;
    }

    .platform-subtitle {
      font-size: 18px;
      color: #A0522D;
      margin: 0;
      letter-spacing: 3px;
      line-height: 1.5;
    }
  }

  // 卷轴式登录框
  .scroll-login-box {
    width: 100%;
    max-width: 500px;
    position: relative;
    margin: 0 auto;

    .scroll-top, .scroll-bottom {
      height: 30px;
      background:
          linear-gradient(90deg, #8B4513, #A0522D, #8B4513),
          url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="30" opacity="0.8"><rect width="20" height="30" fill="%238B4513"/><circle cx="10" cy="15" r="6" fill="%23D2691E"/></svg>');
      background-size: auto, 20px 30px;
      border-radius: 8px 8px 0 0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .scroll-bottom {
      border-radius: 0 0 8px 8px;
    }

    .login-content {
      background:
          linear-gradient(to bottom, #f9f3e9, #f5e6d3),
          url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" opacity="0.05"><rect width="100" height="100" fill="none" stroke="%238B4513" stroke-width="1"/></svg>');
      background-size: cover, 50px 50px;
      padding: 40px 30px;
      border-left: 8px solid #8B4513;
      border-right: 8px solid #8B4513;
      box-shadow:
          inset 0 0 20px rgba(139, 69, 19, 0.1),
          0 8px 32px rgba(0, 0, 0, 0.15);
    }
  }

  // 表单区域
  .form-section {
    .login-form {
      .form-item {
        margin-bottom: 24px;

        &.ancient-style {
          border: 1px solid #D2B48C;
          border-radius: 8px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.8);
          position: relative;

          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent, #8B4513, transparent);
          }
        }

        .input-label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          color: #8B4513;
          font-weight: bold;
          font-size: 16px;

          i {
            font-size: 16px;
          }
        }

        .ancient-input {
          :deep(.el-input__inner) {
            background: transparent;
            border: none;
            border-bottom: 1px solid #D2B48C;
            border-radius: 0;
            padding-left: 0;
            color: #8B4513;
            font-size: 16px;
            height: 40px;
            line-height: 40px;

            &:focus {
              border-bottom-color: #8B4513;
              box-shadow: none;
            }

            &::placeholder {
              color: #CD853F;
            }
          }

          .ancient-icon {
            color: #8B4513;
          }
        }
      }

      .login-btn {
        width: 100%;
        background: linear-gradient(135deg, #8B4513, #A0522D);
        border: none;
        border-radius: 25px;
        color: #f5e6d3;
        font-size: 18px;
        font-weight: bold;
        height: 50px;
        box-shadow: 0 4px 15px rgba(139, 69, 19, 0.3);
        transition: all 0.3s ease;
        margin-top: 10px;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(139, 69, 19, 0.4);
          background: linear-gradient(135deg, #A0522D, #8B4513);
        }

        &:active {
          transform: translateY(0);
        }
      }

      .guest-login-btn {
        width: 100%;
        background: transparent;
        border: 2px solid #8B4513;
        border-radius: 25px;
        color: #8B4513;
        font-size: 16px;
        font-weight: bold;
        height: 50px;
        transition: all 0.3s ease;
        margin-top: 10px;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(139, 69, 19, 0.2);
          background: rgba(139, 69, 19, 0.1);
        }

        &:active {
          transform: translateY(0);
        }
      }
    }

    .register-link {
      text-align: center;
      margin-top: 20px;
      color: #A0522D;
      font-size: 14px;

      .register-btn {
        color: #8B4513;
        font-weight: bold;
        padding: 0 4px;
        font-size: 14px;

        &:hover {
          color: #A0522D;
        }
      }
    }
  }

  // 页脚
  .login-footer {
    margin-top: 40px;
    text-align: center;

    .footer-content {
      .copyright {
        color: #8B4513;
        margin: 0 0 16px 0;
        font-size: 14px;
        line-height: 1.5;
      }

      .footer-links {
        display: flex;
        justify-content: center;
        gap: 24px;
        flex-wrap: wrap;

        .footer-link {
          color: #A0522D;
          padding: 4px 8px;
          font-size: 14px;

          &:hover {
            color: #8B4513;
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .chinese-medicine-login {
    .login-header {
      .platform-title {
        font-size: 32px;
        letter-spacing: 4px;
      }

      .platform-subtitle {
        font-size: 16px;
        letter-spacing: 2px;
      }
    }

    .scroll-login-box {
      max-width: 90%;

      .login-content {
        padding: 30px 20px;
      }
    }

    .footer-links {
      gap: 16px !important;
    }
  }
}

@media (max-width: 480px) {
  .chinese-medicine-login {
    .login-container {
      padding: 20px 16px;
    }

    .login-header {
      margin-bottom: 30px;

      .platform-title {
        font-size: 28px;
        letter-spacing: 2px;
      }

      .platform-subtitle {
        font-size: 14px;
      }
    }
  }
}

// 动画效果
@keyframes scrollUnroll {
  0% {
    transform: scaleY(0);
    opacity: 0;
  }
  100% {
    transform: scaleY(1);
    opacity: 1;
  }
}

.scroll-login-box {
  animation: scrollUnroll 0.8s ease-out;
}

// 输入框聚焦动画
.ancient-input:deep(.el-input__inner:focus) {
  animation: brushStroke 0.3s ease;
}

@keyframes brushStroke {
  0% {
    background-position: -100% 0;
  }
  100% {
    background-position: 100% 0;
  }
}
</style>