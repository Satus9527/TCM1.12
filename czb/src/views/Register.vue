<template>
  <div class="chinese-medicine-register">
    <!-- 背景层 -->
    <div class="register-bg">
      <div class="bg-texture"></div>
      <div class="bg-pattern"></div>
      <div class="bg-herbs"></div>
    </div>

    <!-- 主内容 -->
    <div class="register-container">
      <!-- 顶部标题 -->
      <div class="register-header">
        <h1 class="platform-title">智慧平台</h1>
        <p class="platform-subtitle">传承千年智慧 · 守护现代健康</p>
      </div>

      <!-- 卷轴式注册框 -->
      <div class="scroll-register-box">
        <!-- 卷轴顶部装饰 -->
        <div class="scroll-top"></div>

        <!-- 注册内容 -->
        <div class="register-content">
          <!-- 右侧表单区域 -->
          <div class="form-section">
            <el-form
                :model="registerForm"
                :rules="registerRules"
                ref="registerFormRef"
                class="register-form"
            >
              <!-- 姓名输入 -->
              <div class="form-item ancient-style">
                <div class="input-label">
                  <i class="el-icon-user"></i>
                  <span>昵称</span>
                </div>
                <el-form-item prop="name">
                  <el-input
                      v-model="registerForm.name"
                      placeholder="请输入您的昵称"
                      class="ancient-input"
                      size="large"
                  >
                    <template #prefix>
                      <i class="el-icon-user ancient-icon"></i>
                    </template>
                  </el-input>
                </el-form-item>
              </div>

              <!-- 账号输入 -->
              <div class="form-item ancient-style">
                <div class="input-label">
                  <i class="el-icon-mobile-phone"></i>
                  <span>手机号</span>
                </div>
                <el-form-item prop="phone">
                  <el-input
                      v-model="registerForm.phone"
                      placeholder="请输入您的手机号"
                      class="ancient-input"
                      size="large"
                  >
                    <template #prefix>
                      <i class="el-icon-mobile-phone ancient-icon"></i>
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
                      v-model="registerForm.password"
                      type="password"
                      placeholder="请设置登录密码"
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

              <!-- 确认密码 -->
              <div class="form-item ancient-style">
                <div class="input-label">
                  <i class="el-icon-check"></i>
                  <span>确认密码</span>
                </div>
                <el-form-item prop="confirmPassword">
                  <el-input
                      v-model="registerForm.confirmPassword"
                      type="password"
                      placeholder="请再次输入密码"
                      class="ancient-input"
                      size="large"
                      show-password
                  >
                    <template #prefix>
                      <i class="el-icon-check ancient-icon"></i>
                    </template>
                  </el-input>
                </el-form-item>
              </div>

              <!-- 注册按钮 -->
              <el-form-item>
                <el-button
                    type="primary"
                    class="register-btn ancient-btn"
                    :loading="loading"
                    @click="handleRegister"
                    size="large"
                >
                  <i class="el-icon-edit"></i>
                  立即注册
                </el-button>
              </el-form-item>
            </el-form>

            <!-- 登录链接 -->
            <div class="login-link">
              <span>已有账号？</span>
              <el-button type="text" class="login-btn" @click="goToLogin">立即登录</el-button>
            </div>
          </div>
        </div>

        <!-- 卷轴底部装饰 -->
        <div class="scroll-bottom"></div>
      </div>

      <!-- 页脚 -->
      <div class="register-footer">
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
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

export default {
  name: 'ChineseMedicineRegister',
  setup() {
    const router = useRouter()
    const registerFormRef = ref(null)
    const loading = ref(false)

    const registerForm = reactive({
      name: '',
      phone: '',
      password: '',
      confirmPassword: ''
    })

    const validateConfirmPassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== registerForm.password) {
        callback(new Error('两次输入密码不一致'))
      } else {
        callback()
      }
    }

    const registerRules = {
      name: [
        { required: true, message: '请输入昵称', trigger: 'blur' },
        { min: 1, max: 10, message: '昵称长度在 1 到 10 个字符', trigger: 'blur' }
      ],
      phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, validator: validateConfirmPassword, trigger: 'blur' }
      ]
    }

    const handleRegister = async () => {
      if (!registerFormRef.value) return

      try {
        const valid = await registerFormRef.value.validate()
        if (!valid) return

        loading.value = true

        // 模拟注册成功
        await new Promise(resolve => setTimeout(resolve, 1500))

        console.log('注册成功')
        ElMessage.success('注册成功！')

        // 跳转到登录页面
        setTimeout(() => {
          router.push('/login')
        }, 1000)

      } catch (error) {
        console.error('注册失败:', error)
        ElMessage.error('注册失败，请检查信息')
      } finally {
        loading.value = false
      }
    }

    const goToLogin = () => {
      router.push('/login')
    }

    onMounted(() => {
      console.log('Register component mounted')
    })

    return {
      registerFormRef,
      loading,
      registerForm,
      registerRules,
      handleRegister,
      goToLogin
    }
  }
}
</script>

<style scoped lang="scss">
.chinese-medicine-register {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  font-family: "Microsoft YaHei", "SimSun", serif;

  // 背景层
  .register-bg {
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
  .register-container {
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
  .register-header {
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

  // 卷轴式注册框
  .scroll-register-box {
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

    .register-content {
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
    .register-form {
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

      .register-btn {
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
    }

    .login-link {
      text-align: center;
      margin-top: 20px;
      color: #A0522D;
      font-size: 14px;

      .login-btn {
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
  .register-footer {
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
  .chinese-medicine-register {
    .register-header {
      .platform-title {
        font-size: 32px;
        letter-spacing: 4px;
      }

      .platform-subtitle {
        font-size: 16px;
        letter-spacing: 2px;
      }
    }

    .scroll-register-box {
      max-width: 90%;

      .register-content {
        padding: 30px 20px;
      }
    }

    .footer-links {
      gap: 16px !important;
    }
  }
}

@media (max-width: 480px) {
  .chinese-medicine-register {
    .register-container {
      padding: 20px 16px;
    }

    .register-header {
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

.scroll-register-box {
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